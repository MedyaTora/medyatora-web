"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

type VisitorEventType =
  | "page_view"
  | "heartbeat"
  | "platform_select"
  | "category_select"
  | "service_select"
  | "quantity_entered"
  | "target_entered"
  | "add_to_cart"
  | "checkout_open"
  | "payment_method_select"
  | "order_created";

type VisitorActionPayload = {
  event_type: VisitorEventType;
  event_label?: string;
  event_value?: string;
  event_data?: Record<string, unknown>;
  path?: string;
};

function createVisitorId() {
  const random = Math.random().toString(36).slice(2, 12);
  const time = Date.now().toString(36);

  return `mt_${time}_${random}`;
}

export function getMedyatoraVisitorId() {
  if (typeof window === "undefined") return "";

  const key = "medyatora_visitor_id";

  let visitorId = localStorage.getItem(key);

  if (!visitorId) {
    visitorId = createVisitorId();
    localStorage.setItem(key, visitorId);
  }

  return visitorId;
}

function getVisitorMeta() {
  return {
    screen_width: window.screen?.width || window.innerWidth || null,
    screen_height: window.screen?.height || window.innerHeight || null,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "",
    browser_language: navigator.language || "",
  };
}

async function sendVisitorEvent(
  eventType: VisitorEventType,
  path: string,
  extra?: {
    event_label?: string;
    event_value?: string;
    event_data?: Record<string, unknown>;
  }
) {
  const visitorId = getMedyatoraVisitorId();
  const locale = localStorage.getItem("medyatora_locale") || "tr";
  const meta = getVisitorMeta();

  await fetch("/api/visitor-track", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      visitor_id: visitorId,
      path,
      locale,
      event_type: eventType,
      event_label: extra?.event_label || "",
      event_value: extra?.event_value || "",
      event_data: extra?.event_data || null,
      ...meta,
    }),
  });
}

export function trackVisitorAction(payload: VisitorActionPayload) {
  if (typeof window === "undefined") return;

  const path = payload.path || window.location.pathname;

  if (!path.startsWith("/smmtora")) return;

  sendVisitorEvent(payload.event_type, path, {
    event_label: payload.event_label,
    event_value: payload.event_value,
    event_data: payload.event_data,
  }).catch(() => {});
}

export default function VisitorTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname.startsWith("/smmtora")) return;

    sendVisitorEvent("page_view", pathname).catch(() => {});

    const interval = window.setInterval(() => {
      sendVisitorEvent("heartbeat", pathname).catch(() => {});
    }, 30000);

    return () => {
      window.clearInterval(interval);
    };
  }, [pathname]);

  return null;
}