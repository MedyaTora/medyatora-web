import { NextResponse } from "next/server";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getMysqlPool } from "@/lib/mysql";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function createCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function hashCode(code: string) {
  return crypto.createHash("sha256").update(code).digest("hex");
}

function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} environment variable eksik.`);
  }

  return value;
}

async function sendEmailCode({
  to,
  code,
}: {
  to: string;
  code: string;
}) {
  const host = getRequiredEnv("SMTP_HOST");
  const port = Number(process.env.SMTP_PORT || 587);
  const user = getRequiredEnv("SMTP_USER");
  const pass = getRequiredEnv("SMTP_PASSWORD");
  const from = process.env.SMTP_FROM || user;

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });

  await transporter.sendMail({
    from,
    to,
    subject: "MedyaTora E-posta Doğrulama Kodu",
    text: `MedyaTora e-posta doğrulama kodunuz: ${code}

Bu kod 10 dakika geçerlidir.

Bu işlemi siz başlatmadıysanız bu e-postayı yok sayabilirsiniz.`,
    html: `
      <div style="font-family:Arial,sans-serif;background:#0b0d12;color:#ffffff;padding:24px;border-radius:18px;">
        <h2 style="margin:0 0 12px;">MedyaTora E-posta Doğrulama</h2>
        <p style="color:#cbd5e1;">E-posta doğrulama kodunuz:</p>
        <div style="font-size:32px;font-weight:800;letter-spacing:6px;background:#ffffff;color:#000000;padding:16px 20px;border-radius:14px;display:inline-block;">
          ${code}
        </div>
        <p style="margin-top:18px;color:#94a3b8;">Bu kod 10 dakika geçerlidir.</p>
        <p style="color:#64748b;font-size:13px;">Bu işlemi siz başlatmadıysanız bu e-postayı yok sayabilirsiniz.</p>
      </div>
    `,
  });
}

export async function POST() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Giriş yapmalısın." },
        { status: 401 }
      );
    }

    if (user.email_verified) {
      return NextResponse.json({
        success: true,
        alreadyVerified: true,
        message: "E-posta zaten doğrulanmış.",
      });
    }

    const pool = getMysqlPool();

    const code = createCode();
    const codeHash = hashCode(code);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await pool.query(
      `
      INSERT INTO email_verification_tokens
        (user_id, email, token, expires_at, used_at, created_at)
      VALUES
        (?, ?, ?, ?, NULL, NOW())
      `,
      [user.id, user.email, codeHash, expiresAt]
    );

    await sendEmailCode({
      to: user.email,
      code,
    });

    return NextResponse.json({
      success: true,
      message: "Doğrulama kodu e-posta adresine gönderildi.",
      expiresInSeconds: 600,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Kod gönderilirken hata oluştu.";

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}