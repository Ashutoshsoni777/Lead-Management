const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('LeadActivity', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    lead_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    activity_type: {
      type: DataTypes.ENUM('status_change', 'note_added', 'assignment_change', 'other'),
      defaultValue: 'other',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  }, {
    timestamps: true,
    updatedAt: false,
  });
};
