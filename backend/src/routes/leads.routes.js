const express = require('express');
const { createLead, getLeadStats, listLeads } = require('../controllers/leads.controller');
const adminAuth = require('../middleware/adminAuth');
const createRateLimit = require('../middleware/rateLimit');

const router = express.Router();
const leadSubmitLimit = createRateLimit({ windowMs: 15 * 60 * 1000, maxRequests: 8 });

// GET /leads - simple admin lead list for the assignment.
router.get('/', adminAuth, listLeads);

// GET /leads/stats - lightweight dashboard metrics.
router.get('/stats', adminAuth, getLeadStats);

// POST /leads - public endpoint hit by the capture form.
router.post('/', leadSubmitLimit, createLead);

module.exports = router;
