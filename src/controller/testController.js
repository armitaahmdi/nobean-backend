const express = require("express")
const db = require('../model/index');
const { where } = require("sequelize");

const test = db.test
const question = db.Question
const categoryTest = db.Categorytest
const Items = db.Item
const userTest = db.userTest
const Comment = db.Comment
const User = db.User;


exports.getAll = async (req, res) => {
  try {

    const tests = await test.findAll({
      order: [['createdAt', 'DESC']], limit: 100
    })

    const testresult = []

    for (const t of tests) {
      const qouestions = await question.findAll({
        where: {
          examId: t.id

        }
      })
      const participants = await userTest.findAll({
        where: {
          examId: t.id
        }
      })


      const question_count = qouestions.length


      const participantCount = participants.length

      testresult.push({
        id: t.id,
        title: t.title,
        imagepath: t.imagePath,
        shortDescription: t.ShortDescription,
        price: t.price,
        target_audience: t.target_audience,
        category: t.category,
        time: t.time,
        question_count,
        participantCount,
        createdAt: t.createdAt,
        descriptionVideo: t.descriptionVideo
        //rating
      })
    }

    res.status(200).json(testresult);

  } catch (err) {
    console.error('خطا در دریافت تست‌ها:', err);
    res.status(500).json({ error: 'مشکلی در دریافت تست‌ها به وجود آمد.' });
  }
};


exports.createTest = async (req, res) => {
  try {
    const { title, time, mainDescription, ShortDescription, target_audience, price, category, imagepath, suitableFor, tags, descriptionVideo } = req.body

    if (!title || !time || !mainDescription || !ShortDescription || !target_audience || !price || !category || !suitableFor) {
      return res.status(400).json({ error: 'لطفاً تمام فیلدها را پر کنید.' });
    }

    const newTest = await test.create({
      title,
      time,
      mainDescription,
      ShortDescription,
      target_audience,
      price,
      category,
      imagePath: imagepath,
      suitableFor,
      tags,
      descriptionVideo
    });

    res.status(201).json({ message: 'تست با موفقیت ایجاد شد', test: newTest });

  } catch (err) {
    console.error('خطا در ایجاد تست‌ها:', err);
    res.status(500).json({ error: 'مشکلی در ایجاد تست‌ها به وجود آمد.' });
  }
}


exports.getTest = async (req, res) => {

  try {
    const id = req.params.id
    const qouestions = await question.findAll({
      where: {
        examId: id
      }
    })
    const question_count = qouestions.length


    const participants = await userTest.findAll({
      where: {
        examId: id
      }
    })

    const participantCount = participants.length


    const categrys = await categoryTest.findAll({ where: { testId: id } })



    const testData = await test.findOne({
      where: { id },
      attributes: ['id', 'title', 'time', 'ShortDescription', 'mainDescription', 'imagePath', 'participants', 'target_audience', 'price', 'category', 'suitablefor', 'tags', 'createdAt', 'descriptionVideo']
    });

    if (!testData) {
      return res.status(404).json({ error: 'تست مورد نظر پیدا نشد.' });
    }
    const comments = await Comment.findAll({
      where: {
        section_type: "test",
        section_id: id,
      },
      include: [
        {
          model: User, // اگه می‌خوای نام کاربر هم بیاد
          attributes: ["id", "username"],
        },
      ],
      order: [["createdAt", "DESC"]], // آخرین کامنت‌ها بیاد بالا
    });
    const result = {
      ...testData.toJSON(),
      question_count,
      categrys,
      participantCount,
      comments
    };

    res.status(200).json(result);

  } catch (err) {
    console.error('خطا در پیدا کردن ', err);
    res.status(500).json({ error: 'مشکلی در پیدا کردن تست به وجود آمده' })

  }

}

