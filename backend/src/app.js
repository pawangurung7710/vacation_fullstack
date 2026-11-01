import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import path from 'path';
import { fileURLToPath } from 'url';
import routes from './routes/index.js';
import { errorHandler, notFound } from './middlewares/error.middleware.js';
import { apiRateLimiter } from './middlewares/rateLimit.middleware.js';
import { publicCacheControl } from './middlewares/cache.middleware.js';
import { responseCache } from './middlewares/responseCache.middleware.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Trust the reverse proxy (nginx) so protocol/IP detection and rate limiting work correctly
app.set('trust proxy', 1);

// Gzip/deflate every response above ~1KB. JSON payloads compress ~8-10x, which is the
// single biggest win for clients on high-latency / lossy links (the API is served from a
// single origin VPS with no CDN). nginx can also do this, but doing it here guarantees it
// regardless of how the proxy in front is configured.
app.use(
  compression({
    threshold: 1024,
    filter: (req, res) => {
      if (req.headers['x-no-compression']) return false;
      return compression.filter(req, res);
    },
  })
);

// Security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS configuration
const allowedOrigins = [
  'https://dev.trekkerssquad.example',
  'https://www.trekkerssquad.example',
  process.env.FRONTEND_URL, // Additional origin from env if provided
].filter(Boolean); // Remove any undefined values

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Trekkers Squad API is running successfully',
    timestamp: new Date().toISOString(),
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Health check passed',
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

// Rate limiting
app.use('/api', apiRateLimiter);

// Allow shared/CDN caches (e.g. Cloudflare) to hold unauthenticated GET responses for a
// short window, with stale-while-revalidate so a cache miss never blocks a user on the
// full origin round-trip. Authenticated requests are always marked no-store.
app.use('/api', publicCacheControl);

// Serve repeat anonymous reads (edge revalidations, cold PoPs) from RAM for a few seconds
// so a burst costs one DB query, not dozens. Also busts on any write.
app.use('/api', responseCache);

// Serve uploaded files
const uploadsDir = process.env.UPLOAD_DIR || 'uploads';
app.use(
  '/uploads',
  express.static(path.join(__dirname, '..', uploadsDir), {
    maxAge: '30d',
    immutable: true,
  })
);

// API routes
app.use('/api/v1', routes);

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

export default app;
