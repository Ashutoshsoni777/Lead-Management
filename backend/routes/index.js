const express = require('express');
const leadController = require('../controllers/leadController');
const userController = require('../controllers/userController');

const router = express.Router();

// User routes
router.post('/users', userController.createUser);
router.get('/users', userController.listUsers);

// Lead routes
router.post('/leads', leadController.createLead);
router.get('/leads', leadController.listLeads);
router.put('/leads/:id/status', leadController.updateLeadStatus);
router.get('/leads/:id/timeline', leadController.getLeadTimeline);
router.post('/leads/check-duplicate', leadController.checkDuplicate);

module.exports = router;
