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
        imagepath: t.imagepath,
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
      imagepath,
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
};
