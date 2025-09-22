const express = require("express")
const db = require('../model/index');
const { where } = require("sequelize");

const test = db.Exam
const question = db.Question
const categoryTest = db.CategoryTest
const Items = db.Item
const userTest = db.UserTest
const Comment = db.Comment
const User = db.User;
const ExamResult = db.ExamResult;


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

// submit exam
exports.submitExam = async (req, res) => {
  try {
    const { id: examId } = req.params; // examId از URL
    const { answers, timeSpent } = req.body; // answers: { questionId: selectedIndex }
    const userId = req.user.id; // از JWT middleware

    // پیدا کردن آزمون همراه با سوال‌ها و گزینه‌ها
    const exam = await test.findByPk(examId, {
      include: [{ model: question, include: [{ model: Items, as: 'Items' }] }]
    });

    if (!exam) return res.status(404).json({ error: 'آزمون پیدا نشد' });

    const questions = exam.Questions;

    if (!questions || questions.length === 0)
      return res.status(400).json({ error: 'این آزمون سوالی ندارد' });

    // محاسبه تعداد پاسخ صحیح
    let correctAnswersCount = 0;

    questions.forEach(q => {
      const userAnswer = answers[q.id];
      const correctIndex = q.Items && q.Items.length > 0 ? q.Items[0].correctIndex : null;
      if (userAnswer === correctIndex) correctAnswersCount++;
    });

    const totalQuestions = questions.length;
    const score = Math.round((correctAnswersCount / totalQuestions) * 100);

    // ذخیره یا بروزرسانی رکورد UserTest
    await userTest.upsert({
      userId,
      examId,
      answers,
      score,
      correctAnswers: correctAnswersCount,
      totalQuestions,
      timeSpent: timeSpent || 0,
      status: 'completed',
      completedAt: new Date()
    });

    // گرفتن رکورد برای ارسال در پاسخ
    const userTestRecord = await userTest.findOne({
      where: { userId, examId }
    });

    res.status(200).json({
      message: 'آزمون با موفقیت ثبت شد',
      result: {
        score: userTestRecord.score,
        correctAnswers: userTestRecord.correctAnswers,
        totalQuestions: userTestRecord.totalQuestions,
        completedAt: userTestRecord.completedAt,
        timeSpent: userTestRecord.timeSpent
      }
    });

  } catch (error) {
    console.error('Error submitExam:', error);
    res.status(500).json({ error: 'خطا در ثبت آزمون' });
  }
};

// get exam result
exports.getExamResult = async (req, res) => {
  try {
    const { id: examId } = req.params;
    const userId = req.user.id;

    // پیدا کردن نتیجه آزمون همراه با اطلاعات کاربر
    const userTestResult = await userTest.findOne({
      where: { userId, examId },
      include: [
        {
          model: User,
          attributes: ['id', 'firstName', 'lastName', 'email'] // فیلدهای کاربر که میخوای برگرده
        }
      ]
    });

    if (!userTestResult) {
      return res.status(404).json({ error: "نتیجه آزمون یافت نشد" });
    }

    res.status(200).json({
      message: "نتیجه آزمون دریافت شد",
      result: {
        user: userTestResult.User, // اطلاعات کاربر
        score: userTestResult.score,
        correctAnswers: userTestResult.correctAnswers,
        totalQuestions: userTestResult.totalQuestions,
        completedAt: userTestResult.completedAt,
        timeSpent: userTestResult.timeSpent,
        answers: userTestResult.answers // پاسخ‌های کاربر
      }
    });

  } catch (error) {
    console.error("خطا در دریافت نتیجه آزمون:", error);
    res.status(500).json({ message: "خطا در دریافت نتیجه آزمون" });
  }
};

