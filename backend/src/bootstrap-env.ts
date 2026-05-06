export function assertRequiredProductionEnv(): void {
  if (process.env.NODE_ENV !== 'production') return;

  const missing: string[] = [];

  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    missing.push('JWT_SECRET (at least 32 characters)');
  }
  if (!process.env.GOOGLE_CLIENT_ID) missing.push('GOOGLE_CLIENT_ID');
  if (!process.env.GOOGLE_CLIENT_SECRET) missing.push('GOOGLE_CLIENT_SECRET');
  if (!process.env.GOOGLE_CALLBACK_URL) missing.push('GOOGLE_CALLBACK_URL');

  const hasDb =
    Boolean(process.env.DATABASE_URL?.trim()) ||
    Boolean(process.env.DATABASE_HOST?.trim()) ||
    process.env.USE_SQLITE === 'true';
  if (!hasDb) {
    missing.push('DATABASE_URL or DATABASE_HOST (or USE_SQLITE=true)');
  }

  const hasCorsOrigin =
    Boolean(process.env.FRONTEND_URLS?.trim()) || Boolean(process.env.FRONTEND_URL?.trim());
  if (!hasCorsOrigin) {
    missing.push('FRONTEND_URL or FRONTEND_URLS (for CORS)');
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing or invalid environment variables for production:\n- ${missing.join('\n- ')}`,
    );
  }
}
