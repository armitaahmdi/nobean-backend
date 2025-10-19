const request = require('supertest');
const app = require('../server'); // فرض بر این که server.js export می‌کند

describe('Articles API', () => {
  let authToken;
  let testArticleId;

  beforeAll(async () => {
    // دریافت توکن احراز هویت برای تست‌های ادمین
    const loginResponse = await request(app)
      .post('/api/v1/users/login')
      .send({
        phone: '09198718211', // شماره ادمین
        password: 'password'
      });
    
    authToken = loginResponse.body.token;
  });

  describe('GET /api/v1/articles', () => {
    it('should return list of articles', async () => {
      const response = await request(app)
        .get('/api/v1/articles')
        .expect(200);

      expect(response.body).toHaveProperty('articles');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('page');
      expect(response.body).toHaveProperty('totalPages');
      expect(Array.isArray(response.body.articles)).toBe(true);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/v1/articles?page=1&limit=5')
        .expect(200);

      expect(response.body.page).toBe(1);
      expect(response.body.articles.length).toBeLessThanOrEqual(5);
    });

    it('should support category filtering', async () => {
      const response = await request(app)
        .get('/api/v1/articles?category=روانشناسی')
        .expect(200);

      response.body.articles.forEach(article => {
        expect(article.category).toBe('روانشناسی');
      });
    });

    it('should support search', async () => {
      const response = await request(app)
        .get('/api/v1/articles?search=برنامه')
        .expect(200);

      expect(response.body.articles.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/v1/articles/:id', () => {
    it('should return article by id', async () => {
      // ابتدا لیست مقالات را دریافت می‌کنیم
      const listResponse = await request(app)
        .get('/api/v1/articles')
        .expect(200);

      if (listResponse.body.articles.length > 0) {
        const articleId = listResponse.body.articles[0].id;
        
        const response = await request(app)
          .get(`/api/v1/articles/${articleId}`)
          .expect(200);

        expect(response.body).toHaveProperty('id', articleId);
        expect(response.body).toHaveProperty('title');
        expect(response.body).toHaveProperty('contentSections');
      }
    });

    it('should return 404 for non-existent article', async () => {
      await request(app)
        .get('/api/v1/articles/99999')
        .expect(404);
    });
  });

  describe('GET /api/v1/articles/search', () => {
    it('should search articles', async () => {
      const response = await request(app)
        .get('/api/v1/articles/search?q=برنامه')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('Admin Routes', () => {
    describe('POST /api/v1/admin/articles', () => {
      it('should create new article', async () => {
        const articleData = {
          title: 'مقاله تست',
          excerpt: 'خلاصه مقاله تست',
          description: 'توضیحات کامل مقاله تست',
          author: 'تست نویس',
          category: 'تست',
          readingTime: 3,
          tags: ['تست', 'مقاله'],
          contentSections: [
            {
              type: 'heading',
              level: 2,
              text: 'عنوان بخش'
            },
            {
              type: 'text',
              text: 'محتوای متن تست'
            }
          ],
          faqs: [
            {
              question: 'سوال تست',
              answer: 'پاسخ تست'
            }
          ],
          reviews: []
        };

        const response = await request(app)
          .post('/api/v1/admin/articles')
          .set('Authorization', `Bearer ${authToken}`)
          .send(articleData)
          .expect(201);

        expect(response.body).toHaveProperty('message');
        expect(response.body).toHaveProperty('article');
        expect(response.body.article.title).toBe(articleData.title);
        
        testArticleId = response.body.article.id;
      });

      it('should require authentication', async () => {
        await request(app)
          .post('/api/v1/admin/articles')
          .send({ title: 'تست' })
          .expect(401);
      });

      it('should validate required fields', async () => {
        await request(app)
          .post('/api/v1/admin/articles')
          .set('Authorization', `Bearer ${authToken}`)
          .send({ title: 'فقط عنوان' })
          .expect(400);
      });
    });

    describe('PUT /api/v1/admin/articles/:id', () => {
      it('should update article', async () => {
        if (testArticleId) {
          const updateData = {
            title: 'مقاله تست ویرایش شده',
            excerpt: 'خلاصه ویرایش شده'
          };

          const response = await request(app)
            .put(`/api/v1/admin/articles/${testArticleId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .send(updateData)
            .expect(200);

          expect(response.body.message).toContain('به‌روزرسانی شد');
          expect(response.body.article.title).toBe(updateData.title);
        }
      });

      it('should return 404 for non-existent article', async () => {
        await request(app)
          .put('/api/v1/admin/articles/99999')
          .set('Authorization', `Bearer ${authToken}`)
          .send({ title: 'تست' })
          .expect(404);
      });
    });

    describe('DELETE /api/v1/admin/articles/:id', () => {
      it('should delete article', async () => {
        if (testArticleId) {
          const response = await request(app)
            .delete(`/api/v1/admin/articles/${testArticleId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .expect(200);

          expect(response.body.message).toContain('حذف شد');
        }
      });

      it('should return 404 for non-existent article', async () => {
        await request(app)
          .delete('/api/v1/admin/articles/99999')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(404);
      });
    });

    describe('GET /api/v1/admin/articles/stats', () => {
      it('should return article statistics', async () => {
        const response = await request(app)
          .get('/api/v1/admin/articles/stats')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('total');
        expect(response.body).toHaveProperty('published');
        expect(response.body).toHaveProperty('draft');
        expect(response.body).toHaveProperty('categories');
        expect(Array.isArray(response.body.categories)).toBe(true);
      });
    });

    describe('GET /api/v1/admin/articles/recent', () => {
      it('should return recent articles', async () => {
        const response = await request(app)
          .get('/api/v1/admin/articles/recent?limit=3')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeLessThanOrEqual(3);
        
        if (response.body.length > 0) {
          expect(response.body[0]).toHaveProperty('id');
          expect(response.body[0]).toHaveProperty('title');
          expect(response.body[0]).toHaveProperty('createdAt');
        }
      });
    });
  });

  describe('Content Sections Validation', () => {
    it('should validate content section types', async () => {
      const articleData = {
        title: 'مقاله تست محتوا',
        excerpt: 'خلاصه',
        description: 'توضیحات',
        contentSections: [
          {
            type: 'heading',
            level: 2,
            text: 'تیتر'
          },
          {
            type: 'text',
            text: 'متن'
          },
          {
            type: 'image',
            src: 'https://example.com/image.jpg',
            alt: 'تصویر',
            caption: 'زیرنویس'
          },
          {
            type: 'list',
            ordered: false,
            items: ['آیتم 1', 'آیتم 2']
          },
          {
            type: 'blockquote',
            text: 'نقل‌قول',
            author: 'نویسنده'
          },
          {
            type: 'video',
            src: 'https://example.com/video.mp4',
            caption: 'ویدیو'
          }
        ]
      };

      const response = await request(app)
        .post('/api/v1/admin/articles')
        .set('Authorization', `Bearer ${authToken}`)
        .send(articleData)
        .expect(201);

      expect(response.body.article.contentSections).toHaveLength(6);
      
      // پاک کردن مقاله تست
      if (response.body.article.id) {
        await request(app)
          .delete(`/api/v1/admin/articles/${response.body.article.id}`)
          .set('Authorization', `Bearer ${authToken}`);
      }
    });
  });
});

// تست‌های یکپارچگی
describe('Articles Integration Tests', () => {
  it('should maintain data consistency', async () => {
    // ایجاد مقاله
    const createResponse = await request(app)
      .post('/api/v1/admin/articles')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'مقاله یکپارچگی',
        excerpt: 'خلاصه',
        description: 'توضیحات',
        contentSections: [
          { type: 'heading', level: 1, text: 'عنوان اصلی' },
          { type: 'text', text: 'محتوای اصلی' }
        ]
      })
      .expect(201);

    const articleId = createResponse.body.article.id;

    // بررسی وجود در لیست عمومی
    const listResponse = await request(app)
      .get('/api/v1/articles')
      .expect(200);

    const foundArticle = listResponse.body.articles.find(a => a.id === articleId);
    expect(foundArticle).toBeDefined();
    expect(foundArticle.title).toBe('مقاله یکپارچگی');

    // بررسی جزئیات
    const detailResponse = await request(app)
      .get(`/api/v1/articles/${articleId}`)
      .expect(200);

    expect(detailResponse.body.title).toBe('مقاله یکپارچگی');
    expect(detailResponse.body.contentSections).toHaveLength(2);

    // پاک کردن
    await request(app)
      .delete(`/api/v1/admin/articles/${articleId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
  });
});
