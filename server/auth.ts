import type { Request, Response, NextFunction } from 'express';
import crypto from 'node:crypto';
import { db } from './db.ts';

const SESSION_SECRET = process.env.SESSION_SECRET || 'devportfolio-auth-secure-secret-v1';

// In-memory set for explicit token revocations (e.g. upon logout)
const revokedTokens = new Set<string>();
const legacySessions = new Map<string, { userId: string; expiresAt: number }>();

// ----------------------------------------------------
// ANTI-BRUTE-FORCE & RATE LIMITING
// ----------------------------------------------------
interface AttemptRecord {
  count: number;
  firstAttempt: number;
  lastAttempt: number;
  blockedUntil?: number;
}

const loginAttempts = new Map<string, AttemptRecord>();
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes lock
const ATTEMPT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes window

export function checkBruteForce(identifier: string): { blocked: boolean; remainingMinutes?: number } {
  const now = Date.now();
  const record = loginAttempts.get(identifier);

  if (!record) return { blocked: false };

  // If currently blocked
  if (record.blockedUntil && record.blockedUntil > now) {
    const remainingMinutes = Math.ceil((record.blockedUntil - now) / 60000);
    return { blocked: true, remainingMinutes };
  }

  // If lockout or window has expired, reset
  if (record.blockedUntil && record.blockedUntil <= now) {
    loginAttempts.delete(identifier);
    return { blocked: false };
  }

  if (now - record.firstAttempt > ATTEMPT_WINDOW_MS) {
    loginAttempts.delete(identifier);
    return { blocked: false };
  }

  return { blocked: false };
}

export function recordFailedLogin(identifier: string): { blocked: boolean; remainingAttempts: number; remainingMinutes?: number } {
  const now = Date.now();
  let record = loginAttempts.get(identifier);

  if (!record || now - record.firstAttempt > ATTEMPT_WINDOW_MS) {
    record = {
      count: 1,
      firstAttempt: now,
      lastAttempt: now,
    };
  } else {
    record.count += 1;
    record.lastAttempt = now;
  }

  if (record.count >= MAX_FAILED_ATTEMPTS) {
    record.blockedUntil = now + LOCKOUT_DURATION_MS;
    loginAttempts.set(identifier, record);
    return {
      blocked: true,
      remainingAttempts: 0,
      remainingMinutes: Math.ceil(LOCKOUT_DURATION_MS / 60000),
    };
  }

  loginAttempts.set(identifier, record);
  return {
    blocked: false,
    remainingAttempts: Math.max(0, MAX_FAILED_ATTEMPTS - record.count),
  };
}

export function resetFailedLogin(identifier: string) {
  loginAttempts.delete(identifier);
}

export function createSessionToken(userId: string): string {
  // 30 days expiration to prevent premature session timeouts
  const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000;
  const nonce = crypto.randomBytes(16).toString('hex');
  const payload = `${userId}:${expiresAt}:${nonce}`;
  const signature = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('hex');
  const token = `${Buffer.from(payload).toString('base64url')}.${signature}`;
  return token;
}

export function verifySessionToken(token: string): boolean {
  if (!token) return false;
  if (revokedTokens.has(token)) return false;

  // Signed token format: <payload_base64url>.<hmac_signature>
  if (token.includes('.')) {
    const parts = token.split('.');
    if (parts.length !== 2) return false;

    const [encodedPayload, signature] = parts;
    let payload = '';
    try {
      payload = Buffer.from(encodedPayload, 'base64url').toString('utf-8');
    } catch {
      return false;
    }

    const expectedSignature = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('hex');
    // Constant-time comparison to prevent timing attacks
    if (
      signature.length !== expectedSignature.length ||
      !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))
    ) {
      return false;
    }

    const [userId, expiresAtStr] = payload.split(':');
    const expiresAt = Number(expiresAtStr);
    if (!userId || isNaN(expiresAt)) return false;

    // Check expiration timestamp
    if (Date.now() > expiresAt) {
      return false;
    }

    return true;
  }

  // Backwards compatibility with any legacy tokens
  const session = legacySessions.get(token);
  if (!session) return false;
  if (Date.now() > session.expiresAt) {
    legacySessions.delete(token);
    return false;
  }
  return true;
}

export function revokeSessionToken(token: string) {
  if (token) {
    revokedTokens.add(token);
    legacySessions.delete(token);
  }
}

export interface AuthenticatedRequest extends Request {
  adminUser?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Accès non autorisé : Token manquant' });
    return;
  }

  const token = authHeader.substring(7).trim();
  if (!verifySessionToken(token)) {
    res.status(401).json({ error: 'Session invalide ou expirée. Veuillez vous reconnecter.' });
    return;
  }

  const admin = db.get().admin;
  req.adminUser = {
    id: admin.id,
    email: admin.email,
    name: admin.name,
    role: admin.role,
  };

  next();
}
