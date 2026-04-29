import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

export async function hashPassword(password: string) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, passwordHash: string) {
  return bcrypt.compare(password, passwordHash);
}

export function validatePassword(password: string) {
  const errors: string[] = [];

  if (!password || password.length < 8) {
    errors.push("Şifre en az 8 karakter olmalıdır.");
  }

  if (password.length > 100) {
    errors.push("Şifre en fazla 100 karakter olabilir.");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function normalizeEmail(email: string) {
  return String(email || "").trim().toLowerCase();
}

export function isValidEmail(email: string) {
  const normalized = normalizeEmail(email);

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized);
}