const express = require("express");
const db = require('../model/index');
const { Op } = require('sequelize');

const User = db.User;

// لیست کاربران با pagination و جستجو
exports.getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', role = '', status = '' } = req.query;
    
    const pageNumber = Math.max(parseInt(page) || 1, 1);
    const pageSize = Math.min(Math.max(parseInt(limit) || 10, 1), 100);
    const offset = (pageNumber - 1) * pageSize;

    // ساخت where condition
    const whereCondition = {};
    
    // جستجو در نام، نام خانوادگی، شماره تلفن، ایمیل
    if (search && String(search).trim() !== '') {
      const searchTerm = `%${String(search).trim()}%`;
      whereCondition[Op.or] = [
        { firstName: { [Op.like]: searchTerm } },
        { lastName: { [Op.like]: searchTerm } },
        { phone: { [Op.like]: searchTerm } },
        { email: { [Op.like]: searchTerm } },
        { userName: { [Op.like]: searchTerm } }
      ];
    }

    // فیلتر بر اساس نقش
    if (role && String(role).trim() !== '') {
      whereCondition.role = String(role).trim();
    }

    // فیلتر بر اساس وضعیت فعال/غیرفعال
    if (status && String(status).trim() !== '') {
      if (status === 'active') {
        whereCondition.isActive = true;
      } else if (status === 'inactive') {
        whereCondition.isActive = false;
      }
    }

    const { rows, count } = await User.findAndCountAll({
      where: whereCondition,
      order: [['createdAt', 'DESC']],
      limit: pageSize,
      offset,
      attributes: {
        exclude: ['password'] // پسورد را نفرست
      }
    });

    // Special case: phone number 09198718211 should show as superadmin
    const modifiedRows = rows.map(user => {
      if (user.phone === '09198718211') {
        return { ...user.toJSON(), role: 'superadmin' };
      }
      return user;
    });

    const totalPages = Math.ceil(count / pageSize) || 1;

    res.status(200).json({
      success: true,
      users: modifiedRows,
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
    console.error('Error getting users:', error);
    res.status(500).json({ 
      success: false,
      message: 'خطا در دریافت لیست کاربران',
      error: error.message 
    });
  }
};

// دریافت اطلاعات یک کاربر
exports.getUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByPk(id, {
      attributes: {
        exclude: ['password']
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'کاربر یافت نشد'
      });
    }

    // Special case: phone number 09198718211 should show as superadmin
    if (user.phone === '09198718211') {
      user.role = 'superadmin';
    }

    res.status(200).json({
      success: true,
      user
    });

  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در دریافت اطلاعات کاربر',
      error: error.message
    });
  }
};

// ایجاد کاربر جدید توسط ادمین
exports.createUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      userName,
      phone,
      email,
      role = 'student',
      age,
      birthDate,
      isParent = false,
      childPhone,
      isFather,
      motherId,
      fatherId
    } = req.body;

    // اعتبارسنجی فیلدهای اجباری
    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'شماره تلفن اجباری است'
      });
    }

    // بررسی تکراری بودن شماره تلفن
    const existingUser = await User.findOne({ where: { phone } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'کاربری با این شماره تلفن قبلاً ثبت نام کرده است'
      });
    }

    // بررسی تکراری بودن ایمیل (اگر ارائه شده)
    if (email) {
      const existingEmail = await User.findOne({ where: { email } });
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: 'کاربری با این ایمیل قبلاً ثبت نام کرده است'
        });
      }
    }

    // ایجاد کاربر جدید (بدون پسورد - کاربران با OTP وارد می‌شوند)
    const newUser = await User.create({
      firstName,
      lastName,
      userName,
      phone,
      email,
      role,
      age: age ? parseInt(age) : null,
      birthDate,
      isParent,
      childPhone,
      isFather,
      motherId: motherId && motherId.trim() !== '' ? parseInt(motherId) : null,
      fatherId: fatherId && fatherId.trim() !== '' ? parseInt(fatherId) : null,
      isActive: true
    });

    res.status(201).json({
      success: true,
      message: 'کاربر با موفقیت ایجاد شد. کاربر می‌تواند با شماره تلفن و OTP وارد شود.',
      user: {
        id: newUser.id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        userName: newUser.userName,
        phone: newUser.phone,
        email: newUser.email,
        role: newUser.role,
        age: newUser.age,
        birthDate: newUser.birthDate,
        isParent: newUser.isParent,
        childPhone: newUser.childPhone,
        isFather: newUser.isFather,
        motherId: newUser.motherId,
        fatherId: newUser.fatherId,
        isActive: newUser.isActive,
        createdAt: newUser.createdAt
      }
    });

  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در ایجاد کاربر',
      error: error.message
    });
  }
};

