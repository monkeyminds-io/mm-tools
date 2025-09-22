import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import path from 'path';
import { config } from './config/environment';
import { errorHandler } from './middleware/errorHandler';
import { solutionsRouter } from './routes/solutions';

const app = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false // Allow inline scripts for solutions
}));

// CORS - Allow all origins for now (you can restrict later)
app.use(cors({
  origin: true,
  methods: ['GET', 'HEAD', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Compression
app.use(compression());

// Logging
app.use(morgan(config.isDevelopment ? 'dev' : 'combined'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: config.isDevelopment ? 1000 : 100, // More lenient in dev
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ 
    status: 'healthy', 
    environment: config.nodeEnv,
    timestamp: new Date().toISOString()
  });
});

// Solutions routes
app.use('/', solutionsRouter);

// Serve static files from dist directory
app.use(express.static(path.join(__dirname, '../dist'), {
  maxAge: config.isDevelopment ? 0 : '1y', // No cache in dev, 1 year in prod
  etag: true,
  lastModified: true,
  setHeaders: (res, path) => {
    if (path.endsWith('.js') || path.endsWith('.css')) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    } else if (path.endsWith('.json')) {
      res.setHeader('Cache-Control', 'public, max-age=3600'); // 1 hour for manifests
    }
  }
}));

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Resource not found',
    path: req.originalUrl,
    suggestion: 'Visit /health to check if the service is running'
  });
});

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`🚀 MonkeyMinds Tools server running on port ${PORT}`);
  console.log(`📦 Environment: ${config.nodeEnv}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  
  if (config.isDevelopment) {
    console.log(`🛠️  Development mode: Hot reloading enabled`);
  }
});

export default app;