exports.deleteTest = async (req, res) => {
  try {
    const { id } = req.params;

    // بررسی وجود تست
    const existingTest = await test.findByPk(id);
    if (!existingTest) {
      return res.status(404).json({ message: 'تستی با این شناسه یافت نشد.' });
    }

    // حذف تست
    await existingTest.destroy();

    return res.status(200).json({ message: 'تست با موفقیت حذف شد.' });
  } catch (error) {
    console.error('خطا در حذف تست:', error);
    return res.status(500).json({ message: 'خطایی در حذف تست رخ داد.' });
  }
};


exports.createTestQuestion = async (req, res) => {

  try {
    const { id } = req.params
    const { title, items, correctIndex } = req.body

    if (!title || !Array.isArray(items) || items.length === 0 || correctIndex === undefined) {
      return res.status(400).json({ error: "اطلاعات ناقص است" });
    }

    if (correctIndex < 0 || correctIndex >= items.length) {
      return res.status(400).json({ error: "اندیس گزینه صحیح نامعتبر است" });
    }

    const createQuestion = await question.create({
      examId: id,
      title
    })
    if (!createQuestion) {
      return res.status(401).json({ message: 'سوال ثبت نشد لطفا دوباره امتحان کنید ' })
    }

    const createItems = await Items.create({
      questionId: createQuestion.id,
      items,
      correctIndex
    })

    if (!createItems) {
      return res.status(401).json({ message: 'جواب ثبت نشد لطفا دوباره امتحان کنید ' })
    }

    res.status(200).json({
      message: "سوال با موفقیت ثبت شد",
      question: createQuestion,
      options: createItems
    });

  } catch (error) {
    console.error('خطا در سرور برای ساخت سوال  :', error);
    return res.status(500).json({ message: 'خطا در سرور برای ساخت سوال ' });
  }

}


exports.showQuestion = async (req, res) => {
  try {
    const { id: examId } = req.params;

    // پیدا کردن سوال‌هایی که متعلق به این امتحان هستن به همراه جواب‌هاشون
    const questions = await question.findAll({
      where: { examId }, // سوالاتی که متعلق به این امتحان هستن
      include: [
        {
          model: Items,
          as: 'Items', // اگر در Association تعریف کردی که Question hasMany Items as: 'items'
        }
      ]
    });

    return res.status(200).json({ questions });

  } catch (error) {
    console.error('خطا در سرور برای نمایش سوالات:', error);
    return res.status(500).json({ message: 'خطا در سرور برای نمایش سوالات' });
  }
}

exports.updateQuestion = async (req, res) => {
  try {
    const { id: examId, questionId } = req.params;
    const { title, items, correctIndex } = req.body;

    // اعتبارسنجی ورودی
    if (!title || !items || !Array.isArray(items) || correctIndex === undefined) {
      return res.status(400).json({ error: 'اطلاعات ناقص است' });
    }

    if (correctIndex < 0 || correctIndex >= items.length) {
      return res.status(400).json({ error: 'اندیس پاسخ صحیح نامعتبر است' });
    }

    // بررسی وجود سوال
    const existingQuestion = await question.findOne({
      where: { 
        id: questionId,
        examId: examId 
      }
    });

    if (!existingQuestion) {
      return res.status(404).json({ error: 'سوال مورد نظر پیدا نشد' });
    }

    // به‌روزرسانی سوال
    await question.update(
      { title },
      { where: { id: questionId } }
    );

    // به‌روزرسانی گزینه‌ها
    await Items.update(
      { items, correctIndex },
      { where: { questionId: questionId } }
    );

    // دریافت سوال به‌روزرسانی شده
    const updatedQuestion = await question.findByPk(questionId, {
      include: [
        {
          model: Items,
          as: 'Items'
        }
      ]
    });

    res.status(200).json({
      message: "سوال با موفقیت به‌روزرسانی شد",
      question: updatedQuestion
    });

  } catch (error) {
    console.error('خطا در سرور برای به‌روزرسانی سوال:', error);
    return res.status(500).json({ message: 'خطا در سرور برای به‌روزرسانی سوال' });
  }
}

