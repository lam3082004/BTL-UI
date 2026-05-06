/**
 * Render Postgres: internal URLs use host `dpg-…-a` (plain TCP on private network).
 * External URLs use `*.render.com` and typically need TLS from the client.
 */
export function resolvePostgresSsl(
  databaseUrl: string | undefined,
): boolean | { rejectUnauthorized: false } | undefined {
  const explicit = process.env.DATABASE_SSL?.trim().toLowerCase();
  if (explicit === 'false' || explicit === '0') {
    return false;
  }
  if (explicit === 'true' || explicit === '1') {
    return { rejectUnauthorized: false };
  }

  if (!databaseUrl?.trim()) {
    return undefined;
  }

  try {
    const normalized = databaseUrl.startsWith('postgresql://')
      ? `postgres://${databaseUrl.slice('postgresql://'.length)}`
      : databaseUrl;
    const u = new URL(normalized);
    const mode = u.searchParams.get('sslmode')?.toLowerCase();
    if (mode === 'require' || mode === 'verify-ca' || mode === 'verify-full') {
      return { rejectUnauthorized: false };
    }
    if (u.hostname.endsWith('render.com')) {
      return { rejectUnauthorized: false };
    }
    return false;
  } catch {
    return undefined;
  }
}
