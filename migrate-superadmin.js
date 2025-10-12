const db = require('./src/model/index');
const User = db.User;

async function addSuperAdminRole() {
  try {
    console.log('Adding superadmin role to database...');
    
    // Update the special phone number to superadmin role
    const result = await User.update(
      { role: 'superadmin' },
      { where: { phone: '09198718211' } }
    );
    
    console.log(`Updated ${result[0]} user(s) to superadmin role`);
    
    // Check if the user exists
    const superAdminUser = await User.findOne({ where: { phone: '09198718211' } });
    if (superAdminUser) {
      console.log('Superadmin user found:', {
        id: superAdminUser.id,
        phone: superAdminUser.phone,
        role: superAdminUser.role,
        firstName: superAdminUser.firstName,
        lastName: superAdminUser.lastName
      });
    } else {
      console.log('Superadmin user not found!');
    }
    
    // Check admin users
    const adminUsers = await User.findAll({ where: { role: 'admin' } });
    console.log(`Found ${adminUsers.length} admin users:`, adminUsers.map(u => ({
      id: u.id,
      phone: u.phone,
      role: u.role,
      name: `${u.firstName} ${u.lastName}`
    })));
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    process.exit(0);
  }
}

addSuperAdminRole();
