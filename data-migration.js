const sqlite3 = require('sqlite3').verbose();
const mysql = require('mysql2/promise');
require('dotenv').config();

// تنظیمات SQLite
const sqliteDb = new sqlite3.Database('./nobean.db');

// تنظیمات MySQL
const mysqlConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  charset: 'utf8mb4'
};

async function migrateData() {
  let mysqlConnection;
  
  try {
    console.log('🔄 شروع انتقال داده‌ها...');
    
    // اتصال به MySQL
    mysqlConnection = await mysql.createConnection(mysqlConfig);
    console.log('✅ اتصال به MySQL برقرار شد');
    
    // لیست جداول
    const tables = [
      'users', 'exams', 'questions', 'items', 'userTests', 
      'categories', 'categoryTests', 'articles', 'products', 
      'categoryProducts', 'orders', 'orderItems', 'carts', 
      'cartItems', 'comments', 'courses', 'courseUsers', 
      'categoryCourses', 'podcasts', 'otps', 'examResults', 'webinars'
    ];
    
    for (const table of tables) {
      try {
        console.log(`📊 انتقال جدول ${table}...`);
        
        // خواندن داده‌ها از SQLite
        const sqliteData = await new Promise((resolve, reject) => {
          sqliteDb.all(`SELECT * FROM ${table}`, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
          });
        });
        
        if (sqliteData.length === 0) {
          console.log(`⚠️ جدول ${table} خالی است`);
          continue;
        }
        
        // انتقال به MySQL
        for (const row of sqliteData) {
          const columns = Object.keys(row);
          const values = Object.values(row);
          const placeholders = columns.map(() => '?').join(', ');
          
          const insertQuery = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`;
          await mysqlConnection.execute(insertQuery, values);
        }
        
        console.log(`✅ ${sqliteData.length} رکورد از جدول ${table} انتقال یافت`);
        
      } catch (error) {
        console.log(`⚠️ خطا در انتقال جدول ${table}:`, error.message);
      }
    }
    
    console.log('🎉 انتقال داده‌ها با موفقیت انجام شد!');
    
  } catch (error) {
    console.error('❌ خطا در انتقال داده‌ها:', error);
  } finally {
    if (mysqlConnection) {
      await mysqlConnection.end();
    }
    sqliteDb.close();
  }
}

// اجرای انتقال داده‌ها
migrateData();
