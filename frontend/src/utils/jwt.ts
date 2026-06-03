export const decodeJwtPayload = <T = Record<string, unknown>>(rawToken: string | null): T | null => {
  if (!rawToken) return null;

  try {
    const payload = rawToken.split('.')[1];
    if (!payload) return null;

    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const binary = window.atob(padded);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    const json = new TextDecoder().decode(bytes);
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
};

export const repairMojibake = (value: string | undefined): string | undefined => {
  if (!value || !/[ÃÂ]/.test(value)) return value;

  try {
    const bytes = Uint8Array.from(value, (char) => char.charCodeAt(0));
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    return value;
  }
};
