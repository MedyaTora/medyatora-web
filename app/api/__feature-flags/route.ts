import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const googleEnabled = Boolean(process.env.GOOGLE_CLIENT_ID);
  const phoneEnabled = String(process.env.PHONE_VERIFICATION_ENABLED || "").toLowerCase() === "1" || String(process.env.PHONE_VERIFICATION_ENABLED || "").toLowerCase() === "true";

  return NextResponse.json({
    ok: true,
    features: {
      google_oauth_enabled: googleEnabled,
      phone_verification_enabled: phoneEnabled,
    },
  });
}
