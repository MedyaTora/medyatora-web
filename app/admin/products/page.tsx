import Link from "next/link";
import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type SearchParams = Promise<{
  q?: string;
  product_type?: string;
  review_status?: string;
  public_page?: string;
}>;

type ProductRow = {
  id: number;
  panel_service_id: number | null;
  site_code: number | null;
  platform: string | null;
  category: string | null;
  original_name: string | null;
  clean_title: string | null;
  subtitle: string | null;
  guarantee_label: string | null;
  min: number | null;
  max: number | null;
  speed: string | null;
  level: string | null;
  description: string | null;
  tl_cost_price: number | null;
  tl_sale_price: number | null;
  usd_cost_price: number | null;
  usd_sale_price: number | null;
  rub_sale_price: number | null;
  is_active: boolean | null;
  product_type: string | null;
  public_visible: boolean | null;
  review_status: string | null;
  public_page: string | null;
  public_category: string | null;
  admin_note: string | null;
  manual_title: string | null;
  manual_description: string | null;
  manual_sale_price_tl: number | null;
  admin_locked: boolean | null;
  admin_updated_at: string | null;
  admin_decision_reason: string | null;
  source_type: string | null;
  is_manual: boolean | null;
  auto_reject_reason: string | null;
  last_panel_sync_at: string | null;
};

function createAdminSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase environment variables eksik.");
  }

  return createClient(supabaseUrl, serviceRoleKey);
}

function getText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getNullableText(formData: FormData, key: string) {
  const value = getText(formData, key);
  return value.length ? value : null;
}

function getNullableNumber(formData: FormData, key: string) {
  const value = getText(formData, key);
  if (!value) return null;

  const normalized = value.replace(",", ".");
  const num = Number(normalized);

  if (!Number.isFinite(num) || num < 0) return null;
  return num;
}

function formatMoney(value: number | null | undefined, suffix = "TL") {
  const num = Number(value || 0);
  if (!Number.isFinite(num) || num <= 0) return "-";

  return `${num.toLocaleString("tr-TR", {
    maximumFractionDigits: 2,
  })} ${suffix}`;
}

function getProductTypeLabel(value: string | null) {
  if (value === "single") return "Tekli Hizmet";
  if (value === "combo") return "Paket / Combo";
  if (value === "package") return "Hazır Paket";
  if (value === "hidden") return "Gizli";
  return value || "-";
}

function getReviewLabel(value: string | null) {
  if (value === "approved") return "Onaylı";
  if (value === "pending") return "Bekliyor";
  if (value === "rejected") return "Reddedildi";
  return value || "-";
}

function getVisiblePrice(product: ProductRow) {
  if (product.manual_sale_price_tl && product.manual_sale_price_tl > 0) {
    return product.manual_sale_price_tl;
  }

  return product.tl_sale_price || 0;
}

function badgeClass(type: string) {
  if (type === "single" || type === "approved" || type === "visible") {
    return "border-emerald-400/20 bg-emerald-400/10 text-emerald-300";
  }

  if (type === "combo" || type === "smmtora") {
    return "border-sky-400/20 bg-sky-400/10 text-sky-300";
  }

  if (type === "pending") {
    return "border-amber-400/20 bg-amber-400/10 text-amber-300";
  }

  if (type === "rejected" || type === "passive") {
    return "border-rose-400/20 bg-rose-400/10 text-rose-300";
  }

  return "border-zinc-400/20 bg-zinc-400/10 text-zinc-300";
}

