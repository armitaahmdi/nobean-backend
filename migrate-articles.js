const mysql = require('mysql2/promise');
require('dotenv').config();

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'nobean_db',
  charset: 'utf8mb4'
};

async function migrateArticles() {
  let connection;
  
  try {
    console.log('🔄 Starting Articles Migration...');
    console.log('📊 Database:', dbConfig.database);
    
    // Connect to database
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');
    
    // Check if articles table exists
    const [tables] = await connection.execute(
      "SHOW TABLES LIKE 'articles'"
    );
    
    if (tables.length === 0) {
      console.log('📝 Creating articles table...');
      await connection.execute(`
        CREATE TABLE \`articles\` (
          \`id\` bigint(20) NOT NULL AUTO_INCREMENT,
          \`title\` varchar(255) NOT NULL,
          \`excerpt_description\` text,
          \`excerpt\` text,
          \`description\` text,
          \`author\` varchar(255) DEFAULT 'نوین کد',
          \`date\` datetime DEFAULT CURRENT_TIMESTAMP,
          \`image\` varchar(500),
          \`readingTime\` bigint(20) DEFAULT 5,
          \`category\` varchar(100) DEFAULT 'عمومی',
          \`tags\` json,
          \`contentSections\` json,
          \`faqs\` json,
          \`reviews\` json,
          \`status\` enum('draft', 'published', 'archived') DEFAULT 'draft',
          \`views\` int(11) DEFAULT 0,
          \`createdAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
          \`updatedAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          PRIMARY KEY (\`id\`),
          KEY \`idx_category\` (\`category\`),
          KEY \`idx_status\` (\`status\`),
          KEY \`idx_created_at\` (\`createdAt\`),
          KEY \`idx_title\` (\`title\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log('✅ Articles table created');
    } else {
      console.log('📋 Articles table already exists, checking for updates...');
      
      // Check existing columns
      const [columns] = await connection.execute(
        "SHOW COLUMNS FROM articles"
      );
      
      const columnNames = columns.map(col => col.Field);
      console.log('📊 Existing columns:', columnNames);
      
      // Add missing columns
      if (!columnNames.includes('excerpt')) {
        console.log('➕ Adding excerpt column...');
        await connection.execute(
          "ALTER TABLE articles ADD COLUMN excerpt text AFTER excerpt_description"
        );
      }
      
      if (!columnNames.includes('status')) {
        console.log('➕ Adding status column...');
        await connection.execute(
          "ALTER TABLE articles ADD COLUMN status enum('draft', 'published', 'archived') DEFAULT 'draft' AFTER reviews"
        );
      }
      
      if (!columnNames.includes('views')) {
        console.log('➕ Adding views column...');
        await connection.execute(
          "ALTER TABLE articles ADD COLUMN views int(11) DEFAULT 0 AFTER status"
        );
      }
      
      // Rename faq to faqs if exists
      if (columnNames.includes('faq') && !columnNames.includes('faqs')) {
        console.log('🔄 Renaming faq column to faqs...');
        await connection.execute(
          "ALTER TABLE articles CHANGE COLUMN faq faqs json AFTER contentSections"
        );
      }
      
      // Create indexes if they don't exist
      console.log('🔍 Creating indexes...');
      try {
        await connection.execute("CREATE INDEX idx_articles_category ON articles (category)");
      } catch (e) {
        console.log('ℹ️ Index idx_articles_category already exists');
      }
      
      try {
        await connection.execute("CREATE INDEX idx_articles_status ON articles (status)");
      } catch (e) {
        console.log('ℹ️ Index idx_articles_status already exists');
      }
      
      try {
        await connection.execute("CREATE INDEX idx_articles_created_at ON articles (createdAt)");
      } catch (e) {
        console.log('ℹ️ Index idx_articles_created_at already exists');
      }
      
      try {
        await connection.execute("CREATE INDEX idx_articles_title ON articles (title)");
      } catch (e) {
        console.log('ℹ️ Index idx_articles_title already exists');
      }
    }
    
    // Check final structure
    console.log('📋 Final table structure:');
    const [finalColumns] = await connection.execute("DESCRIBE articles");
    finalColumns.forEach(col => {
      console.log(`  ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(nullable)' : '(not null)'}`);
    });
    
    // Check record count
    const [count] = await connection.execute("SELECT COUNT(*) as total FROM articles");
    console.log(`📊 Total articles: ${count[0].total}`);
    
    // Show sample data
    const [samples] = await connection.execute(
      "SELECT id, title, status, views, createdAt FROM articles LIMIT 5"
    );
    
    if (samples.length > 0) {
      console.log('📄 Sample articles:');
      samples.forEach(article => {
        console.log(`  ${article.id}: ${article.title} (${article.status}) - ${article.views} views`);
      });
    }
    
    console.log('✅ Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run migration
migrateArticles();
