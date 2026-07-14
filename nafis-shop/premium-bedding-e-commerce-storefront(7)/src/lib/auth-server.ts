import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "nafis_jwt_secret_change_me_in_production_env"
);

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PHONE = "09130965236";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "n@05f@1405s";

export interface AdminPayload extends Record<string, unknown> {
  role: "admin";
  username: string;
}

/** Create a JWT for the admin session (server-side only) */
export async function createAdminToken(username: string): Promise<string> {
  return new SignJWT({ role: "admin", username } satisfies AdminPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(JWT_SECRET);
}

/** Verify a JWT and return the payload if valid */
export async function verifyToken(token: string): Promise<AdminPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.role === "admin") {
      return payload as unknown as AdminPayload;
    }
    return null;
  } catch {
    return null;
  }
}

/** Check admin credentials */
export function validateAdminCredentials(
  username: string,
  password: string
): boolean {
  const cleanUser = username.trim();
  const cleanPass = password.trim();

  const isValidUser =
    cleanUser === ADMIN_USERNAME ||
    cleanUser === ADMIN_PHONE ||
    cleanUser.toLowerCase() === "nafis";

  const isValidPass = cleanPass === ADMIN_PASSWORD;

  return isValidUser && isValidPass;
}

export const ADMIN_COOKIE_NAME = "nafis_admin_token";
