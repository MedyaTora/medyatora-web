export const dynamic = "force-dynamic";
export const revalidate = 0;

import { createClient } from "@supabase/supabase-js";

type VisitorSessionRow = {
  id: number;
  visitor_id: string;
  ip_address: string | null;
  current_path: string | null;
  locale: string | null;
  user_agent: string | null;
  referrer: string | null;
  screen_width: number | null;
  screen_height: number | null;
  timezone: string | null;
  browser_language: string | null;
  first_seen_at: string | null;
  last_seen_at: string | null;
};

type VisitorEventRow = {
  id: number;
  visitor_id: string;
  ip_address: string | null;
  event_type: string | null;
  path: string | null;
  locale: string | null;
  user_agent: string | null;
  referrer: string | null;
  screen_width: number | null;
  screen_height: number | null;
  timezone: string | null;
  browser_language: string | null;
  created_at: string | null;
};

function formatDate(value: string | null | undefined) {
  if (!value) return "-";

  try {
    return new Date(value).toLocaleString("tr-TR");
  } catch {
    return "-";
  }
}

function getBrowser(userAgent: string | null | undefined) {
  const ua = String(userAgent || "").toLowerCase();

  if (!ua) return "-";
  if (ua.includes("edg")) return "Edge";
  if (ua.includes("opr") || ua.includes("opera")) return "Opera";
  if (ua.includes("chrome")) return "Chrome";
  if (ua.includes("safari")) return "Safari";
  if (ua.includes("firefox")) return "Firefox";

  return "Bilinmeyen";
}

function getOS(userAgent: string | null | undefined) {
  const ua = String(userAgent || "").toLowerCase();

  if (!ua) return "-";
  if (ua.includes("windows")) return "Windows";
  if (ua.includes("iphone")) return "iPhone";
  if (ua.includes("ipad")) return "iPad";
  if (ua.includes("android")) return "Android";
  if (ua.includes("mac os") || ua.includes("macintosh")) return "macOS";
  if (ua.includes("linux")) return "Linux";

  return "Bilinmeyen";
}

function getDeviceType(userAgent: string | null | undefined) {
  const ua = String(userAgent || "").toLowerCase();

  if (!ua) return "-";
  if (ua.includes("mobile") || ua.includes("iphone") || ua.includes("android")) {
    return "Mobil";
  }

  if (ua.includes("ipad") || ua.includes("tablet")) return "Tablet";

  return "Masaüstü";
}

function getReferrerLabel(referrer: string | null | undefined) {
  const value = String(referrer || "").toLowerCase();

  if (!value) return "Direkt giriş";
  if (value.includes("instagram")) return "Instagram";
  if (value.includes("google")) return "Google";
  if (value.includes("tiktok")) return "TikTok";
  if (value.includes("youtube")) return "YouTube";
  if (value.includes("facebook")) return "Facebook";
  if (value.includes("x.com") || value.includes("twitter")) return "X / Twitter";
  if (value.includes("t.me") || value.includes("telegram")) return "Telegram";

  return referrer || "-";
}

function getEventTypeLabel(type: string | null | undefined) {
  const map: Record<string, string> = {
    page_view: "Sayfa Girişi",
    heartbeat: "Aktiflik",
    platform_select: "Platform Seçti",
    category_select: "Kategori Seçti",
    service_select: "Hizmet Seçti",
    add_to_cart: "Sepete Ekledi",
    checkout_open: "Ödeme Ekranı Açtı",
    order_created: "Sipariş Oluşturdu",
  };

  return map[type || ""] || type || "-";
}

function isActiveVisitor(lastSeenAt: string | null | undefined) {
  if (!lastSeenAt) return false;

  const lastSeenTime = new Date(lastSeenAt).getTime();
  const now = Date.now();

  return now - lastSeenTime <= 2 * 60 * 1000;
}

