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
const { Op, fn, col, literal } = require('sequelize');


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
    const { title, items, correctIndex, weights } = req.body;

    // اعتبارسنجی ورودی
    if (!title || !items || !Array.isArray(items) || correctIndex === undefined) {
      return res.status(400).json({ error: "اطلاعات ناقص است" });
    }

    if (correctIndex < 0 || correctIndex >= items.length) {
      return res.status(400).json({ error: "اندیس پاسخ صحیح نامعتبر است" });
    }

    // اعتبارسنجی weights در صورت ارسال
    let normalizedWeights = null;
    if (weights !== undefined) {
      if (!Array.isArray(weights) || weights.length !== items.length) {
        return res.status(400).json({ error: "weights باید آرایه‌ای هم‌طول items باشد" });
      }
      // محدود به 1..5 و اعداد صحیح
      normalizedWeights = weights.map(w => {
        const v = parseInt(w, 10);
        if (isNaN(v) || v < 1 || v > 5) return 1;
        return v;
      });
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
      correctIndex: correctIndex,
      weights: normalizedWeights
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
        correctIndex: newItems.correctIndex,
        weights: newItems.weights
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
    const { title, items, correctIndex, weights } = req.body;

    // اعتبارسنجی ورودی
    if (!title || !items || !Array.isArray(items) || correctIndex === undefined) {
      return res.status(400).json({ error: "اطلاعات ناقص است" });
    }

    if (correctIndex < 0 || correctIndex >= items.length) {
      return res.status(400).json({ error: "اندیس پاسخ صحیح نامعتبر است" });
    }

    // اعتبارسنجی weights در صورت ارسال
    let normalizedWeights = null;
    if (weights !== undefined) {
      if (!Array.isArray(weights) || weights.length !== items.length) {
        return res.status(400).json({ error: "weights باید آرایه‌ای هم‌طول items باشد" });
      }
      normalizedWeights = weights.map(w => {
        const v = parseInt(w, 10);
        if (isNaN(v) || v < 1 || v > 5) return 1;
        return v;
      });
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
        correctIndex: correctIndex,
        weights: normalizedWeights !== null ? normalizedWeights : existingItems.weights
      });
    } else {
      await Items.create({
        questionId: questionId,
        items: items,
        correctIndex: correctIndex,
        weights: normalizedWeights
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
    // در صورتی که answers به صورت رشته JSON ارسال شده باشد، پارس کن
    let normalizedAnswers = answers;
    if (typeof normalizedAnswers === 'string') {
      try {
        normalizedAnswers = JSON.parse(normalizedAnswers);
      } catch (e) {
        return res.status(400).json({ error: 'answers must be a valid JSON object' });
      }
    }
    if (!normalizedAnswers || typeof normalizedAnswers !== 'object') {
      return res.status(400).json({ error: 'answers must be an object' });
    }
    const userId = req.user.id; // از JWT middleware

    // پیدا کردن آزمون همراه با سوال‌ها و گزینه‌ها
    const exam = await test.findByPk(examId, {
      include: [{ model: question, include: [{ model: Items, as: 'Items' }] }]
    });

    if (!exam) return res.status(404).json({ error: 'آزمون پیدا نشد' });

    const questions = exam.questions || exam.Questions;

    if (!questions || questions.length === 0)
      return res.status(400).json({ error: 'این آزمون سوالی ندارد' });

    // محاسبه وزنی: جمع weight گزینه انتخاب‌شده و حداکثر ممکن
    let weightedSum = 0;
    let maxWeightedSum = 0;
    const totalQuestions = questions.length;

    questions.forEach(q => {
      const userAnswer = normalizedAnswers[q.id];
      // association: Question.hasMany(Item) as 'Items' → یک ردیف برای هر سوال
      const itemsObj = q.Items && Array.isArray(q.Items) ? q.Items[0] : (q.Items || null);
      const weights = itemsObj && Array.isArray(itemsObj.weights) ? itemsObj.weights : [];
      if (weights.length > 0) {
        const maxW = Math.max(...weights);
        maxWeightedSum += maxW;
        if (typeof userAnswer === 'number' && userAnswer >= 0 && userAnswer < weights.length) {
          weightedSum += weights[userAnswer] || 0;
        }
      }
    });

    // نمره در مقیاس 0..100 بر اساس نسبت وزنی
    const score = maxWeightedSum > 0 ? Math.round((weightedSum / maxWeightedSum) * 100) : 0;

    // ذخیره یا بروزرسانی رکورد UserTest
    await userTest.upsert({
      userId,
      examId,
      // ذخیره نسخه نرمالایز شده پاسخ‌ها
      answers: normalizedAnswers,
      score,
      weightedSum,
      maxWeightedSum,
      correctAnswers: null,
      totalQuestions,
      timeSpent: timeSpent || 0,
      status: 'completed',
      completedAt: new Date()
    });

    // گرفتن رکورد برای ارسال در پاسخ
    const userTestRecord = await userTest.findOne({
      where: { userId, examId },
      include: [
        {
          model: User,
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
        }
      ]
    });

    res.status(200).json({
      message: 'آزمون با موفقیت ثبت شد',
      result: {
        user: userTestRecord.User,
        userName: `${userTestRecord.User?.firstName || ''} ${userTestRecord.User?.lastName || ''}`.trim(),
        userPhone: userTestRecord.User?.phone || '',
        score: userTestRecord.score,
        weightedSum: userTestRecord.weightedSum,
        maxWeightedSum: userTestRecord.maxWeightedSum,
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
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'mobile', 'fullName']
        }
      ]
    });

    if (!userTestResult) {
      return res.status(404).json({ error: "نتیجه آزمون یافت نشد" });
    }

    res.status(200).json({
      message: "نتیجه آزمون دریافت شد",
      result: {
        user: userTestResult.User,
        userName: userTestResult.User?.fullName || `${userTestResult.User?.firstName || ''} ${userTestResult.User?.lastName || ''}`.trim(),
        userPhone: userTestResult.User?.mobile || userTestResult.User?.phone || '',
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

// Admin: list results of an exam with user info and pagination
exports.getExamResults = async (req, res) => {
  try {
    const { id: examId } = req.params;
    const { page = 1, limit = 10, search = '' } = req.query;

    const pageNumber = Math.max(parseInt(page) || 1, 1);
    const pageSize = Math.min(Math.max(parseInt(limit) || 10, 1), 100);
    const offset = (pageNumber - 1) * pageSize;

    const userInclude = {
      model: User,
      attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
    };

    if (search && String(search).trim() !== '') {
      const likePattern = `%${String(search).trim()}%`;
      userInclude.where = {
        [Op.or]: [
          { firstName: { [Op.like]: likePattern } },
          { lastName: { [Op.like]: likePattern } },
          { email: { [Op.like]: likePattern } },
          { phone: { [Op.like]: likePattern } }
        ]
      };
      userInclude.required = true;
    }

    const { rows, count } = await userTest.findAndCountAll({
      where: { examId },
      include: [userInclude],
      order: [['completedAt', 'DESC']],
      limit: pageSize,
      offset
    });

    const results = rows.map(r => ({
      id: r.id,
      userId: r.userId,
      userName: r.User ? (`${r.User.firstName || ''} ${r.User.lastName || ''}`.trim() || 'کاربر') : 'کاربر',
      userEmail: r.User ? r.User.email : '',
      userPhone: r.User ? (r.User.phone || '') : '',
      score: r.score || 0,
      weightedSum: r.weightedSum || 0,
      maxWeightedSum: r.maxWeightedSum || 0,
      correctAnswers: r.correctAnswers || 0,
      totalQuestions: r.totalQuestions || 0,
      completedAt: r.completedAt,
      status: r.status,
      timeSpent: r.timeSpent || 0
    }));

    const totalPages = Math.ceil(count / pageSize) || 1;

    res.status(200).json({
      results,
      pagination: {
        total: count,
        page: pageNumber,
        limit: pageSize,
        totalPages,
        hasNext: pageNumber < totalPages,
        hasPrev: pageNumber > 1
      }
    });
  } catch (error) {
    console.error('خطا در دریافت نتایج آزمون:', error);
    res.status(500).json({ message: 'خطا در دریافت نتایج آزمون' });
  }
};

// Admin: statistics for an exam
exports.getExamStatistics = async (req, res) => {
  try {
    const { id: examId } = req.params;

    const totalAttempts = await userTest.count({ where: { examId } });
    const completedAttempts = await userTest.count({ where: { examId, status: 'completed' } });

    // average score
    const avgRow = await userTest.findOne({
      attributes: [[fn('AVG', col('score')), 'avgScore']],
      where: { examId, status: 'completed' },
      raw: true
    });
    const averageScore = avgRow && avgRow.avgScore ? Math.round(Number(avgRow.avgScore)) : 0;

    const completionRate = totalAttempts === 0 ? 0 : Math.round((completedAttempts / totalAttempts) * 100);

    res.status(200).json({
      statistics: {
        totalAttempts,
        completedAttempts,
        averageScore,
        completionRate
      }
    });
  } catch (error) {
    console.error('خطا در دریافت آمار آزمون:', error);
    res.status(500).json({ message: 'خطا در دریافت آمار آزمون' });
  }
};

// Admin: list all exam attempts across exams with user and exam info
exports.getAllExamAttempts = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const pageNumber = Math.max(parseInt(page) || 1, 1);
    const pageSize = Math.min(Math.max(parseInt(limit) || 10, 1), 100);
    const offset = (pageNumber - 1) * pageSize;

    const includes = [
      {
        model: User,
        attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
      },
      {
        model: test,
        attributes: ['id', 'title']
      }
    ];

    const whereClause = {};
    if (search && String(search).trim() !== '') {
      const likePattern = `%${String(search).trim()}%`;
      includes[0].where = {
        [Op.or]: [
          { firstName: { [Op.like]: likePattern } },
          { lastName: { [Op.like]: likePattern } },
          { phone: { [Op.like]: likePattern } },
          { email: { [Op.like]: likePattern } }
        ]
      };
      includes[0].required = true;
    }

    const { rows, count } = await userTest.findAndCountAll({
      where: whereClause,
      include: includes,
      order: [['completedAt', 'DESC']],
      limit: pageSize,
      offset
    });

    const attempts = rows.map(r => ({
      id: r.id,
      userId: r.userId,
      userName: r.User ? `${r.User.firstName || ''} ${r.User.lastName || ''}`.trim() : 'کاربر',
      userPhone: r.User ? (r.User.phone || r.User.mobile || '') : '',
      examId: r.examId,
      examTitle: r.Exam ? r.Exam.title : '',
      score: r.score || 0,
      weightedSum: r.weightedSum || 0,
      maxWeightedSum: r.maxWeightedSum || 0,
      completedAt: r.completedAt,
      status: r.status,
      timeSpent: r.timeSpent || 0
    }));

    const totalPages = Math.ceil(count / pageSize) || 1;

    res.status(200).json({
      attempts,
      pagination: {
        total: count,
        page: pageNumber,
        limit: pageSize,
        totalPages,
        hasNext: pageNumber < totalPages,
        hasPrev: pageNumber > 1
      }
    });
  } catch (error) {
    console.error('خطا در دریافت لیست همه تلاش‌های آزمون:', error);
    res.status(500).json({ message: 'خطا در دریافت لیست تلاش‌های آزمون' });
  }
};

