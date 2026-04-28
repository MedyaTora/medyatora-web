import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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

function getClientIp(req: NextRequest) {
  const forwardedFor = req.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "";
  }

  return (
    req.headers.get("x-real-ip") ||
    req.headers.get("cf-connecting-ip") ||
    ""
  );
}

export async function POST(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: "Supabase env eksik." },
        { status: 500 }
      );
    }

    const body = (await req.json().catch(() => ({}))) as VisitorTrackBody;

    const visitorId = String(body.visitor_id || "").trim();
    const path = String(body.path || "/").trim();
    const locale = String(body.locale || "tr").trim();
    const eventType = String(body.event_type || "page_view").trim();

    const eventLabel = String(body.event_label || "").trim();
    const eventValue = String(body.event_value || "").trim();
    const eventData = body.event_data || null;

    if (!visitorId) {
      return NextResponse.json(
        { error: "visitor_id eksik." },
        { status: 400 }
      );
    }

    const ipAddress = getClientIp(req);
    const userAgent = req.headers.get("user-agent") || "";
    const referrer = req.headers.get("referer") || "";
    const now = new Date().toISOString();

    const screenWidth =
      typeof body.screen_width === "number" ? body.screen_width : null;

    const screenHeight =
      typeof body.screen_height === "number" ? body.screen_height : null;

    const timezone = String(body.timezone || "").trim();
    const browserLanguage = String(body.browser_language || "").trim();

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { error: sessionError } = await supabase
      .from("visitor_sessions")
      .upsert(
        {
          visitor_id: visitorId,
          ip_address: ipAddress,
          current_path: path,
          locale,
          user_agent: userAgent,
          referrer,
          screen_width: screenWidth,
          screen_height: screenHeight,
          timezone,
          browser_language: browserLanguage,
          last_seen_at: now,
        },
        {
          onConflict: "visitor_id",
        }
      );

    if (sessionError) throw sessionError;

    if (eventType !== "heartbeat") {
      const { error: eventError } = await supabase
        .from("visitor_events")
        .insert({
          visitor_id: visitorId,
          ip_address: ipAddress,
          event_type: eventType,
          event_label: eventLabel,
          event_value: eventValue,
          event_data: eventData,
          path,
          locale,
          user_agent: userAgent,
          referrer,
          screen_width: screenWidth,
          screen_height: screenHeight,
          timezone,
          browser_language: browserLanguage,
        });

      if (eventError) throw eventError;
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