function getDurationText(firstSeenAt: string | null, lastSeenAt: string | null) {
  if (!firstSeenAt || !lastSeenAt) return "-";

  const first = new Date(firstSeenAt).getTime();
  const last = new Date(lastSeenAt).getTime();
  const diffSeconds = Math.max(Math.floor((last - first) / 1000), 0);

  if (diffSeconds < 60) return `${diffSeconds} saniye`;

  const minutes = Math.floor(diffSeconds / 60);
  const seconds = diffSeconds % 60;

  if (minutes < 60) return `${minutes} dk ${seconds} sn`;

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return `${hours} sa ${remainingMinutes} dk`;
}

function uniqueCount(values: Array<string | null>) {
  return new Set(values.filter(Boolean)).size;
}

function ErrorScreen({ message }: { message: string }) {
  return (
    <main className="min-h-screen bg-[#050505] p-8 text-white">
      <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-red-300">
        Hata: {message}
      </div>
    </main>
  );
}

function InfoCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-xs uppercase tracking-wide text-white/35">{label}</p>
      <p className="mt-2 break-words text-lg font-bold text-white">{value}</p>
    </div>
  );
}

export default async function VisitorDetailPage({
  params,
}: {
  params: Promise<{ visitorId: string }>;
}) {
  const { visitorId } = await params;
  const decodedVisitorId = decodeURIComponent(visitorId);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return <ErrorScreen message="Supabase environment variables eksik." />;
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

  const { data: sessionData, error: sessionError } = await supabase
    .from("visitor_sessions")
    .select(`
      id,
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
    `)
    .eq("visitor_id", decodedVisitorId)
    .maybeSingle();

  const { data: eventData, error: eventError } = await supabase
    .from("visitor_events")
    .select(`
      id,
      visitor_id,
      ip_address,
      event_type,
      path,
      locale,
      user_agent,
      referrer,
      screen_width,
      screen_height,
      timezone,
      browser_language,
      created_at
    `)
    .eq("visitor_id", decodedVisitorId)
    .order("created_at", { ascending: false });

  if (sessionError) return <ErrorScreen message={sessionError.message} />;
  if (eventError) return <ErrorScreen message={eventError.message} />;

  const session = sessionData as VisitorSessionRow | null;
  const events = (eventData || []) as VisitorEventRow[];

  if (!session) {
    return <ErrorScreen message="Ziyaretçi bulunamadı." />;
  }

  const active = isActiveVisitor(session.last_seen_at);
  const pageViewEvents = events.filter((event) => event.event_type === "page_view");

  const uniquePages = uniqueCount(events.map((event) => event.path));
  const uniqueIps = uniqueCount(events.map((event) => event.ip_address));

  const deviceType = getDeviceType(session.user_agent);
  const browser = getBrowser(session.user_agent);
  const os = getOS(session.user_agent);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#171717_0%,#090909_55%,#050505_100%)] p-4 text-white md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5 shadow-[0_10px_40px_rgba(0,0,0,0.25)] backdrop-blur md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <a
                href="/admin"
                className="mb-4 inline-flex rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-bold text-white/75 transition hover:bg-white/[0.08]"
              >
                ← Admin Panele Dön
              </a>

              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-xs font-medium text-sky-300">
                Ziyaretçi Detayı
              </div>

              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                {session.ip_address || "IP bilinmiyor"}
              </h1>

              <p className="mt-2 break-all text-sm text-white/45">
                Visitor ID: {session.visitor_id}
              </p>
            </div>

            <span
              className={`rounded-full border px-4 py-2 text-sm font-bold ${
                active
                  ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                  : "border-white/10 bg-white/[0.04] text-white/50"
              }`}
            >
              {active ? "Şu an aktif" : "Pasif"}
            </span>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <InfoCard label="İlk Giriş" value={formatDate(session.first_seen_at)} />
          <InfoCard label="Son Görülme" value={formatDate(session.last_seen_at)} />
          <InfoCard
            label="Sitede Kalma"
            value={getDurationText(session.first_seen_at, session.last_seen_at)}
          />
          <InfoCard label="Sayfa Girişi" value={pageViewEvents.length} />
          <InfoCard label="Gezilen Farklı Sayfa" value={uniquePages} />
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <InfoCard label="Cihaz Tipi" value={deviceType} />
          <InfoCard label="Tarayıcı" value={browser} />
          <InfoCard label="İşletim Sistemi" value={os} />
          <InfoCard
            label="Ekran"
            value={
              session.screen_width && session.screen_height
                ? `${session.screen_width}x${session.screen_height}`
                : "-"
            }
          />
          <InfoCard label="Dil" value={(session.locale || "-").toUpperCase()} />
          <InfoCard label="Tarayıcı Dili" value={session.browser_language || "-"} />
          <InfoCard label="Saat Dilimi" value={session.timezone || "-"} />
          <InfoCard label="Farklı IP Sayısı" value={uniqueIps} />
        </section>

        <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5 md:p-6">
          <h2 className="text-2xl font-bold">Giriş Bilgileri</h2>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <MiniInfo label="IP Adresi" value={session.ip_address || "-"} />
            <MiniInfo label="Son Sayfa" value={session.current_path || "-"} />
            <MiniInfo label="Kaynak" value={getReferrerLabel(session.referrer)} />
            <MiniInfo label="Referrer Raw" value={session.referrer || "-"} />
            <MiniInfo label="User Agent" value={session.user_agent || "-"} />
            <MiniInfo label="Visitor ID" value={session.visitor_id} />
          </div>
        </section>

        <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5 md:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-2xl font-bold">Tüm Hareket Geçmişi</h2>

            <span className="text-sm text-white/45">{events.length} hareket</span>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[1150px] border-separate border-spacing-y-2 text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-white/40">
                <tr>
                  <th className="px-3 py-2">Saat</th>
                  <th className="px-3 py-2">Hareket</th>
                  <th className="px-3 py-2">Sayfa</th>
                  <th className="px-3 py-2">IP</th>
                  <th className="px-3 py-2">Dil</th>
                  <th className="px-3 py-2">Cihaz</th>
                  <th className="px-3 py-2">Tarayıcı</th>
                  <th className="px-3 py-2">Sistem</th>
                  <th className="px-3 py-2">Ekran</th>
                  <th className="px-3 py-2">Kaynak</th>
                </tr>
              </thead>

              <tbody>
                {events.map((event) => (
                  <tr key={event.id} className="bg-black/20">
                    <td className="rounded-l-2xl px-3 py-3 text-white/60">
                      {formatDate(event.created_at)}
                    </td>

                    <td className="px-3 py-3">
                      <span className="rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-xs font-bold text-sky-300">
                        {getEventTypeLabel(event.event_type)}
                      </span>
                    </td>

                    <td className="px-3 py-3 text-white/70">{event.path || "-"}</td>

                    <td className="px-3 py-3 text-white/70">
                      {event.ip_address || "-"}
                    </td>

                    <td className="px-3 py-3 text-white/70">
                      {(event.locale || "-").toUpperCase()}
                    </td>

                    <td className="px-3 py-3 text-white/70">
                      {getDeviceType(event.user_agent)}
                    </td>

                    <td className="px-3 py-3 text-white/70">
                      {getBrowser(event.user_agent)}
                    </td>

                    <td className="px-3 py-3 text-white/70">
                      {getOS(event.user_agent)}
                    </td>

                    <td className="px-3 py-3 text-white/70">
                      {event.screen_width && event.screen_height
                        ? `${event.screen_width}x${event.screen_height}`
                        : "-"}
                    </td>

                    <td className="rounded-r-2xl px-3 py-3 text-white/70">
                      {getReferrerLabel(event.referrer)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {events.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-black/20 p-5 text-white/45">
                Bu ziyaretçiye ait hareket kaydı yok.
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}

function MiniInfo({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <p className="mb-1 text-xs uppercase tracking-wide text-white/35">{label}</p>
      <p className="break-words text-white/85">{value}</p>
    </div>
  );
}