async function updateProduct(formData: FormData) {
  "use server";

  const id = Number(getText(formData, "id"));

  if (!Number.isFinite(id) || id <= 0) {
    throw new Error("Geçersiz ürün ID.");
  }

  const productType = getText(formData, "product_type") || "hidden";
  const reviewStatus = getText(formData, "review_status") || "pending";
  const publicPage = getText(formData, "public_page") || "hidden";
  const publicVisible = formData.get("public_visible") === "on";
  const isActive = formData.get("is_active") === "on";

  const publicCategory = getNullableText(formData, "public_category");
  const manualTitle = getNullableText(formData, "manual_title");
  const manualDescription = getNullableText(formData, "manual_description");
  const manualSalePriceTl = getNullableNumber(formData, "manual_sale_price_tl");
  const adminDecisionReason = getNullableText(formData, "admin_decision_reason");

  const finalPublicVisible =
    publicPage === "hidden" || productType === "hidden" || reviewStatus !== "approved"
      ? false
      : publicVisible;

  const supabase = createAdminSupabaseClient();

  const { error } = await supabase
    .from("services")
    .update({
      product_type: productType,
      review_status: reviewStatus,
      public_page: publicPage,
      public_visible: finalPublicVisible,
      public_category: publicCategory,
      manual_title: manualTitle,
      manual_description: manualDescription,
      manual_sale_price_tl: manualSalePriceTl,
      is_active: isActive,
      admin_locked: true,
      admin_updated_at: new Date().toISOString(),
      admin_decision_reason: adminDecisionReason,
      admin_note: adminDecisionReason,
    })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/products");
  revalidatePath("/paketler");
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;

  const q = (params.q || "").trim();
  const productType = (params.product_type || "").trim();
  const reviewStatus = (params.review_status || "").trim();
  const publicPage = (params.public_page || "").trim();

  const supabase = createAdminSupabaseClient();

  let query = supabase
    .from("services")
    .select(
      `
        id,
        panel_service_id,
        site_code,
        platform,
        category,
        original_name,
        clean_title,
        subtitle,
        guarantee_label,
        min,
        max,
        speed,
        level,
        description,
        tl_cost_price,
        tl_sale_price,
        usd_cost_price,
        usd_sale_price,
        rub_sale_price,
        is_active,
        product_type,
        public_visible,
        review_status,
        public_page,
        public_category,
        admin_note,
        manual_title,
        manual_description,
        manual_sale_price_tl,
        admin_locked,
        admin_updated_at,
        admin_decision_reason,
        source_type,
        is_manual,
        auto_reject_reason,
        last_panel_sync_at
      `,
      { count: "exact" }
    )
    .order("admin_locked", { ascending: true })
    .order("panel_service_id", { ascending: true })
    .limit(100);

  if (productType) query = query.eq("product_type", productType);
  if (reviewStatus) query = query.eq("review_status", reviewStatus);
  if (publicPage) query = query.eq("public_page", publicPage);

  if (q) {
    const numericQ = Number(q);

    if (Number.isFinite(numericQ)) {
      query = query.or(
        `id.eq.${numericQ},panel_service_id.eq.${numericQ},site_code.eq.${numericQ},original_name.ilike.%${q}%,clean_title.ilike.%${q}%`
      );
    } else {
      query = query.or(`original_name.ilike.%${q}%,clean_title.ilike.%${q}%`);
    }
  }

  const { data, error, count } = await query;
  const products = (data || []) as ProductRow[];

  const { data: summaryRows } = await supabase
    .from("services")
    .select("product_type, public_page, review_status, public_visible");

  const summary = (summaryRows || []).reduce<Record<string, number>>((acc, item: any) => {
    const key = `${item.product_type || "unknown"} / ${item.public_page || "unknown"} / ${
      item.review_status || "unknown"
    } / ${item.public_visible ? "açık" : "kapalı"}`;

    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return (
    <main className="min-h-screen bg-[#080d16] px-4 py-6 text-white">
      <div className="mx-auto max-w-7xl space-y-5">
        <section className="rounded-[28px] border border-white/10 bg-[#121826] p-5 shadow-[0_10px_40px_rgba(0,0,0,0.25)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
                MedyaTora Admin
              </p>
              <h1 className="mt-2 text-2xl font-bold">Ürünler</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-white/60">
                Ürün kodu veya panel ID ile ürün bul, neden sitede görünmediğini gör,
                sonra ürünün public durumunu ve manuel bilgilerini düzenle.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href="/admin"
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/75 transition hover:bg-white/10"
              >
                Admin Ana Sayfa
              </Link>

              <Link
                href="/paketler"
                className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-400/15"
              >
                Paketler
              </Link>
            </div>
          </div>
        </section>

        <section className="grid gap-3 md:grid-cols-3">
          {Object.entries(summary).map(([key, total]) => (
            <div key={key} className="rounded-2xl border border-white/10 bg-[#121826] p-4">
              <p className="text-xs uppercase tracking-wide text-white/40">{key}</p>
              <p className="mt-2 text-2xl font-bold text-white">{total}</p>
            </div>
          ))}
        </section>
        
        <section className="rounded-[28px] border border-white/10 bg-[#121826] p-5">
  <div className="mb-4">
    <p className="text-xs font-semibold uppercase tracking-wide text-white/40">
      Hızlı Ürün Kontrolü
    </p>
    <p className="mt-1 text-sm text-white/60">
      Numara bilmeden kontrol bekleyen, siteye çıkmayan, combo/paket veya satışta olan ürünleri buradan hızlıca listeleyebilirsin.
    </p>
  </div>

  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
    <Link
      href="/admin/products?review_status=pending"
      className="rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-center text-sm font-bold text-amber-300 transition hover:bg-amber-400/15"
    >
      Kontrol Bekleyenler
    </Link>

    <Link
      href="/admin/products?public_page=hidden"
      className="rounded-2xl border border-zinc-400/20 bg-zinc-400/10 px-4 py-3 text-center text-sm font-bold text-zinc-300 transition hover:bg-zinc-400/15"
    >
      Siteye Çıkmayanlar
    </Link>

    <Link
      href="/admin/products?product_type=combo"
      className="rounded-2xl border border-sky-400/20 bg-sky-400/10 px-4 py-3 text-center text-sm font-bold text-sky-300 transition hover:bg-sky-400/15"
    >
      Combo / Paketler
    </Link>

    <Link
      href="/admin/products?product_type=hidden"
      className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-center text-sm font-bold text-rose-300 transition hover:bg-rose-400/15"
    >
      Gizli Ürünler
    </Link>

    <Link
      href="/admin/products?product_type=single&review_status=approved&public_page=paketler"
      className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-center text-sm font-bold text-emerald-300 transition hover:bg-emerald-400/15"
    >
      Satışta Olanlar
    </Link>
  </div>
</section>

        <section className="rounded-[28px] border border-white/10 bg-[#121826] p-5">
          <form className="grid gap-3 md:grid-cols-6">
            <input
              name="q"
              defaultValue={q}
              placeholder="Ürün kodu, panel ID veya isim ara... Örn: 9059"
              className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-emerald-400 md:col-span-2"
            />

            <select
              name="product_type"
              defaultValue={productType}
              className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
            >
              <option value="" className="bg-[#121826]">
                Ürün tipi
              </option>
              <option value="single" className="bg-[#121826]">
                Tekli
              </option>
              <option value="combo" className="bg-[#121826]">
                Combo
              </option>
              <option value="hidden" className="bg-[#121826]">
                Gizli
              </option>
            </select>

            <select
              name="review_status"
              defaultValue={reviewStatus}
              className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
            >
              <option value="" className="bg-[#121826]">
                Onay
              </option>
              <option value="approved" className="bg-[#121826]">
                Onaylı
              </option>
              <option value="pending" className="bg-[#121826]">
                Bekliyor
              </option>
              <option value="rejected" className="bg-[#121826]">
                Reddedildi
              </option>
            </select>

            <select
              name="public_page"
              defaultValue={publicPage}
              className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
            >
              <option value="" className="bg-[#121826]">
                Sayfa
              </option>
              <option value="paketler" className="bg-[#121826]">
                paketler
              </option>
              <option value="smmtora" className="bg-[#121826]">
                smmtora
              </option>
              <option value="hidden" className="bg-[#121826]">
                hidden
              </option>
            </select>

            <button
              type="submit"
              className="rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-bold text-black transition hover:bg-emerald-400"
            >
              Ara
            </button>

            <Link
              href="/admin/products"
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-semibold text-white/70 transition hover:bg-white/10"
            >
              Temizle
            </Link>
          </form>
        </section>

        <section className="rounded-[28px] border border-white/10 bg-[#121826] p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-white/40">
                Ürün Listesi
              </p>
              <p className="mt-1 text-sm text-white/60">
                Gösterilen: {products.length} / Eşleşen: {count ?? products.length}
              </p>
            </div>

            <p className="text-xs text-white/40">
              İlk sürümde maksimum 80 kayıt gösteriliyor.
            </p>
          </div>

          {error ? (
            <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4 text-sm text-rose-300">
              Ürünler alınamadı: {error.message}
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/50">
              Sonuç bulunamadı.
            </div>
          ) : (
            <div className="space-y-4">
              {products.map((product) => {
                const visiblePrice = getVisiblePrice(product);

                return (
                  <article
                    key={product.id}
                    className="rounded-3xl border border-white/10 bg-white/[0.035] p-4"
                  >
                    <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
                      <div>
                        <div className="mb-3 flex flex-wrap gap-2">
                          <span
                            className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${badgeClass(
                              product.product_type || "hidden"
                            )}`}
                          >
                            {getProductTypeLabel(product.product_type)}
                          </span>

                          <span
                            className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${badgeClass(
                              product.review_status || "pending"
                            )}`}
                          >
                            {getReviewLabel(product.review_status)}
                          </span>

                          <span
                            className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${badgeClass(
                              product.public_visible ? "visible" : "passive"
                            )}`}
                          >
                            {product.public_visible ? "Public Açık" : "Public Kapalı"}
                          </span>

                          <span
                            className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${badgeClass(
                              product.public_page || "hidden"
                            )}`}
                          >
                            {product.public_page || "-"}
                          </span>

                          {product.admin_locked && (
                            <span className="rounded-full border border-violet-400/20 bg-violet-400/10 px-2.5 py-1 text-xs font-semibold text-violet-300">
                              Admin Kilitli
                            </span>
                          )}
                        </div>

                        <h2 className="text-base font-bold text-white">
                          {product.manual_title ||
                            product.clean_title ||
                            "Başlıksız ürün"}
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-white/55">
                          {product.original_name || "-"}
                        </p>

                        <div className="mt-4 grid gap-2 text-sm text-white/65 sm:grid-cols-2">
                          <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                            <p className="text-xs text-white/35">Panel ID</p>
                            <p className="mt-1 font-semibold text-white">
                              {product.panel_service_id}
                            </p>
                          </div>

                          <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                            <p className="text-xs text-white/35">Ürün Kodu</p>
                            <p className="mt-1 font-semibold text-white">
                              {product.site_code}
                            </p>
                          </div>

                          <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                            <p className="text-xs text-white/35">Platform / Kategori</p>
                            <p className="mt-1 font-semibold text-white">
                              {product.platform} / {product.category}
                            </p>
                          </div>

                          <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                            <p className="text-xs text-white/35">Public Kategori</p>
                            <p className="mt-1 font-semibold text-white">
                              {product.public_category || "-"}
                            </p>
                          </div>

                          <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                            <p className="text-xs text-white/35">Alış</p>
                            <p className="mt-1 font-semibold text-white">
                              {formatMoney(product.tl_cost_price)}
                            </p>
                          </div>

                          <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                            <p className="text-xs text-white/35">Sitede Görünen Satış</p>
                            <p className="mt-1 font-semibold text-emerald-300">
                              {formatMoney(visiblePrice)}
                            </p>
                          </div>

                          <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                            <p className="text-xs text-white/35">Otomatik Satış</p>
                            <p className="mt-1 font-semibold text-white">
                              {formatMoney(product.tl_sale_price)}
                            </p>
                          </div>

                          <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                            <p className="text-xs text-white/35">Manuel Satış</p>
                            <p className="mt-1 font-semibold text-white">
                              {formatMoney(product.manual_sale_price_tl)}
                            </p>
                          </div>

                          <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                            <p className="text-xs text-white/35">Min / Max</p>
                            <p className="mt-1 font-semibold text-white">
                              {product.min} / {product.max}
                            </p>
                          </div>

                          <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                            <p className="text-xs text-white/35">Garanti</p>
                            <p className="mt-1 font-semibold text-white">
                              {product.guarantee_label || "-"}
                            </p>
                          </div>
                        </div>

                        {product.auto_reject_reason && (
                          <div className="mt-4 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm leading-6 text-amber-100">
                            <p className="font-semibold text-white">
                              Siteye otomatik eklenmeme sebebi
                            </p>
                            <p className="mt-1">{product.auto_reject_reason}</p>
                          </div>
                        )}

                        {product.admin_decision_reason && (
                          <div className="mt-4 rounded-2xl border border-sky-400/20 bg-sky-400/10 p-4 text-sm leading-6 text-sky-100">
                            <p className="font-semibold text-white">Admin Notu</p>
                            <p className="mt-1">{product.admin_decision_reason}</p>
                          </div>
                        )}
                      </div>
                      
                      <Link
  href={`/admin/products/${product.id}`}
  className="mb-3 block rounded-2xl border border-sky-400/20 bg-sky-400/10 px-4 py-3 text-center text-sm font-bold text-sky-300 transition hover:bg-sky-400/15"
>
  Detay / API Bilgilerini Gör
</Link>

                      <form action={updateProduct} className="rounded-3xl border border-white/10 bg-black/20 p-4">
                        <input type="hidden" name="id" value={product.id} />

                        <p className="mb-4 text-sm font-bold text-white">
                          Ürünü Düzenle
                        </p>

                        <div className="grid gap-3">
                          <label className="text-xs font-semibold uppercase tracking-wide text-white/40">
                            Ürün Tipi
                          </label>
                          <select
                            name="product_type"
                            defaultValue={product.product_type || "hidden"}
                            className="rounded-2xl border border-white/10 bg-[#111827] px-4 py-3 text-sm text-white outline-none"
                          >
                            <option value="single">Tekli Hizmet</option>
                            <option value="combo">Paket / Combo</option>
                            <option value="hidden">Gizli</option>
                          </select>

                          <label className="text-xs font-semibold uppercase tracking-wide text-white/40">
                            Onay Durumu
                          </label>
                          <select
                            name="review_status"
                            defaultValue={product.review_status || "pending"}
                            className="rounded-2xl border border-white/10 bg-[#111827] px-4 py-3 text-sm text-white outline-none"
                          >
                            <option value="approved">Onaylı</option>
                            <option value="pending">Bekliyor</option>
                            <option value="rejected">Reddedildi</option>
                          </select>

                          <label className="text-xs font-semibold uppercase tracking-wide text-white/40">
                            Görüneceği Sayfa
                          </label>
                          <select
                            name="public_page"
                            defaultValue={product.public_page || "hidden"}
                            className="rounded-2xl border border-white/10 bg-[#111827] px-4 py-3 text-sm text-white outline-none"
                          >
                            <option value="paketler">paketler</option>
                            <option value="smmtora">smmtora</option>
                            <option value="hidden">hidden</option>
                          </select>

                          <label className="text-xs font-semibold uppercase tracking-wide text-white/40">
                            Public Kategori
                          </label>
                          <input
                            name="public_category"
                            defaultValue={product.public_category || product.category || ""}
                            placeholder="takipci, begeni, buyume_paketi..."
                            className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-white/30"
                          />

                          <label className="text-xs font-semibold uppercase tracking-wide text-white/40">
                            Manuel Başlık
                          </label>
                          <input
                            name="manual_title"
                            defaultValue={product.manual_title || ""}
                            placeholder="Boşsa otomatik başlık kullanılır"
                            className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-white/30"
                          />

                          <label className="text-xs font-semibold uppercase tracking-wide text-white/40">
                            Manuel Açıklama
                          </label>
                          <textarea
                            name="manual_description"
                            defaultValue={product.manual_description || ""}
                            placeholder="Boşsa otomatik açıklama kullanılır"
                            rows={3}
                            className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-white/30"
                          />

                          <label className="text-xs font-semibold uppercase tracking-wide text-white/40">
                            Manuel Satış Fiyatı TL
                          </label>
                          <input
                            name="manual_sale_price_tl"
                            defaultValue={product.manual_sale_price_tl || ""}
                            placeholder="Boşsa otomatik satış fiyatı kullanılır"
                            className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-white/30"
                          />

                          <label className="text-xs font-semibold uppercase tracking-wide text-white/40">
                            Admin Karar Notu
                          </label>
                          <textarea
                            name="admin_decision_reason"
                            defaultValue={product.admin_decision_reason || ""}
                            placeholder="Örn: Manuel onaylandı, paket olarak smmtora’ya taşındı..."
                            rows={2}
                            className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-white/30"
                          />

                          <div className="grid gap-3 sm:grid-cols-2">
                            <label className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/80">
                              <input
                                type="checkbox"
                                name="public_visible"
                                defaultChecked={product.public_visible === true}
                              />
                              Public Açık
                            </label>

                            <label className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/80">
                              <input
                                type="checkbox"
                                name="is_active"
                                defaultChecked={product.is_active !== false}
                              />
                              Aktif
                            </label>
                          </div>

                          <button
                            type="submit"
                            className="rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-bold text-black transition hover:bg-emerald-400"
                          >
                            Kaydet
                          </button>

                          <p className="text-xs leading-5 text-white/40">
                            Kaydedince admin_locked true olur. Günlük sync fiyatları
                            güncelleyebilir ama bu admin kararını ezmemelidir.
                          </p>
                        </div>
                      </form>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}