require('dotenv').config();
const { Sequelize } = require('sequelize');
const path = require('path');

// Support DATABASE_URL (Postgres) in production hosts; fallback to SQLite locally
let sequelize;
if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    protocol: 'postgres',
    logging: false,
    dialectOptions: process.env.NODE_ENV === 'production' ? {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    } : {},
  });
} else {
  // Initialize SQLite database for local development
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, 'database.sqlite'),
    logging: false,
  });
}

// Define models
const User = require('./models/User')(sequelize);
const Lead = require('./models/Lead')(sequelize);
const LeadActivity = require('./models/LeadActivity')(sequelize);

// Define relationships
Lead.belongsTo(User, { foreignKey: 'assigned_to', as: 'assignee' });
User.hasMany(Lead, { foreignKey: 'assigned_to', as: 'assigned_leads' });

LeadActivity.belongsTo(Lead, { foreignKey: 'lead_id', as: 'lead' });
Lead.hasMany(LeadActivity, { foreignKey: 'lead_id', as: 'activities' });

LeadActivity.belongsTo(User, { foreignKey: 'created_by', as: 'creator', allowNull: true });

module.exports = {
  sequelize,
  User,
  Lead,
  LeadActivity,
};
