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



// Add this temporarily
router.get('/emergency-reset', async (req, res) => {
    try {
        const { Pool } = require('pg');
        const pool = new Pool({ connectionString: process.env.DATABASE_URL });
        await pool.query('TRUNCATE TABLE leads;');
        await pool.end();
        res.send('Database cleared!');
    } catch (err) {
        res.status(500).send('Error: ' + err.message);
    }
});