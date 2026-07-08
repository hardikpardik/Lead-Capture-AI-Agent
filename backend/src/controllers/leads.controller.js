const { pool } = require('../config/db');
const { qualifyLead } = require('../services/aiQualifier.service');
const { validateLead } = require('../validators/lead.validator');
const ApiError = require('../utils/ApiError');

function flattenValidationErrors(error) {
  const fieldErrors = {};

  for (const issue of error.issues) {
    const field = issue.path.join('.') || 'form';
    if (!fieldErrors[field]) fieldErrors[field] = issue.message;
  }

  return fieldErrors;
}

async function findRecentDuplicate(email) {
  const { rows } = await pool.query(
    `
      SELECT id, full_name, email, business_name, ai_score, created_at
      FROM leads
      WHERE lower(email) = lower($1)
        AND created_at >= now() - interval '30 days'
      ORDER BY created_at DESC
      LIMIT 1;
    `,
    [email]
  );

  return rows[0] || null;
}

async function createLead(req, res) {
  const parsed = validateLead(req.body);

  if (!parsed.success) {
    throw new ApiError(
      400,
      'Validation failed. Please check the highlighted fields.',
      flattenValidationErrors(parsed.error)
    );
  }

  const { fullName, email, businessName, message } = parsed.data;
  const duplicate = await findRecentDuplicate(email);

  if (duplicate) {
    throw new ApiError(409, 'A lead with this email was already submitted recently.', {
      email: 'This email already exists in the recent lead queue.',
      duplicateLead: duplicate,
    });
  }

  const insertQuery = `
    INSERT INTO leads (full_name, email, business_name, message)
    VALUES ($1, $2, $3, $4)
    RETURNING id, full_name, email, business_name, message, created_at;
  `;

  const { rows: insertedRows } = await pool.query(insertQuery, [
    fullName,
    email,
    businessName || null,
    message,
  ]);
  const insertedLead = insertedRows[0];

  const qualification = await qualifyLead({
    id: insertedLead.id,
    fullName,
    email,
    businessName: businessName || null,
    message,
  });

  const { rows: updatedRows } = await pool.query(
    `
      UPDATE leads
      SET ai_score = $2,
          ai_score_reason = $3,
          ai_email_draft = $4,
          ai_model = $5,
          qualification_status = $6,
          ai_qualified_at = now()
      WHERE id = $1
      RETURNING id, full_name, email, business_name, message, ai_score,
                ai_score_reason, ai_email_draft, ai_model, qualification_status,
                ai_qualified_at, created_at;
    `,
    [
      insertedLead.id,
      qualification.score,
      qualification.reason,
      qualification.emailDraft,
      qualification.model,
      qualification.status,
    ]
  );

  return res.status(201).json({
    success: true,
    message: "Thanks. Your inquiry has been captured and qualified.",
    data: updatedRows[0],
  });
}

async function listLeads(req, res) {
  const limit = Math.min(Number(req.query.limit) || 50, 100);
  const { rows } = await pool.query(
    `
      SELECT id, full_name, email, business_name, message, ai_score,
             ai_score_reason, ai_email_draft, ai_model, qualification_status,
             ai_qualified_at, created_at
      FROM leads
      ORDER BY created_at DESC
      LIMIT $1;
    `,
    [limit]
  );

  return res.status(200).json({
    success: true,
    data: rows,
  });
}

async function getLeadStats(req, res) {
  const { rows } = await pool.query(`
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE ai_score = 'Hot')::int AS hot,
      COUNT(*) FILTER (WHERE ai_score = 'Warm')::int AS warm,
      COUNT(*) FILTER (WHERE ai_score = 'Cold')::int AS cold,
      COUNT(*) FILTER (WHERE qualification_status = 'fallback')::int AS fallback,
      COUNT(*) FILTER (WHERE created_at >= now() - interval '7 days')::int AS last_7_days
    FROM leads;
  `);

  return res.status(200).json({
    success: true,
    data: rows[0],
  });
}

module.exports = { createLead, listLeads, getLeadStats };
