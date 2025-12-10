require('dotenv').config();
const { Sequelize } = require('sequelize');
const path = require('path');

// Initialize SQLite database
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, 'database.sqlite'),
  logging: false,
});

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
