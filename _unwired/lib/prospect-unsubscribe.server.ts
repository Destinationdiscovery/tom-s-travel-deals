/**
 * Opt-out link signing. Server only.
 * The link carries the address and the lead id plus an HMAC signature, so a link can only ever
 * opt out the address it was generated for. The signing key is derived from a secret this project
 * already has, so nothing extra has to be set up.
 */

const encoder = new TextEncoder();

function secret(): string {
  const key = process.env["SUPABASE_SERVICE_ROLE_KEY"];
  if (!key) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY for link signing");
  return `aventura:prospect-unsubscribe:${key}`;
}

async function hmacHex(message: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret()), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return [...new Uint8Array(signature)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function payload(email: string, prospectId: string): string {
  return `prospect-unsubscribe:${email.trim().toLowerCase()}:${prospectId}`;
}

export function signProspectUnsubscribe(email: string, prospectId: string): Promise<string> {
  return hmacHex(payload(email, prospectId));
}

/** Constant-time comparison so a wrong token gives nothing away. */
export async function verifyProspectUnsubscribe(email: string, prospectId: string, token: string): Promise<boolean> {
  const expected = await hmacHex(payload(email, prospectId));
  if (expected.length !== token.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ token.charCodeAt(i);
  return diff === 0;
}
