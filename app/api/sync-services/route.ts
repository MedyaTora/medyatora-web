import { NextResponse } from "next/server";

function isAuthorized(req: Request) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) return true;
  if (!authHeader) return false;

  return authHeader === `Bearer ${cronSecret}`;
}

export async function POST(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Yetkisiz istek." }, { status: 401 });
  }

  return NextResponse.json(
    {
      success: false,
      disabled: true,
      message:
        "Bu route eski JSON seed sistemi içindi. Servis senkronizasyonu artık /api/panel-sync üzerinden MySQL'e yapılır.",
    },
    { status: 410 }
  );
}

export async function GET(req: Request) {
  return POST(req);
}
