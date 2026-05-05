import crypto from "crypto";

export const PHONE_BONUS_TYPE = "contact_verification_bonus";
export const PHONE_VERIFICATION_MAX_ATTEMPTS = 5;

type HashPhoneVerificationCodeParams = {
  userId: number | string;
  phoneNumber: string;
  code: string;
};

function getPhoneVerificationSecret() {
  return (
    process.env.PHONE_VERIFICATION_SECRET ||
    process.env.ADMIN_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    "medyatora-local-phone-secret"
  );
}

export function normalizePhoneNumber(value: unknown) {
  const raw = String(value || "").trim();

  if (!raw) return "";

  const hasPlus = raw.startsWith("+");
  const digits = raw.replace(/\D/g, "");

  if (!digits) return "";

  if (hasPlus) {
    if (digits.startsWith("90")) {
      return `+90${digits.slice(2)}`;
    }

    if (digits.startsWith("7")) {
      return `+7${digits.slice(1)}`;
    }

    return `+${digits}`;
  }

  if (digits.startsWith("90")) {
    return `+90${digits.slice(2)}`;
  }

  if (digits.startsWith("7")) {
    return `+7${digits.slice(1)}`;
  }

  if (digits.startsWith("0") && digits.length === 11) {
    return `+90${digits.slice(1)}`;
  }

  if (digits.length === 10 && digits.startsWith("5")) {
    return `+90${digits}`;
  }

  if (digits.length === 10 && digits.startsWith("9")) {
    return `+7${digits}`;
  }

  return `+${digits}`;
}

export function isValidNormalizedPhone(phoneNumber: string) {
  const value = normalizePhoneNumber(phoneNumber);

  if (value.startsWith("+90")) {
    const digits = value.replace(/\D/g, "");
    return digits.length === 12 && digits.startsWith("90");
  }

  if (value.startsWith("+7")) {
    const digits = value.replace(/\D/g, "");
    return digits.length === 11 && digits.startsWith("7");
  }

  return false;
}

export function maskPhoneNumber(phoneNumber: string) {
  const value = normalizePhoneNumber(phoneNumber);

  if (!value) return "";

  if (value.startsWith("+90")) {
    const local = value.slice(3);

    if (local.length < 10) return value;

    return `+90 ${local.slice(0, 3)} *** ** ${local.slice(-2)}`;
  }

  if (value.startsWith("+7")) {
    const local = value.slice(2);

    if (local.length < 10) return value;

    return `+7 ${local.slice(0, 3)} *** ** ${local.slice(-2)}`;
  }

  const visibleStart = value.slice(0, 4);
  const visibleEnd = value.slice(-2);

  return `${visibleStart} *** ** ${visibleEnd}`;
}

export function hashPhoneVerificationCode({
  userId,
  phoneNumber,
  code,
}: HashPhoneVerificationCodeParams) {
  const normalizedPhone = normalizePhoneNumber(phoneNumber);
  const normalizedCode = String(code || "").replace(/\D/g, "").slice(0, 6);

  return crypto
    .createHmac("sha256", getPhoneVerificationSecret())
    .update(`${userId}:${normalizedPhone}:${normalizedCode}`)
    .digest("hex");
}

export function createPhoneVerificationCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function getPhoneCountryCode(phoneNumber: string): "TR" | "RU" | null {
  const value = normalizePhoneNumber(phoneNumber);

  if (value.startsWith("+90")) return "TR";
  if (value.startsWith("+7")) return "RU";

  return null;
}