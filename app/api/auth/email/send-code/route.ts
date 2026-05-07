import { NextResponse } from "next/server";
import crypto from "crypto";
import {
  buildMedyatoraMailHtml,
  buildMedyatoraMailText,
  sendMail,
} from "@/lib/mail";
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

    await sendMail({
      to: user.email,
      subject: "MedyaTora E-posta Doğrulama Kodu",
      text: buildMedyatoraMailText({
        title: "MedyaTora E-posta Doğrulama",
        intro: "E-posta doğrulama işlemini tamamlamak için aşağıdaki kodu kullanabilirsin.",
        highlightLabel: "Doğrulama Kodu",
        highlightValue: code,
        bodyLines: [
          "Bu kod 10 dakika boyunca geçerlidir.",
          "Eğer bu işlemi sen başlatmadıysan bu e-postayı dikkate alma.",
        ],
        footerNote:
          "Detaylar için Hesabım alanını kontrol edebilirsin. İyi günler dileriz. MedyaTora Ekibi",
      }),
      html: buildMedyatoraMailHtml({
        title: "MedyaTora E-posta Doğrulama",
        intro:
          "E-posta doğrulama işlemini tamamlamak için aşağıdaki kodu kullanabilirsin.",
        highlightLabel: "Doğrulama Kodu",
        highlightValue: code,
        bodyLines: [
          "Bu kod 10 dakika boyunca geçerlidir.",
          "Eğer bu işlemi sen başlatmadıysan bu e-postayı dikkate alma.",
        ],
        footerNote:
          "Detaylar için Hesabım alanını kontrol edebilirsin. İyi günler dileriz. MedyaTora Ekibi",
      }),
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