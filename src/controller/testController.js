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
      order: [['createdAt', 'DESC']],
      limit: 100
    })
    res.status(200).json(tests)
  } catch (error) {
    res.status(500).json({ error: "مشکلی در دریافت تست‌ها به وجود آمد." })
  }
}

exports.createTest = async (req, res) => {
  try {
    const {
      title,
      time,
      date,
      mainDescription,
      ShortDescription,
      target_audience,
      price,
      category,
      imagepath,
      suitableFor,
      tags
    } = req.body;

    // اعتبارسنجی ورودی
    if (!title || !time || !date || !mainDescription || !ShortDescription || !target_audience || !price || !category || !suitableFor) {
      return res.status(400).json({ error: "لطفاً تمام فیلدها را پر کنید." });
    }

    const newTest = await test.create({
      title,
      time,
      date,
      mainDescription,
      ShortDescription,
      target_audience,
      price,
      category,
      imagepath,
      suitableFor,
      tags
    });

    res.status(201).json({
      message: "تست با موفقیت ایجاد شد",
      test: newTest
    });
  } catch (error) {
    console.error("خطا در ایجاد تست:", error);
    res.status(500).json({ error: "مشکلی در ایجاد تست‌ها به وجود آمد." });
  }
};

exports.getTest = async (req, res) => {
  try {
    const { id } = req.params;

    const testData = await test.findByPk(id);

    if (!testData) {
      return res.status(404).json({ error: "تست مورد نظر پیدا نشد." });
    }

    // محاسبه تعداد سوالات
    const questionCount = await question.count({
      where: { examId: id }
    });

    // محاسبه تعداد شرکت‌کنندگان
    const participantCount = await userTest.count({
      where: { examId: id }
    });

    const response = {
      ...testData.toJSON(),
      question_count: questionCount,
      participantCount: participantCount
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("خطا در پیدا کردن تست:", error);
    res.status(500).json({ error: "مشکلی در پیدا کردن تست به وجود آمده" });
  }
};

exports.deleteTest = async (req, res) => {
  try {
    const { id } = req.params;

    const testToDelete = await test.findByPk(id);
    if (!testToDelete) {
      return res.status(404).json({ message: "تستی با این شناسه یافت نشد." });
    }

    await testToDelete.destroy();
    res.status(200).json({ message: "تست با موفقیت حذف شد." });
  } catch (error) {
    console.error("خطا در حذف تست:", error);
    res.status(500).json({ message: "خطایی در حذف تست رخ داد." });
  }
};

exports.createTestQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, items, correctIndex } = req.body;

    // اعتبارسنجی ورودی
    if (!title || !items || !Array.isArray(items) || correctIndex === undefined) {
      return res.status(400).json({ error: "اطلاعات ناقص است" });
    }

    if (correctIndex < 0 || correctIndex >= items.length) {
      return res.status(400).json({ error: "اندیس پاسخ صحیح نامعتبر است" });
    }

    // ایجاد سوال
    const newQuestion = await question.create({
      examId: id,
      title: title
    });

    // ایجاد گزینه‌ها
    const newItems = await Items.create({
      questionId: newQuestion.id,
      items: items,
      correctIndex: correctIndex
    });

    res.status(200).json({
      message: "سوال با موفقیت ثبت شد",
      question: {
        id: newQuestion.id,
        examId: newQuestion.examId,
        title: newQuestion.title
      },
      options: {
        questionId: newItems.questionId,
        items: newItems.items,
        correctIndex: newItems.correctIndex
      }
    });

  } catch (error) {
    console.error("خطا در سرور برای ساخت سوال:", error);
    res.status(500).json({ message: "سوال ثبت نشد لطفا دوباره امتحان کنید" });
  }
};

exports.showQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    const questions = await question.findAll({
      where: { examId: id },
      include: [
        {
          model: Items,
          as: 'Items'
        }
      ]
    });

    res.status(200).json({ questions });
  } catch (error) {
    console.error("خطا در سرور برای دریافت سوالات:", error);
    res.status(500).json({ message: "خطا در سرور برای دریافت سوالات" });
  }
};

