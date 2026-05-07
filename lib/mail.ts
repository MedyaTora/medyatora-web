import nodemailer from "nodemailer";

type SendMailInput = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

type BuildMailInput = {
  title: string;
  intro?: string;
  highlightLabel?: string;
  highlightValue?: string;
  bodyLines?: string[];
  footerNote?: string;
};

let transporterCache: nodemailer.Transporter | null = null;

function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} environment variable eksik.`);
  }

  return value;
}

function getTransporter() {
  if (transporterCache) {
    return transporterCache;
  }

  const host = getRequiredEnv("SMTP_HOST");
  const port = Number(process.env.SMTP_PORT || 587);
  const user = getRequiredEnv("SMTP_USER");
  const pass = getRequiredEnv("SMTP_PASSWORD");

  transporterCache = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });

  return transporterCache;
}

export async function sendMail({
  to,
  subject,
  text,
  html,
}: SendMailInput) {
  const transporter = getTransporter();
  const fromAddress = process.env.SMTP_FROM || getRequiredEnv("SMTP_USER");
  const fromName = process.env.SMTP_FROM_NAME || "MedyaTora";

  await transporter.sendMail({
    from: `"${fromName}" <${fromAddress}>`,
    to,
    subject,
    text,
    html,
  });
}

export function buildMedyatoraMailText({
  title,
  intro,
  highlightLabel,
  highlightValue,
  bodyLines = [],
  footerNote,
}: BuildMailInput) {
  const parts = [
    title,
    intro || "",
    highlightLabel && highlightValue
      ? `${highlightLabel}: ${highlightValue}`
      : "",
    ...bodyLines,
    footerNote || "",
  ].filter(Boolean);

  return parts.join("\n\n");
}

export function buildMedyatoraMailHtml({
  title,
  intro,
  highlightLabel,
  highlightValue,
  bodyLines = [],
  footerNote,
}: BuildMailInput) {
  const linesHtml = bodyLines
    .map(
      (line) =>
        `<p style="margin:0 0 12px;color:#cbd5e1;font-size:15px;line-height:1.7;">${line}</p>`
    )
    .join("");

  const highlightHtml =
    highlightLabel && highlightValue
      ? `
        <div style="margin:20px 0 22px;">
          <div style="margin-bottom:8px;color:#94a3b8;font-size:13px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;">
            ${highlightLabel}
          </div>
          <div style="display:inline-block;padding:14px 18px;border-radius:16px;background:#ffffff;color:#000000;font-size:28px;font-weight:800;letter-spacing:4px;">
            ${highlightValue}
          </div>
        </div>
      `
      : "";

  return `
    <div style="margin:0;padding:24px;background:#07090d;font-family:Arial,sans-serif;color:#ffffff;">
      <div style="max-width:640px;margin:0 auto;border:1px solid rgba(255,255,255,0.08);border-radius:24px;overflow:hidden;background:#0b0f14;">
        <div style="padding:28px 28px 20px;border-bottom:1px solid rgba(255,255,255,0.08);">
          <div style="font-size:12px;font-weight:800;letter-spacing:0.18em;text-transform:uppercase;color:#94a3b8;margin-bottom:12px;">
            MedyaTora
          </div>
          <h1 style="margin:0;font-size:28px;line-height:1.25;color:#ffffff;">
            ${title}
          </h1>
        </div>

        <div style="padding:28px;">
          ${
            intro
              ? `<p style="margin:0 0 16px;color:#e2e8f0;font-size:15px;line-height:1.8;">${intro}</p>`
              : ""
          }

          ${highlightHtml}
          ${linesHtml}

          ${
            footerNote
              ? `
                <div style="margin-top:22px;padding-top:18px;border-top:1px solid rgba(255,255,255,0.08);">
                  <p style="margin:0;color:#94a3b8;font-size:13px;line-height:1.7;">
                    ${footerNote}
                  </p>
                </div>
              `
              : ""
          }
        </div>
      </div>
    </div>
  `;
}