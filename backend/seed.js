const { sequelize, User, Lead, LeadActivity } = require('./database');

const seedDatabase = async () => {
  try {
    // Sync database
    await sequelize.sync({ force: false });

    // Create sample users
    const users = await User.bulkCreate(
      [
        {
          name: 'Alice Johnson',
          email: 'alice@company.com',
          department: 'Sales',
        },
        {
          name: 'Bob Smith',
          email: 'bob@company.com',
          department: 'Sales',
        },
        {
          name: 'Carol Williams',
          email: 'carol@company.com',
          department: 'Marketing',
        },
      ],
      { ignoreDuplicates: true }
    );

    console.log('✅ Created users:', users.map((u) => u.name));

    // Create sample leads
    const leads = await Lead.bulkCreate(
      [
        {
          name: 'John Doe',
          email: 'john.doe@gmail.com',
          phone: '+1 (555) 123-4567',
          source: 'website',
          status: 'new',
          assigned_to: users[0]?.id || null,
        },
        {
          name: 'Jane Smith',
          email: 'jane.smith@company.com',
          phone: '555-234-5678',
          source: 'referral',
          status: 'contacted',
          assigned_to: users[1]?.id || null,
        },
        {
          name: 'Mike Johnson',
          email: 'mike@example.com',
          phone: '9876543210',
          source: 'cold_call',
          status: 'qualified',
          assigned_to: users[2]?.id || null,
        },
        {
          name: 'Sarah Davis',
          email: 'sarah.davis@mail.com',
          phone: '+91-9876-543-210',
          source: 'social_media',
          status: 'converted',
          assigned_to: users[0]?.id || null,
        },
      ],
      { ignoreDuplicates: true }
    );

    console.log('✅ Created leads:', leads.map((l) => l.name));

    // Create sample activities
    const activities = await LeadActivity.bulkCreate(
      [
        {
          lead_id: leads[0]?.id || 1,
          activity_type: 'other',
          description: 'Lead created with email john.doe@gmail.com',
        },
        {
          lead_id: leads[1]?.id || 2,
          activity_type: 'status_change',
          description: "Status changed from 'new' to 'contacted'",
        },
        {
          lead_id: leads[2]?.id || 3,
          activity_type: 'status_change',
          description: "Status changed from 'contacted' to 'qualified'",
        },
        {
          lead_id: leads[3]?.id || 4,
          activity_type: 'status_change',
          description: "Status changed from 'qualified' to 'converted'",
        },
      ],
      { ignoreDuplicates: true }
    );

    console.log('✅ Created activities');

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\nSample users:');
    users.forEach((u) => console.log(`  - ${u.name} (${u.email})`));
    console.log('\nSample leads:');
    leads.forEach((l) => console.log(`  - ${l.name} (${l.email}) - Status: ${l.status}`));

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
