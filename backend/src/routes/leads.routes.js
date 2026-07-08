const express = require('express');
const { createLead, getLeadStats, listLeads } = require('../controllers/leads.controller');

const router = express.Router();

// GET /leads - simple admin lead list for the assignment.
router.get('/', listLeads);

// GET /leads/stats - lightweight dashboard metrics.
router.get('/stats', getLeadStats);

// POST /leads - public endpoint hit by the capture form.
router.post('/', createLead);

module.exports = router;