exports.deleteQuestion = async (req, res) => {
  try {
    const { id: examId, questionId } = req.params;

    // بررسی وجود سوال
    const existingQuestion = await question.findOne({
      where: { 
        id: questionId,
        examId: examId 
      }
    });

    if (!existingQuestion) {
      return res.status(404).json({ error: 'سوال مورد نظر پیدا نشد' });
    }

    // حذف گزینه‌ها
    await Items.destroy({
      where: { questionId: questionId }
    });

    // حذف سوال
    await question.destroy({
      where: { id: questionId }
    });

    res.status(200).json({
      message: "سوال با موفقیت حذف شد"
    });

  } catch (error) {
    console.error('خطا در سرور برای حذف سوال:', error);
    return res.status(500).json({ message: 'خطا در سرور برای حذف سوال' });
  }
};

exports.submitExam = async (req, res) => {
  try {
    const { testId } = req.params;
    const { answers } = req.body;
    const userId = req.user?.id;

    console.log('Submit exam request:', { testId, answers, userId });

    // اعتبارسنجی ورودی
    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ error: 'پاسخ‌ها باید آرایه باشند' });
    }

    if (!userId) {
      return res.status(401).json({ error: 'کاربر احراز هویت نشده است' });
    }

    // دریافت سوالات آزمون
    const questions = await question.findAll({
      where: { examId: testId },
      include: [
        {
          model: Items,
          as: 'Items'
        }
      ]
    });

    if (questions.length === 0) {
      return res.status(404).json({ error: 'آزمون مورد نظر پیدا نشد' });
    }

    // محاسبه نمره
    let correctAnswers = 0;
    const processedAnswers = questions.map((q, index) => {
      const correctIndex = q.Items?.[0]?.correctIndex || 0;
      const userAnswer = answers[index];
      const correctAnswer = q.Items?.[0]?.items?.[correctIndex];
      const isCorrect = userAnswer === correctAnswer;
      
      if (isCorrect) {
        correctAnswers++;
      }
      
      return {
        questionId: q.id,
        userAnswer: userAnswer,
        correctAnswer: correctAnswer,
        isCorrect: isCorrect
      };
    });

    const score = Math.round((correctAnswers / questions.length) * 100);

    console.log('Calculated score:', { score, correctAnswers, totalQuestions: questions.length });

    // ذخیره نتیجه آزمون - ساده شده
    try {
      const examResult = await userTest.create({
        examId: parseInt(testId),
        userId: parseInt(userId),
        answers: JSON.stringify(processedAnswers),
        score: score
      });

      console.log('Exam result created:', examResult);

      res.status(200).json({
        message: "آزمون با موفقیت ثبت شد",
        result: {
          id: examResult.id,
          score: score,
          correctAnswers: correctAnswers,
          totalQuestions: questions.length,
          completedAt: new Date()
        }
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      res.status(500).json({ 
        message: 'خطا در ذخیره نتیجه آزمون',
        error: dbError.message 
      });
    }

  } catch (error) {
    console.error('خطا در سرور برای ثبت آزمون:', error);
    return res.status(500).json({ 
      message: 'خطا در سرور برای ثبت آزمون',
      error: error.message 
    });
  }
};

exports.getExamResult = async (req, res) => {
  try {
    const { testId } = req.params;
    const userId = req.user?.id;

    console.log('Get exam result request:', { testId, userId });

    // دریافت نتیجه آزمون کاربر
    const examResult = await userTest.findOne({
      where: { 
        examId: parseInt(testId),
        userId: parseInt(userId) 
      },
      order: [['id', 'DESC']]
    });

    if (!examResult) {
      return res.status(404).json({ error: 'نتیجه آزمون یافت نشد' });
    }

    console.log('Found exam result:', examResult);

    // محاسبه تعداد پاسخ‌های صحیح
    const answers = JSON.parse(examResult.answers);
    const correctAnswers = answers.filter(answer => answer.isCorrect).length;

    res.status(200).json({
      result: {
        id: examResult.id,
        score: examResult.score,
        correctAnswers: correctAnswers,
        totalQuestions: answers.length,
        answers: answers,
        completedAt: examResult.completedAt || new Date()
      }
    });

  } catch (error) {
    console.error('خطا در سرور برای دریافت نتیجه آزمون:', error);
    return res.status(500).json({ 
      message: 'خطا در سرور برای دریافت نتیجه آزمون',
      error: error.message 
    });
  }
};

