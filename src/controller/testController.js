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
const Domain = db.Domain;
const Component = db.Component;
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
      tags,
      descriptionVideo,
      minAge,
      maxAge,
      components
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
      tags,
      descriptionVideo: descriptionVideo || null,
      minAge: (minAge === undefined || minAge === null || isNaN(parseInt(minAge))) ? null : parseInt(minAge),
      maxAge: (maxAge === undefined || maxAge === null || isNaN(parseInt(maxAge))) ? null : parseInt(maxAge),
      components: Array.isArray(components) ? components : null
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

    const testData = await test.findByPk(id, {
      include: [
        {
          model: Domain,
          include: [
            { model: Component }
          ]
        }
      ],
      order: [
        [Domain, 'order', 'ASC'],
        [Domain, Component, 'order', 'ASC']
      ]
    });

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
    const { title, items, weights, componentId, questionNumber, description } = req.body;

    // اعتبارسنجی ورودی
    if (!title || !items || !Array.isArray(items)) {
      return res.status(400).json({ error: "اطلاعات ناقص است" });
    }

  // اعتبارسنجی weights در صورت ارسال
    let normalizedWeights = null;
    if (weights !== undefined) {
      if (!Array.isArray(weights) || weights.length !== items.length) {
        return res.status(400).json({ error: "weights باید آرایه‌ای هم‌طول items باشد" });
      }
    // محدود به -1..10 و اعداد صحیح
      normalizedWeights = weights.map(w => {
        const v = parseInt(w, 10);
      if (isNaN(v) || v < -1 || v > 10) return 1;
        return v;
      });
    }

    // ایجاد سوال
    const newQuestion = await question.create({
      examId: id,
      title: title,
      description: description || null,
      componentId: componentId || null,
      questionNumber: questionNumber || null
    });

    // ایجاد گزینه‌ها
    const newItems = await Items.create({
      questionId: newQuestion.id,
      items: items,
      weights: normalizedWeights
    });

    res.status(200).json({
      message: "سوال با موفقیت ثبت شد",
      question: {
        id: newQuestion.id,
        examId: newQuestion.examId,
        title: newQuestion.title,
        description: newQuestion.description,
        componentId: newQuestion.componentId,
        questionNumber: newQuestion.questionNumber
      },
      options: {
        questionId: newItems.questionId,
        items: newItems.items,
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
        },
        {
          model: Component,
          include: [
            {
              model: Domain
            }
          ]
        }
      ],
      order: [['questionNumber', 'ASC']]
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
    const { title, items, weights, componentId, questionNumber, description } = req.body;

    // اعتبارسنجی ورودی
    if (!title || !items || !Array.isArray(items)) {
      return res.status(400).json({ error: "اطلاعات ناقص است" });
    }

  // اعتبارسنجی weights در صورت ارسال
    let normalizedWeights = null;
    if (weights !== undefined) {
      if (!Array.isArray(weights) || weights.length !== items.length) {
        return res.status(400).json({ error: "weights باید آرایه‌ای هم‌طول items باشد" });
      }
      normalizedWeights = weights.map(w => {
        const v = parseInt(w, 10);
      if (isNaN(v) || v < -1 || v > 10) return 1;
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
    await existingQuestion.update({ 
      title, 
      description: description !== undefined ? description : existingQuestion.description,
      componentId: componentId !== undefined ? componentId : existingQuestion.componentId,
      questionNumber: questionNumber !== undefined ? questionNumber : existingQuestion.questionNumber
    });

    // به‌روزرسانی گزینه‌ها
    const existingItems = await Items.findOne({
      where: { questionId: questionId }
    });

    if (existingItems) {
      await existingItems.update({
        items: items,
        weights: normalizedWeights !== null ? normalizedWeights : existingItems.weights
      });
    } else {
      await Items.create({
        questionId: questionId,
        items: items,
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
        title: updatedQuestion.title,
        description: updatedQuestion.description,
        componentId: updatedQuestion.componentId,
        questionNumber: updatedQuestion.questionNumber
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

    // ایجاد رکورد جدید UserTest (اجازه چندین بار شرکت در آزمون)
    const userTestRecord = await userTest.create({
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

    // گرفتن رکورد کامل با اطلاعات کاربر
    const userTestRecordWithUser = await userTest.findByPk(userTestRecord.id, {
      include: [
        {
          model: User,
          as: 'User',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'userName']
        }
      ]
    });

    res.status(200).json({
      message: 'آزمون با موفقیت ثبت شد',
      result: {
        user: userTestRecordWithUser.User,
        score: userTestRecordWithUser.score,
        weightedSum: userTestRecordWithUser.weightedSum,
        maxWeightedSum: userTestRecordWithUser.maxWeightedSum,
        correctAnswers: userTestRecordWithUser.correctAnswers,
        totalQuestions: userTestRecordWithUser.totalQuestions,
        completedAt: userTestRecordWithUser.completedAt,
        timeSpent: userTestRecordWithUser.timeSpent
      }
    });

  } catch (error) {
    console.error('Error submitExam:', error);
    res.status(500).json({ error: 'خطا در ثبت آزمون' });
  }
};

// // get exam result
exports.getExamResult = async (req, res) => {
  try {
    const { id: examId } = req.params;
    const userId = req.user.id;

    // پیدا کردن آخرین نتیجه آزمون همراه با اطلاعات کاربر
    const userTestResult = await userTest.findOne({
      where: { userId, examId },
      include: [
        {
          model: User,
          as: 'User',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'userName']
        }
      ],
      order: [['completedAt', 'DESC']] // آخرین نتیجه را بگیر
    });

    if (!userTestResult) {
      return res.status(404).json({ error: "نتیجه آزمون یافت نشد" });
    }

    res.status(200).json({
      message: "نتیجه آزمون دریافت شد",
      result: {
        user: userTestResult.User,
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
      as: 'User',
      attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'userName']
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
      user: r.User,
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
        as: 'User',
        attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'userName']
      },
      {
        model: test,
        as: 'Exam',
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
      user: r.User,
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

  // Exams of current user (distinct exams with summary stats)
  exports.getMyExams = async (req, res) => {
    try {
      const userId = req.user.id;

      // Aggregate attempts by examId for this user
      const aggregates = await userTest.findAll({
        where: { userId },
        attributes: [
          'examId',
          [fn('COUNT', col('id')), 'attempts'],
          [fn('MAX', col('completedAt')), 'lastCompletedAt'],
          [fn('MAX', col('score')), 'bestScore']
        ],
        group: ['examId'],
        raw: true
      });

      const examIds = aggregates.map(a => a.examId).filter(Boolean);
      let exams = [];
      if (examIds.length > 0) {
        exams = await test.findAll({
          where: { id: examIds },
          order: [['createdAt', 'DESC']]
        });
      }

      // Index aggregates by examId
      const examIdToAgg = Object.fromEntries(aggregates.map(a => [a.examId, a]));

      const items = exams.map(e => {
        const agg = examIdToAgg[e.id] || {};
        return {
          id: e.id,
          title: e.title,
          imagepath: e.imagepath,
          ShortDescription: e.ShortDescription,
          time: e.time,
          price: e.price,
          attempts: Number(agg.attempts || 0),
          lastCompletedAt: agg.lastCompletedAt || null,
          bestScore: agg.bestScore !== undefined && agg.bestScore !== null ? Math.round(Number(agg.bestScore)) : null,
        };
      });

      res.status(200).json({ items });
    } catch (error) {
      console.error('Error fetching my exams:', error);
      res.status(500).json({ error: 'خطا در دریافت آزمون‌های کاربر' });
    }
  };

  // Attempts of current user (each attempt as a separate row)
  exports.getMyAttempts = async (req, res) => {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 20 } = req.query;
      const pageNumber = Math.max(parseInt(page) || 1, 1);
      const pageSize = Math.min(Math.max(parseInt(limit) || 20, 1), 100);
      const offset = (pageNumber - 1) * pageSize;

      const { rows, count } = await userTest.findAndCountAll({
        where: { userId },
        include: [
          {
            model: test,
            as: 'Exam',
            attributes: ['id', 'title', 'ShortDescription', 'category', 'imagepath']
          }
        ],
        order: [['completedAt', 'DESC']],
        limit: pageSize,
        offset
      });

      const items = rows.map(r => ({
        id: r.id,
        examId: r.examId,
        completedAt: r.completedAt,
        timeSpent: r.timeSpent || 0,
        status: r.status,
        // optional fields if exist
        score: r.score ?? null,
        Exam: r.Exam ? {
          id: r.Exam.id,
          title: r.Exam.title,
          ShortDescription: r.Exam.ShortDescription,
          category: r.Exam.category,
          imagepath: r.Exam.imagepath
        } : null
      }));

      res.status(200).json({
        items,
        pagination: {
          total: count,
          page: pageNumber,
          limit: pageSize,
          totalPages: Math.ceil(count / pageSize) || 1
        }
      });
    } catch (error) {
      console.error('Error fetching my attempts:', error);
      res.status(500).json({ error: 'خطا در دریافت لیست تلاش‌های شما' });
    }
  };

// تغییر وضعیت آزمون
exports.updateTestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // اعتبارسنجی وضعیت
    if (!['draft', 'active', 'inactive'].includes(status)) {
      return res.status(400).json({ error: "وضعیت نامعتبر است" });
    }

    // بررسی وجود آزمون
    const existingTest = await test.findByPk(id);
    if (!existingTest) {
      return res.status(404).json({ error: "آزمون یافت نشد" });
    }

    // به‌روزرسانی وضعیت
    await test.update(
      { status: status },
      { where: { id: id } }
    );

    res.status(200).json({ 
      message: "وضعیت آزمون با موفقیت تغییر یافت",
      status: status 
    });

  } catch (error) {
    console.error('Error updating test status:', error);
    res.status(500).json({ error: "خطا در تغییر وضعیت آزمون" });
  }
};

// دریافت آزمون‌های فعال برای کاربران
exports.getActiveTests = async (req, res) => {
  try {
    const tests = await test.findAll({
      where: {
        status: 'active'
      },
      order: [['createdAt', 'DESC']],
      limit: 100
    });
    
    res.status(200).json(tests);
  } catch (error) {
    console.error('Error fetching active tests:', error);
    res.status(500).json({ error: "مشکلی در دریافت آزمون‌های فعال به وجود آمد" });
  }
};

// مدیریت حیطه‌ها (Domains)
exports.createDomain = async (req, res) => {
  try {
    const { examId, name, description, order } = req.body;

    if (!examId || !name) {
      return res.status(400).json({ error: "شناسه آزمون و نام حیطه الزامی است" });
    }

    const newDomain = await Domain.create({
      examId,
      name,
      description: description || null,
      order: order || 0
    });

    res.status(201).json({
      message: "حیطه با موفقیت ایجاد شد",
      domain: newDomain
    });
  } catch (error) {
    console.error("خطا در ایجاد حیطه:", error);
    res.status(500).json({ error: "مشکلی در ایجاد حیطه به وجود آمد" });
  }
};

exports.getDomains = async (req, res) => {
  try {
    const { examId } = req.params;

    const domains = await Domain.findAll({
      where: { examId },
      order: [['order', 'ASC']]
    });

    res.status(200).json(domains);
  } catch (error) {
    console.error("خطا در دریافت حیطه‌ها:", error);
    res.status(500).json({ error: "مشکلی در دریافت حیطه‌ها به وجود آمد" });
  }
};

exports.updateDomain = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, order } = req.body;

    const domain = await Domain.findByPk(id);
    if (!domain) {
      return res.status(404).json({ error: "حیطه مورد نظر پیدا نشد" });
    }

    await domain.update({
      name: name || domain.name,
      description: description !== undefined ? description : domain.description,
      order: order !== undefined ? order : domain.order
    });

    res.status(200).json({
      message: "حیطه با موفقیت به‌روزرسانی شد",
      domain
    });
  } catch (error) {
    console.error("خطا در به‌روزرسانی حیطه:", error);
    res.status(500).json({ error: "مشکلی در به‌روزرسانی حیطه به وجود آمد" });
  }
};

exports.deleteDomain = async (req, res) => {
  try {
    const { id } = req.params;

    const domain = await Domain.findByPk(id);
    if (!domain) {
      return res.status(404).json({ error: "حیطه مورد نظر پیدا نشد" });
    }

    await domain.destroy();
    res.status(200).json({ message: "حیطه با موفقیت حذف شد" });
  } catch (error) {
    console.error("خطا در حذف حیطه:", error);
    res.status(500).json({ error: "مشکلی در حذف حیطه به وجود آمد" });
  }
};

// مدیریت مولفه‌ها (Components)
exports.createComponent = async (req, res) => {
  try {
    const { domainId, name, description, order } = req.body;

    if (!domainId || !name) {
      return res.status(400).json({ error: "شناسه حیطه و نام مولفه الزامی است" });
    }

    const newComponent = await Component.create({
      domainId,
      name,
      description: description || null,
      order: order || 0
    });

    res.status(201).json({
      message: "مولفه با موفقیت ایجاد شد",
      component: newComponent
    });
  } catch (error) {
    console.error("خطا در ایجاد مولفه:", error);
    res.status(500).json({ error: "مشکلی در ایجاد مولفه به وجود آمد" });
  }
};

exports.getComponents = async (req, res) => {
  try {
    const { domainId } = req.params;

    const components = await Component.findAll({
      where: { domainId },
      order: [['order', 'ASC']]
    });

    res.status(200).json(components);
  } catch (error) {
    console.error("خطا در دریافت مولفه‌ها:", error);
    res.status(500).json({ error: "مشکلی در دریافت مولفه‌ها به وجود آمد" });
  }
};

exports.updateComponent = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, order } = req.body;

    const component = await Component.findByPk(id);
    if (!component) {
      return res.status(404).json({ error: "مولفه مورد نظر پیدا نشد" });
    }

    await component.update({
      name: name || component.name,
      description: description !== undefined ? description : component.description,
      order: order !== undefined ? order : component.order
    });

    res.status(200).json({
      message: "مولفه با موفقیت به‌روزرسانی شد",
      component
    });
  } catch (error) {
    console.error("خطا در به‌روزرسانی مولفه:", error);
    res.status(500).json({ error: "مشکلی در به‌روزرسانی مولفه به وجود آمد" });
  }
};

exports.deleteComponent = async (req, res) => {
  try {
    const { id } = req.params;

    const component = await Component.findByPk(id);
    if (!component) {
      return res.status(404).json({ error: "مولفه مورد نظر پیدا نشد" });
    }

    await component.destroy();
    res.status(200).json({ message: "مولفه با موفقیت حذف شد" });
  } catch (error) {
    console.error("خطا در حذف مولفه:", error);
    res.status(500).json({ error: "مشکلی در حذف مولفه به وجود آمد" });
  }
};