exports.updateQuestion = async (req, res) => {
  try {
    const { id, questionId } = req.params;
    const { title, items, correctIndex } = req.body;

    // اعتبارسنجی ورودی
    if (!title || !items || !Array.isArray(items) || correctIndex === undefined) {
      return res.status(400).json({ error: "اطلاعات ناقص است" });
    }

    if (correctIndex < 0 || correctIndex >= items.length) {
      return res.status(400).json({ error: "اندیس پاسخ صحیح نامعتبر است" });
    }

    // بررسی وجود سوال
    const existingQuestion = await question.findOne({
      where: { 
        id: questionId,
        examId: id 
      }
    });

    if (!existingQuestion) {
      return res.status(404).json({ error: "سوال مورد نظر پیدا نشد" });
    }

    // به‌روزرسانی سوال
    await existingQuestion.update({ title });

    // به‌روزرسانی گزینه‌ها
    const existingItems = await Items.findOne({
      where: { questionId: questionId }
    });

    if (existingItems) {
      await existingItems.update({
        items: items,
        correctIndex: correctIndex
      });
    } else {
      await Items.create({
        questionId: questionId,
        items: items,
        correctIndex: correctIndex
      });
    }

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
      question: {
        id: updatedQuestion.id,
        title: updatedQuestion.title
      }
    });

  } catch (error) {
    console.error("خطا در سرور برای به‌روزرسانی سوال:", error);
    res.status(500).json({ message: "خطا در سرور برای به‌روزرسانی سوال" });
  }
};

exports.deleteQuestion = async (req, res) => {
  try {
    const { id, questionId } = req.params;

    // بررسی وجود سوال
    const existingQuestion = await question.findOne({
      where: { 
        id: questionId,
        examId: id 
      }
    });

    if (!existingQuestion) {
      return res.status(404).json({ error: "سوال مورد نظر پیدا نشد" });
    }

    // حذف گزینه‌های مربوطه
    await Items.destroy({
      where: { questionId: questionId }
    });

    // حذف سوال
    await existingQuestion.destroy();

    res.status(200).json({
      message: "سوال با موفقیت حذف شد"
    });

  } catch (error) {
    console.error("خطا در سرور برای حذف سوال:", error);
    res.status(500).json({ message: "خطا در سرور برای حذف سوال" });
  }
};

// Submit exam - ارسال آزمون
exports.submitExam = async (req, res) => {
  try {
    const { id: testId } = req.params;
    const { answers, timeSpent } = req.body;
    const userId = req.user.id;

    console.log('Submit exam request:', { testId, userId, answers, timeSpent });

    // بررسی وجود آزمون
    const existingTest = await test.findByPk(testId);
    if (!existingTest) {
      return res.status(404).json({ error: "آزمون مورد نظر پیدا نشد" });
    }

    // دریافت سوالات آزمون
    const questions = await question.findAll({
      where: { testId: testId },
      include: [{
        model: Items,
        as: 'Items'
      }]
    });

    if (!questions || questions.length === 0) {
      return res.status(400).json({ error: "این آزمون سوالی ندارد" });
    }

    // محاسبه نمره
    let correctAnswers = 0;
    const totalQuestions = questions.length;

    questions.forEach(q => {
      const userAnswer = answers[q.id];
      const correctAnswer = q.Items?.[0]?.correctIndex;
      
      if (userAnswer === correctAnswer) {
        correctAnswers++;
      }
    });

    const score = Math.round((correctAnswers / totalQuestions) * 100);

    // ذخیره یا به‌روزرسانی نتیجه آزمون
    const [userTestResult, created] = await userTest.upsert({
      userId: userId,
      testId: testId,
      answers: JSON.stringify(answers),
      score: score,
      correctAnswers: correctAnswers,
      totalQuestions: totalQuestions,
      timeSpent: timeSpent || 0,
      status: 'completed',
      completedAt: new Date()
    }, {
      where: {
        userId: userId,
        testId: testId
      }
    });

    console.log('Exam submitted successfully:', { score, correctAnswers, totalQuestions });

    res.status(200).json({
      message: "آزمون با موفقیت ارسال شد",
      result: {
        score: score,
        correctAnswers: correctAnswers,
        totalQuestions: totalQuestions,
        completedAt: userTestResult.completedAt
      }
    });

  } catch (error) {
    console.error("خطا در ارسال آزمون:", error);
    res.status(500).json({ message: "خطا در ارسال آزمون" });
  }
};

// Get exam result - دریافت نتیجه آزمون
exports.getExamResult = async (req, res) => {
  try {
    const { id: testId } = req.params;
    const userId = req.user.id;

    console.log('Get exam result request:', { testId, userId });

    // دریافت نتیجه آزمون
    const userTestResult = await userTest.findOne({
      where: {
        userId: userId,
        testId: testId
      }
    });

    if (!userTestResult) {
      return res.status(404).json({ error: "نتیجه آزمون یافت نشد" });
    }

    console.log('Exam result found:', userTestResult);

    res.status(200).json({
      message: "نتیجه آزمون دریافت شد",
      result: {
        score: userTestResult.score,
        correctAnswers: userTestResult.correctAnswers,
        totalQuestions: userTestResult.totalQuestions,
        completedAt: userTestResult.completedAt,
        timeSpent: userTestResult.timeSpent
      }
    });

  } catch (error) {
    console.error("خطا در دریافت نتیجه آزمون:", error);
    res.status(500).json({ message: "خطا در دریافت نتیجه آزمون" });
  }
};