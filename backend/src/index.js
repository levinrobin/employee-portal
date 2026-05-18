require('dotenv').config();

const express = require('express');

const cors = require('cors');

const helmet = require('helmet');

const morgan = require('morgan');

const compression = require('compression');

const client = require('prom-client');

const routes = require('./routes');

const pool = require('./db/pool');

const app = express();

const PORT = process.env.PORT || 3001;

// ── Prometheus metrics ──────────────────────────────────────────────

const register = new client.Registry();

client.collectDefaultMetrics({ register });

const httpRequestDuration = new client.Histogram({

  name: 'http_request_duration_seconds',

  help: 'Duration of HTTP requests in seconds',

  labelNames: ['method', 'route', 'status_code'],

  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5],

  registers: [register],

});

const httpRequestTotal = new client.Counter({

  name: 'http_requests_total',

  help: 'Total number of HTTP requests',

  labelNames: ['method', 'route', 'status_code'],

  registers: [register],

});

// ── Middleware ──────────────────────────────────────────────────────

app.use(helmet());

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));

app.use(compression());

app.use(express.json());

app.use(morgan('combined'));

// Request timing middleware

app.use((req, res, next) => {

  const end = httpRequestDuration.startTimer();

  res.on('finish', () => {

    const labels = { method: req.method, route: req.path, status_code: res.statusCode };

    end(labels);

    httpRequestTotal.inc(labels);

  });

  next();

});

// ── Health & Metrics endpoints ──────────────────────────────────────

app.get('/health', async (req, res) => {

  try {

    await pool.query('SELECT 1');

    res.json({ status: 'healthy', db: 'connected', timestamp: new Date().toISOString() });

  } catch {

    res.status(503).json({ status: 'unhealthy', db: 'disconnected' });

  }

});

app.get('/ready', (req, res) => res.json({ status: 'ready' }));

app.get('/metrics', async (req, res) => {

  res.set('Content-Type', register.contentType);

  res.end(await register.metrics());

});

// ── API routes ──────────────────────────────────────────────────────

app.use('/api', routes);

// ── Error handler ───────────────────────────────────────────────────

app.use((err, req, res, _next) => {

  console.error(err);

  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });

});

app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
 