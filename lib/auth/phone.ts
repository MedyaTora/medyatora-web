import crypto from "crypto";

export const PHONE_BONUS_TYPE = "welcome_phone_verify";
export const PHONE_VERIFICATION_CODE_TTL_MINUTES = 10;
export const PHONE_VERIFICATION_MAX_ATTEMPTS = 5;

function onlyDigits(value: string) {
  return String(value || "").replace(/\D/g, "");
}

export function normalizePhoneNumber(value: unknown) {
  const raw = String(value || "").trim();

  if (!raw) {
    return "";
  }

  const digits = onlyDigits(raw);

  if (!digits) {
    return "";
  }

  // Türkiye formatları:
  // 05530739292   -> +905530739292
  // 5530739292    -> +905530739292
  // 905530739292  -> +905530739292
  // +905530739292 -> +905530739292
  if (digits.length === 11 && digits.startsWith("0")) {
    return `+90${digits.slice(1)}`;
  }

  if (digits.length === 10 && digits.startsWith("5")) {
    return `+90${digits}`;
  }

  if (digits.length === 12 && digits.startsWith("90")) {
    return `+${digits}`;
  }

  // Rusya / uluslararası basit destek:
  // +79991234567 gibi gelenleri korur.
  if (raw.startsWith("+") && digits.length >= 10 && digits.length <= 15) {
    return `+${digits}`;
  }

  // Kullanıcı + koymadan uluslararası yazdıysa:
  // 79991234567 -> +79991234567
  if (digits.length >= 10 && digits.length <= 15) {
    return `+${digits}`;
  }

  return "";
}

export function isValidNormalizedPhone(phone: string) {
  return /^\+[1-9]\d{9,14}$/.test(phone);
}

export function maskPhoneNumber(phone: string) {
  const normalized = normalizePhoneNumber(phone);

  if (!normalized) {
    return "";
  }

  const first = normalized.slice(0, 5);
  const last = normalized.slice(-4);

  return `${first}***${last}`;
}

export function createPhoneVerificationCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function getOtpSecret() {
  return (
    process.env.PHONE_OTP_SECRET ||
    process.env.ADMIN_SECRET ||
    process.env.MYSQL_PASSWORD ||
    "medyatora-local-phone-secret"
  );
}

export function hashPhoneVerificationCode({
  userId,
  phoneNumber,
  code,
}: {
  userId: number;
  phoneNumber: string;
  code: string;
}) {
  return crypto
    .createHash("sha256")
    .update(`${getOtpSecret()}|${userId}|${phoneNumber}|${code}`)
    .digest("hex");
}

export function getPhoneVerificationExpiryDate() {
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + PHONE_VERIFICATION_CODE_TTL_MINUTES);
  return expiresAt;
}