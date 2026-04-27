"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

function createVisitorId() {
  const random = Math.random().toString(36).slice(2, 12);
  const time = Date.now().toString(36);

  return `mt_${time}_${random}`;
}

function getVisitorId() {
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
  eventType: "page_view" | "heartbeat",
  path: string
) {
  const visitorId = getVisitorId();
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
      ...meta,
    }),
  });
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