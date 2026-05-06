/** Postgres schema sync: dev on by default; prod off unless DATABASE_SYNCHRONIZE=true */
export function resolvePostgresSynchronize(): boolean {
  const explicit = process.env.DATABASE_SYNCHRONIZE;
  if (explicit === 'true') return true;
  if (explicit === 'false') return false;
  return process.env.NODE_ENV !== 'production';
}
