import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET!;

if (!JWT_SECRET) {
  throw new Error("Please define JWT_SECRET in .env.local");
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: "admin" | "user";
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): TokenPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
}

export function getTokenFromRequest(request: NextRequest): string | null {
  // Check Authorization header
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }

  // Check cookie
  const token = request.cookies.get("token")?.value;
  return token || null;
}

export async function authenticateRequest(
  request: NextRequest
): Promise<TokenPayload> {
  const token = getTokenFromRequest(request);

  if (!token) {
    throw new Error("No token provided");
  }

  return verifyToken(token);
}

export function isAdmin(payload: TokenPayload): boolean {
  return payload.role === "admin";
}