// دریافت تمام نتایج آزمون برای پنل ادمین
exports.getExamResults = async (req, res) => {
  try {
    const { testId } = req.params;
    const { page = 1, limit = 10, search = '' } = req.query;

    // دریافت نتایج آزمون با اطلاعات کاربر
    const results = await userTest.findAndCountAll({
      where: { 
        examId: testId
      },
      include: [
        {
          model: db.User,
          as: 'User',
          attributes: ['id', 'name', 'email', 'phone']
        }
      ],
      order: [['completedAt', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    // پردازش نتایج
    const processedResults = results.rows.map(result => {
      const answers = JSON.parse(result.answers);
      const correctAnswers = answers.filter(answer => answer.isCorrect).length;
      
      return {
        id: result.id,
        userId: result.userId,
        userName: result.User?.name || 'نامشخص',
        userEmail: result.User?.email || 'نامشخص',
        userPhone: result.User?.phone || 'نامشخص',
        score: result.score,
        correctAnswers: correctAnswers,
        totalQuestions: answers.length,
        completedAt: result.completedAt,
        timeSpent: result.timeSpent,
        status: result.status
      };
    });

    res.status(200).json({
      results: processedResults,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(results.count / parseInt(limit)),
        totalResults: results.count,
        hasNext: parseInt(page) < Math.ceil(results.count / parseInt(limit)),
        hasPrev: parseInt(page) > 1
      }
    });

  } catch (error) {
    console.error('خطا در سرور برای دریافت نتایج آزمون:', error);
    return res.status(500).json({ message: 'خطا در سرور برای دریافت نتایج آزمون' });
  }
};

// دریافت آمار کلی آزمون
exports.getExamStatistics = async (req, res) => {
  try {
    const { testId } = req.params;

    // آمار کلی
    const totalAttempts = await userTest.count({
      where: { examId: testId }
    });

    const completedAttempts = await userTest.count({
      where: { 
        examId: testId,
        status: 'completed'
      }
    });

    const averageScore = await userTest.findOne({
      where: { 
        examId: testId,
        status: 'completed'
      },
      attributes: [
        [db.sequelize.fn('AVG', db.sequelize.col('score')), 'averageScore']
      ],
      raw: true
    });

    // توزیع نمرات
    const scoreDistribution = await userTest.findAll({
      where: { 
        examId: testId,
        status: 'completed'
      },
      attributes: [
        [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count'],
        [db.sequelize.fn('CASE', 
          db.sequelize.literal('WHEN score >= 90 THEN "90-100"'),
          db.sequelize.literal('WHEN score >= 80 THEN "80-89"'),
          db.sequelize.literal('WHEN score >= 70 THEN "70-79"'),
          db.sequelize.literal('WHEN score >= 60 THEN "60-69"'),
          db.sequelize.literal('ELSE "0-59"')
        ), 'scoreRange']
      ],
      group: ['scoreRange'],
      raw: true
    });

    res.status(200).json({
      statistics: {
        totalAttempts,
        completedAttempts,
        averageScore: Math.round(averageScore.averageScore || 0),
        completionRate: totalAttempts > 0 ? Math.round((completedAttempts / totalAttempts) * 100) : 0,
        scoreDistribution
      }
    });

  } catch (error) {
    console.error('خطا در سرور برای دریافت آمار آزمون:', error);
    return res.status(500).json({ message: 'خطا در سرور برای دریافت آمار آزمون' });
  }
};
