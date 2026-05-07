import nodemailer from "nodemailer";

type SendMailInput = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

type BuildMailHtmlInput = {
  title: string;
  preview?: string;
  lines: string[];
  buttonText?: string;
  buttonUrl?: string;
};

function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} environment variable eksik.`);
  }

  return value;
}

function escapeHtml(value: string) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function buildMedyatoraMailHtml({
  title,
  preview,
  lines,
  buttonText,
  buttonUrl,
}: BuildMailHtmlInput) {
  const safeTitle = escapeHtml(title);
  const safePreview = escapeHtml(preview || "");
  const paragraphs = lines
    .map(
      (line) =>
        `<p style="margin:0 0 14px;color:#d1d5db;font-size:15px;line-height:1.7;">${escapeHtml(
          line
        )}</p>`
    )
    .join("");

  const button =
    buttonText && buttonUrl
      ? `
        <a href="${escapeHtml(
          buttonUrl
        )}" style="display:inline-block;margin-top:8px;background:#ffffff;color:#050505;text-decoration:none;font-weight:800;padding:13px 18px;border-radius:14px;font-size:14px;">
          ${escapeHtml(buttonText)}
        </a>
      `
      : "";

  return `
    <div style="margin:0;padding:0;background:#050505;">
      <div style="display:none;max-height:0;overflow:hidden;color:transparent;opacity:0;">
        ${safePreview}
      </div>

      <div style="font-family:Arial,Helvetica,sans-serif;max-width:640px;margin:0 auto;padding:28px 18px;">
        <div style="background:#0b0d12;border:1px solid rgba(255,255,255,0.10);border-radius:24px;overflow:hidden;">
          <div style="padding:24px 24px 18px;border-bottom:1px solid rgba(255,255,255,0.10);">
            <div style="letter-spacing:0.28em;color:#a3a3a3;font-size:11px;font-weight:800;text-transform:uppercase;">
              MEDYATORA
            </div>
            <h1 style="margin:12px 0 0;color:#ffffff;font-size:24px;line-height:1.3;">
              ${safeTitle}
            </h1>
          </div>

          <div style="padding:24px;">
            ${paragraphs}
            ${button}

            <div style="margin-top:24px;padding-top:18px;border-top:1px solid rgba(255,255,255,0.10);">
              <p style="margin:0;color:#9ca3af;font-size:13px;line-height:1.7;">
                Detaylar için hesabınızdan işlem durumunu kontrol edebilirsiniz.
              </p>
              <p style="margin:10px 0 0;color:#ffffff;font-size:14px;font-weight:700;">
                İyi günler,<br />
                MedyaTora Ekibi
              </p>
            </div>
          </div>
        </div>

        <p style="margin:16px 0 0;text-align:center;color:#6b7280;font-size:12px;line-height:1.6;">
          Bu e-posta MedyaTora hesabınızla ilgili bilgilendirme amacıyla gönderilmiştir.
        </p>
      </div>
    </div>
  `;
}

export async function sendMail({ to, subject, text, html }: SendMailInput) {
  const host = getRequiredEnv("SMTP_HOST");
  const port = Number(process.env.SMTP_PORT || 587);
  const user = getRequiredEnv("SMTP_USER");
  const pass = getRequiredEnv("SMTP_PASSWORD");
  const from = process.env.SMTP_FROM || `MedyaTora <${user}>`;

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
    subject,
    text,
    html,
  });
}