const { User, Lead, LeadActivity } = require('../database');
const { validateEmail, validatePhone, isValidStatusTransition } = require('../utils/validators');
const { detectDuplicates } = require('../utils/duplicateDetection');
const { Op } = require('sequelize');

// Create a new lead
exports.createLead = async (req, res) => {
  try {
    const { name, email, phone, source, notes } = req.body;

    // Validate required fields
    if (!name || !email || !phone) {
      return res.status(400).json({ error: 'Name, email, and phone are required' });
    }

    // Validate email format
    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate phone format (10 digits)
    if (!validatePhone(phone)) {
      return res.status(400).json({ error: 'Invalid phone format. Must have 10 digits' });
    }

    // Auto-assign to user with least assigned leads
    const userWithLeastLeads = await User.findOne({
      attributes: {
        include: [
          [require('sequelize').literal('(SELECT COUNT(*) FROM "Leads" WHERE "assigned_to" = "User"."id")'), 'lead_count'],
        ],
      },
      order: [[require('sequelize').literal('lead_count'), 'ASC']],
      raw: true,
    });

    const assignedUserId = userWithLeastLeads?.id || null;

    // Create the lead
    const lead = await Lead.create({
      name,
      email,
      phone,
      source: source || 'other',
      assigned_to: assignedUserId,
      notes,
    });

    // Log the lead creation as an activity
    await LeadActivity.create({
      lead_id: lead.id,
      activity_type: 'other',
      description: `Lead created with email ${email}`,
    });

    // Fetch the created lead with user info
    const createdLead = await Lead.findByPk(lead.id, {
      include: [{ model: User, as: 'assignee' }],
    });

    res.status(201).json(createdLead);
  } catch (error) {
    console.error('Error creating lead:', error);
    res.status(500).json({ error: 'Failed to create lead' });
  }
};

// List leads with pagination, filters, and sorting
exports.listLeads = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;

    // Build filters
    const where = {};
    if (req.query.status) {
      where.status = req.query.status;
    }
    if (req.query.source) {
      where.source = req.query.source;
    }
    if (req.query.assigned_to) {
      where.assigned_to = req.query.assigned_to;
    }

    // Determine sort order
    let order = [['createdAt', 'DESC']];
    if (req.query.sortBy === 'last_activity') {
      order = [['updatedAt', 'DESC']];
    }

    // Fetch leads
    const { count, rows } = await Lead.findAndCountAll({
      where,
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
        { model: LeadActivity, as: 'activities', attributes: [] },
      ],
      order,
      limit,
      offset,
      distinct: true,
      subQuery: false,
    });

    // Add activity count manually
    const leadsWithActivityCount = await Promise.all(
      rows.map(async (lead) => {
        const activityCount = await LeadActivity.count({ where: { lead_id: lead.id } });
        return { ...lead.toJSON(), activityCount };
      })
    );

    res.json({
      leads: leadsWithActivityCount,
      totalCount: count,
      page,
      totalPages: Math.ceil(count / limit),
    });
  } catch (error) {
    console.error('Error listing leads:', error);
    res.status(500).json({ error: 'Failed to list leads' });
  }
};

// Update lead status
exports.updateLeadStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { newStatus } = req.body;

    const lead = await Lead.findByPk(id, {
      include: [{ model: User, as: 'assignee' }],
    });

    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    // Validate status transition
    if (!isValidStatusTransition(lead.status, newStatus)) {
      return res.status(400).json({
        error: `Invalid status transition from '${lead.status}' to '${newStatus}'`,
        currentStatus: lead.status,
        allowedTransitions: {
          new: ['contacted', 'lost'],
          contacted: ['qualified', 'lost'],
          qualified: ['converted', 'lost'],
          converted: [],
          lost: [],
        },
      });
    }

    // Update status
    const oldStatus = lead.status;
    lead.status = newStatus;
    await lead.save();

    // Log the status change
    await LeadActivity.create({
      lead_id: lead.id,
      activity_type: 'status_change',
      description: `Status changed from '${oldStatus}' to '${newStatus}'`,
    });

    res.json(lead);
  } catch (error) {
    console.error('Error updating lead status:', error);
    res.status(500).json({ error: 'Failed to update lead status' });
  }
};

// Get lead timeline
exports.getLeadTimeline = async (req, res) => {
  try {
    const { id } = req.params;

    const lead = await Lead.findByPk(id);
    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    const activities = await LeadActivity.findAll({
      where: { lead_id: id },
      include: [{ model: User, as: 'creator', attributes: ['id', 'name', 'email'] }],
      order: [['createdAt', 'DESC']],
    });

    // Group by date
    const groupedByDate = {};
    activities.forEach((activity) => {
      const date = new Date(activity.createdAt).toLocaleDateString();
      if (!groupedByDate[date]) {
        groupedByDate[date] = [];
      }
      groupedByDate[date].push(activity);
    });

    res.json({
      lead,
      timeline: groupedByDate,
    });
  } catch (error) {
    console.error('Error fetching lead timeline:', error);
    res.status(500).json({ error: 'Failed to fetch lead timeline' });
  }
};

// Check for duplicate leads
exports.checkDuplicate = async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    // Validate required fields
    if (!name || !email || !phone) {
      return res.status(400).json({ error: 'Name, email, and phone are required' });
    }

    // Validate formats
    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (!validatePhone(phone)) {
      return res.status(400).json({ error: 'Invalid phone format' });
    }

    // Get all existing leads
    const existingLeads = await Lead.findAll({
      attributes: ['id', 'name', 'email', 'phone', 'status', 'source'],
    });

    // Detect duplicates
    const result = detectDuplicates(name, email, phone, existingLeads);

    res.json(result);
  } catch (error) {
    console.error('Error checking duplicates:', error);
    res.status(500).json({ error: 'Failed to check duplicates' });
  }
};
