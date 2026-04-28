import { NextRequest, NextResponse } from "next/server";
import { getMysqlPool } from "@/lib/mysql";

type VisitorTrackBody = {
  visitor_id?: string;
  path?: string;
  locale?: string;
  event_type?: string;
  event_label?: string;
  event_value?: string;
  event_data?: Record<string, unknown>;
  screen_width?: number;
  screen_height?: number;
  timezone?: string;
  browser_language?: string;
};

function getPool() {
  return getMysqlPool();
}

function getClientIp(req: NextRequest) {
  const forwardedFor = req.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "";
  }

  return req.headers.get("x-real-ip") || req.headers.get("cf-connecting-ip") || "";
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as VisitorTrackBody;

    const visitorId = String(body.visitor_id || "").trim();
    const path = String(body.path || "/").trim();
    const locale = String(body.locale || "tr").trim();
    const eventType = String(body.event_type || "page_view").trim();

    const eventLabel = String(body.event_label || "").trim();
    const eventValue = String(body.event_value || "").trim();
    const eventData = body.event_data || null;

    if (!visitorId) {
      return NextResponse.json({ error: "visitor_id eksik." }, { status: 400 });
    }

    const ipAddress = getClientIp(req);
    const userAgent = req.headers.get("user-agent") || "";
    const referrer = req.headers.get("referer") || "";

    const screenWidth =
      typeof body.screen_width === "number" ? body.screen_width : null;

    const screenHeight =
      typeof body.screen_height === "number" ? body.screen_height : null;

    const timezone = String(body.timezone || "").trim();
    const browserLanguage = String(body.browser_language || "").trim();

    const pool = getPool();

    await pool.execute(
      `
      INSERT INTO visitor_sessions (
        session_id,
        visitor_id,
        ip_address,
        current_path,
        locale,
        user_agent,
        referrer,
        screen_width,
        screen_height,
        timezone,
        browser_language,
        first_seen_at,
        last_seen_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      ON DUPLICATE KEY UPDATE
        visitor_id = VALUES(visitor_id),
        ip_address = VALUES(ip_address),
        current_path = VALUES(current_path),
        locale = VALUES(locale),
        user_agent = VALUES(user_agent),
        referrer = VALUES(referrer),
        screen_width = VALUES(screen_width),
        screen_height = VALUES(screen_height),
        timezone = VALUES(timezone),
        browser_language = VALUES(browser_language),
        last_seen_at = NOW()
      `,
      [
        visitorId,
        visitorId,
        ipAddress,
        path,
        locale,
        userAgent,
        referrer,
        screenWidth,
        screenHeight,
        timezone,
        browserLanguage,
      ]
    );

    if (eventType !== "heartbeat") {
      await pool.execute(
        `
        INSERT INTO visitor_events (
          session_id,
          visitor_id,
          ip_address,
          event_type,
          event_label,
          event_value,
          event_data,
          path,
          locale,
          user_agent,
          referrer,
          screen_width,
          screen_height,
          timezone,
          browser_language
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          visitorId,
          visitorId,
          ipAddress,
          eventType,
          eventLabel,
          eventValue,
          eventData ? JSON.stringify(eventData) : null,
          path,
          locale,
          userAgent,
          referrer,
          screenWidth,
          screenHeight,
          timezone,
          browserLanguage,
        ]
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("visitor-track error:", error);

    return NextResponse.json(
      { error: "Ziyaretçi kaydı alınamadı." },
      { status: 500 }
    );
  }
}
