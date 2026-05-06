import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { assertRequiredProductionEnv } from './bootstrap-env';

const normalizeOrigin = (value: string) => value.trim().replace(/\/$/, '');

async function bootstrap() {
  assertRequiredProductionEnv();

  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend
  app.enableCors({
    origin: (origin, callback) => {
      // In local/dev (including testing on phone via LAN IP), allow all origins.
      if (process.env.NODE_ENV !== 'production') {
        callback(null, true);
        return;
      }

      const allowedOrigins = (process.env.FRONTEND_URLS || process.env.FRONTEND_URL || '')
        .split(',')
        .map(normalizeOrigin)
        .filter(Boolean);

      // Allow localhost on any port during development
      if (!origin || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
        callback(null, true);
      } else if (allowedOrigins.includes(normalizeOrigin(origin))) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'), false);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  const port = process.env.PORT || 3001;
  // Bind explicitly to all interfaces so phones on LAN can reach the API.
  await app.listen(port, '0.0.0.0');
  console.log(`✨ NumSense Backend running on http://0.0.0.0:${port}`);
}

bootstrap();