// ویرایش کاربر
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      firstName,
      lastName,
      userName,
      phone,
      email,
      role,
      age,
      birthDate,
      isParent,
      childPhone,
      isFather,
      motherId,
      fatherId,
      isActive
    } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'کاربر یافت نشد'
      });
    }

    // بررسی تکراری بودن شماره تلفن (اگر تغییر کرده)
    if (phone && phone !== user.phone) {
      const existingUser = await User.findOne({ 
        where: { 
          phone,
          id: { [Op.ne]: id }
        } 
      });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'کاربری با این شماره تلفن قبلاً ثبت نام کرده است'
        });
      }
    }

    // بررسی تکراری بودن ایمیل (اگر تغییر کرده)
    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ 
        where: { 
          email,
          id: { [Op.ne]: id }
        } 
      });
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: 'کاربری با این ایمیل قبلاً ثبت نام کرده است'
        });
      }
    }

    // بروزرسانی کاربر
    await user.update({
      firstName,
      lastName,
      userName,
      phone,
      email,
      role,
      age: age ? parseInt(age) : null,
      birthDate,
      isParent,
      childPhone,
      isFather,
      motherId: motherId && motherId.trim() !== '' ? parseInt(motherId) : null,
      fatherId: fatherId && fatherId.trim() !== '' ? parseInt(fatherId) : null,
      isActive
    });

    res.status(200).json({
      success: true,
      message: 'اطلاعات کاربر با موفقیت بروزرسانی شد',
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        userName: user.userName,
        phone: user.phone,
        email: user.email,
        role: user.role,
        age: user.age,
        birthDate: user.birthDate,
        isParent: user.isParent,
        childPhone: user.childPhone,
        isFather: user.isFather,
        motherId: user.motherId,
        fatherId: user.fatherId,
        isActive: user.isActive,
        updatedAt: user.updatedAt
      }
    });

  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در بروزرسانی کاربر',
      error: error.message
    });
  }
};

// حذف کاربر
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'کاربر یافت نشد'
      });
    }

    await user.destroy();

    res.status(200).json({
      success: true,
      message: 'کاربر با موفقیت حذف شد'
    });

  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در حذف کاربر',
      error: error.message
    });
  }
};

// تغییر وضعیت فعال/غیرفعال کاربر
exports.toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'کاربر یافت نشد'
      });
    }

    await user.update({
      isActive: !user.isActive
    });

    res.status(200).json({
      success: true,
      message: `کاربر ${user.isActive ? 'غیرفعال' : 'فعال'} شد`,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        isActive: user.isActive
      }
    });

  } catch (error) {
    console.error('Error toggling user status:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در تغییر وضعیت کاربر',
      error: error.message
    });
  }
};

// آمار کاربران
exports.getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const activeUsers = await User.count({ where: { isActive: true } });
    const inactiveUsers = await User.count({ where: { isActive: false } });
    
    const usersByRole = await User.findAll({
      attributes: [
        'role',
        [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count']
      ],
      group: ['role'],
      raw: true
    });

    const recentUsers = await User.findAll({
      order: [['createdAt', 'DESC']],
      limit: 5,
      attributes: ['id', 'firstName', 'lastName', 'phone', 'role', 'createdAt']
    });

    res.status(200).json({
      success: true,
      stats: {
        total: totalUsers,
        active: activeUsers,
        inactive: inactiveUsers,
        byRole: usersByRole,
        recent: recentUsers
      }
    });

  } catch (error) {
    console.error('Error getting user stats:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در دریافت آمار کاربران',
      error: error.message
    });
  }
};
