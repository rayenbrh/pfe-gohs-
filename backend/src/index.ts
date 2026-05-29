import 'express-async-errors';

import express from 'express';
import type { Server } from 'http';

import { connectDB, disconnectDB } from './config/db';
import logger from './config/logger';

import compression from 'compression';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoSanitize from 'express-mongo-sanitize';
import helmet from 'helmet';
import hpp from 'hpp';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';

import { configureCloudinary } from './config/cloudinary';
import { verifyEmailConnection } from './config/email';
import { swaggerSpec } from './config/swagger';
import { startCronJobs } from './jobs/maintenanceAlert.job';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { capListLimit, requestContext } from './middleware/request.middleware';
import { globalLimiter } from './middleware/rateLimiter.middleware';
import apiRoutes from './routes';

import { readFileSync } from 'fs';
import { join } from 'path';

const APP_VERSION = JSON.parse(
  readFileSync(join(__dirname, '..', 'package.json'), 'utf-8'),
).version as string;

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;

app.disable('x-powered-by');
app.set('trust proxy', 1);

// ─── Security middleware ──────────────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https://res.cloudinary.com'],
      },
    },
  }),
);

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200,
  }),
);

app.use(requestContext);

app.use(hpp());
app.use(mongoSanitize());
app.use(compression());

// ─── Request middleware ─────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(
  morgan('combined', {
    stream: {
      write: (msg: string) => logger.http(msg.trim()),
    },
  }),
);

// Attach request ID to Morgan-style access logs via custom token is handled by requestContext header

app.use('/uploads', express.static(join(process.cwd(), 'uploads')));

// ─── Health check (before rate limiting) ───────────────────────────────────────
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV ?? 'development',
    version: APP_VERSION,
  });
});

// ─── Rate limiting + API routes ────────────────────────────────────────────────
app.use('/api', capListLimit, globalLimiter, apiRoutes);

if (process.env.NODE_ENV === 'development') {
  app.use(
    '/api/docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customSiteTitle: 'Inova Ride API Docs',
      customCss: '.swagger-ui .topbar { background: #07060D; }',
      swaggerOptions: { persistAuthorization: true },
    }),
  );
  logger.info('Swagger UI available at /api/docs');
}

// ─── 404 + global error handler (must be last) ─────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

let server: Server;

process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! Shutting down...', {
    error: err.message,
    stack: err.stack,
  });
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.error('UNHANDLED REJECTION! Shutting down...', { reason });
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});

function setupGracefulShutdown(httpServer: Server): void {
  const shutdown = (signal: string) => {
    logger.info(`Shutting down gracefully... (${signal})`);

    const forceTimer = setTimeout(() => {
      logger.error('Shutdown timed out after 10s — forcing exit');
      process.exit(1);
    }, 10000);

    httpServer.close(async () => {
      try {
        await disconnectDB();
        clearTimeout(forceTimer);
        process.exit(0);
      } catch (error) {
        logger.error(error instanceof Error ? error : new Error(String(error)));
        clearTimeout(forceTimer);
        process.exit(1);
      }
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

async function bootstrap(): Promise<void> {
  await connectDB();

  configureCloudinary();
  await verifyEmailConnection();
  if (process.env.NODE_ENV === 'production') {
    startCronJobs();
  } else {
    logger.info('Cron jobs disabled in development');
  }

  server = app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
  });

  server.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      logger.error(
        `Port ${PORT} is already in use. Stop the other process or set a different PORT in .env`,
      );
    } else {
      logger.error('Server failed to start', { error: err.message, code: err.code });
    }
    process.exit(1);
  });

  setupGracefulShutdown(server);
}

bootstrap().catch((error) => {
  logger.error(error instanceof Error ? error : new Error(String(error)));
  process.exit(1);
});

export default app;
