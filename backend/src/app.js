const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const leadsRouter = require('./routes/leads.routes');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

// --- Security & observability ---
app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`Origin ${origin} is not allowed by CORS.`));
    },
    methods: ['GET', 'POST'],
  })
);
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Small body limit on purpose: this endpoint only ever receives a short form,
// never file uploads, so there is no reason to accept large payloads.
app.use(express.json({ limit: '10kb' }));

// --- Health check (useful for uptime monitors / deploy platforms) ---
app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

// --- Feature routes ---
app.use('/leads', leadsRouter);

// --- 404 + centralized error handling - must be registered last ---
app.use(notFound);
app.use(errorHandler);

module.exports = app;
