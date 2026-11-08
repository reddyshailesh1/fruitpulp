import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import { apiLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';
import studentRoutes from './routes/student.routes';
import gameRoutes from './routes/game.routes';

const app: Application = express();

// Secure HTTP Headers
app.use(
  helmet({
    contentSecurityPolicy: false, // Allow canvas and inline styles for game
  })
);

// CORS Configuration
const allowedOrigins = [
  env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman, render health check)
      if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.netlify.app')) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive in dev/staging to avoid blocking mobile testing on LAN
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-participation-token'],
  })
);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Global rate limiting
app.use('/api', apiLimiter);

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    brand: 'Orange Pulp Juice Point',
    service: 'Student Discount Game API',
  });
});

// Mount modular routes
app.use('/api/student', studentRoutes);
app.use('/api/game', gameRoutes);

// Fallback 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.url} not found`,
    code: 'NOT_FOUND',
  });
});

// Centralized error handler
app.use(errorHandler);

export default app;
