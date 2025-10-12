const db = require('./src/model/index');
const User = db.User;

async function checkMigration() {
  try {
    console.log('Checking database structure and data...\n');
    
    // Check table structure
    const tableInfo = await db.sequelize.query("DESCRIBE user", { type: db.sequelize.QueryTypes.SELECT });
    const roleColumn = tableInfo.find(col => col.Field === 'role');
    
    console.log('📋 Table Structure:');
    console.log('Role column type:', roleColumn.Type);
    console.log('Role column default:', roleColumn.Default);
    console.log('');
    
    // Check specific users
    console.log('👥 User Data:');
    
    const superAdminUser = await User.findOne({ where: { phone: '09198718211' } });
    if (superAdminUser) {
      console.log('Superadmin user (09198718211):', {
        id: superAdminUser.id,
        phone: superAdminUser.phone,
        role: superAdminUser.role,
        firstName: superAdminUser.firstName,
        lastName: superAdminUser.lastName
      });
    } else {
      console.log('❌ Superadmin user (09198718211) not found!');
    }
    
    const adminUser = await User.findOne({ where: { phone: '0910604709' } });
    if (adminUser) {
      console.log('Admin user (0910604709):', {
        id: adminUser.id,
        phone: adminUser.phone,
        role: adminUser.role,
        firstName: adminUser.firstName,
        lastName: adminUser.lastName
      });
    } else {
      console.log('❌ Admin user (0910604709) not found!');
    }
    
    // Check all admin users
    const allAdmins = await User.findAll({ 
      where: { 
        role: ['admin', 'superadmin'] 
      },
      attributes: ['id', 'phone', 'role', 'firstName', 'lastName']
    });
    
    console.log('\n🔐 All Admin Users:');
    allAdmins.forEach(user => {
      console.log(`- ${user.phone}: ${user.role} (${user.firstName} ${user.lastName})`);
    });
    
    console.log('\n✅ Migration check completed!');
    
  } catch (error) {
    console.error('❌ Error checking migration:', error.message);
  } finally {
    process.exit(0);
  }
}

checkMigration();
