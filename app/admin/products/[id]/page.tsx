import Link from "next/link";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getMysqlPool } from "@/lib/mysql";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

type ProductRow = {
  id: number;
  panel_service_id: number | null;
  site_code: number | null;
  platform: string | null;
  category: string | null;
  original_name: string | null;
  clean_title: string | null;
  subtitle: string | null;
  guarantee: boolean | null;
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

function getPool() {
  return getMysqlPool();
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
    maximumFractionDigits: 4,
  })} ${suffix}`;
}

function formatDate(value: string | null | undefined) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleString("tr-TR");
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

function ProductInfoBox({
  label,
  value,
  highlight,
}: {
  label: string;
  value: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
      <p className="text-xs text-white/35">{label}</p>
      <div
        className={`mt-1 text-sm font-semibold ${
          highlight ? "text-emerald-300" : "text-white"
        }`}
      >
        {value || "-"}
      </div>
    </div>
  );
}

async function updateProductDetail(formData: FormData) {
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

  const pool = getPool();

  await pool.execute(
    `
    UPDATE services
    SET
      product_type = ?,
      review_status = ?,
      public_page = ?,
      public_visible = ?,
      public_category = ?,
      manual_title = ?,
      manual_description = ?,
      manual_sale_price_tl = ?,
      is_active = ?,
      admin_locked = 1,
      admin_updated_at = NOW(),
      admin_decision_reason = ?,
      admin_note = ?
    WHERE id = ?
    `,
    [
      productType,
      reviewStatus,
      publicPage,
      finalPublicVisible ? 1 : 0,
      publicCategory,
      manualTitle,
      manualDescription,
      manualSalePriceTl,
      isActive ? 1 : 0,
      adminDecisionReason,
      adminDecisionReason,
      id,
    ]
  );

  revalidatePath(`/admin/products/${id}`);
  revalidatePath("/admin/products");
  revalidatePath("/paketler");
}

export default async function AdminProductDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const id = Number(resolvedParams.id);

  if (!Number.isFinite(id) || id <= 0) {
    notFound();
  }

  const pool = getPool();

  const [rows] = await pool.query(
    `
    SELECT
      id,
      panel_service_id,
      site_code,
      platform,
      category,
      original_name,
      clean_title,
      subtitle,
      guarantee,
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
    FROM services
    WHERE id = ?
    LIMIT 1
    `,
    [id]
  );

  const dbProduct = (rows as any[])[0];

  if (!dbProduct) {
    notFound();
  }

  const product = {
    id: Number(dbProduct.id),
    panel_service_id:
      dbProduct.panel_service_id === null ? null : Number(dbProduct.panel_service_id),
    site_code: dbProduct.site_code === null ? null : Number(dbProduct.site_code),
    platform: dbProduct.platform,
    category: dbProduct.category,
    original_name: dbProduct.original_name,
    clean_title: dbProduct.clean_title,
    subtitle: dbProduct.subtitle,
    guarantee: dbProduct.guarantee === 1,
    guarantee_label: dbProduct.guarantee_label,
    min: dbProduct.min === null ? null : Number(dbProduct.min),
    max: dbProduct.max === null ? null : Number(dbProduct.max),
    speed: dbProduct.speed,
    level: dbProduct.level,
    description: dbProduct.description,
    tl_cost_price:
      dbProduct.tl_cost_price === null ? null : Number(dbProduct.tl_cost_price),
    tl_sale_price:
      dbProduct.tl_sale_price === null ? null : Number(dbProduct.tl_sale_price),
    usd_cost_price:
      dbProduct.usd_cost_price === null ? null : Number(dbProduct.usd_cost_price),
    usd_sale_price:
      dbProduct.usd_sale_price === null ? null : Number(dbProduct.usd_sale_price),
    rub_sale_price:
      dbProduct.rub_sale_price === null ? null : Number(dbProduct.rub_sale_price),
    is_active: dbProduct.is_active === 1,
    product_type: dbProduct.product_type,
    public_visible: dbProduct.public_visible === 1,
    review_status: dbProduct.review_status,
    public_page: dbProduct.public_page,
    public_category: dbProduct.public_category,
    admin_note: dbProduct.admin_note,
    manual_title: dbProduct.manual_title,
    manual_description: dbProduct.manual_description,
    manual_sale_price_tl:
      dbProduct.manual_sale_price_tl === null
        ? null
        : Number(dbProduct.manual_sale_price_tl),
    admin_locked: dbProduct.admin_locked === 1,
    admin_updated_at: dbProduct.admin_updated_at
      ? String(dbProduct.admin_updated_at)
      : null,
    admin_decision_reason: dbProduct.admin_decision_reason,
    source_type: dbProduct.source_type,
    is_manual: dbProduct.is_manual === 1,
    auto_reject_reason: dbProduct.auto_reject_reason,
    last_panel_sync_at: dbProduct.last_panel_sync_at
      ? String(dbProduct.last_panel_sync_at)
      : null,
  } as ProductRow;
  const visiblePrice = getVisiblePrice(product);

  return (
    <main className="min-h-screen bg-[#080d16] px-4 py-6 text-white">
      <div className="mx-auto max-w-7xl space-y-5">
        <section className="rounded-[28px] border border-white/10 bg-[#121826] p-5 shadow-[0_10px_40px_rgba(0,0,0,0.25)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
                MedyaTora Admin
              </p>
              <h1 className="mt-2 text-2xl font-bold">Ürün Detayı</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-white/60">
                Bu ekranda panelden gelen ham API bilgileri ile MedyaTora’da
                müşteriye gösterilecek satış bilgilerini ayrı ayrı yönetirsin.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href="/admin/products"
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/75 transition hover:bg-white/10"
              >
                Ürünlere Dön
              </Link>

              <Link
                href="/paketler"
                className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-400/15"
              >
                Paketler Sayfası
              </Link>
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-white/10 bg-[#121826] p-5">
          <div className="mb-4 flex flex-wrap gap-2">
            <span
              className={`rounded-full border px-3 py-1 text-xs font-semibold ${badgeClass(
                product.product_type || "hidden"
              )}`}
            >
              {product.product_type || "hidden"}
            </span>

            <span
              className={`rounded-full border px-3 py-1 text-xs font-semibold ${badgeClass(
                product.review_status || "pending"
              )}`}
            >
              {product.review_status || "pending"}
            </span>

            <span
              className={`rounded-full border px-3 py-1 text-xs font-semibold ${badgeClass(
                product.public_visible ? "visible" : "passive"
              )}`}
            >
              {product.public_visible ? "Public Açık" : "Public Kapalı"}
            </span>

            <span
              className={`rounded-full border px-3 py-1 text-xs font-semibold ${badgeClass(
                product.public_page || "hidden"
              )}`}
            >
              {product.public_page || "hidden"}
            </span>

            {product.admin_locked && (
              <span className="rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1 text-xs font-semibold text-violet-300">
                Admin Kilitli
              </span>
            )}
          </div>

          <h2 className="text-xl font-bold text-white">
            {product.manual_title || product.clean_title || "Başlıksız ürün"}
          </h2>

          <p className="mt-2 text-sm leading-6 text-white/55">
            {product.original_name || "-"}
          </p>
        </section>

        <section className="grid gap-5 xl:grid-cols-2">
          <div className="rounded-[28px] border border-white/10 bg-[#121826] p-5">
            <div className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-sky-300">
                API / Panel Bilgileri
              </p>
              <h2 className="mt-2 text-xl font-bold text-white">
                Panelden Gelen Ham Veriler
              </h2>
              <p className="mt-2 text-sm leading-6 text-white/60">
                Bu alanlar panel sync ile güncellenebilir. Buradaki bilgiler
                ürünün teknik/panel tarafını gösterir.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <ProductInfoBox label="Panel Servis ID" value={product.panel_service_id} />
              <ProductInfoBox label="Site Ürün Kodu" value={product.site_code} />
              <ProductInfoBox label="Kaynak" value={product.source_type || "panel"} />
              <ProductInfoBox
                label="Panel Sync Tarihi"
                value={formatDate(product.last_panel_sync_at)}
              />

              <ProductInfoBox label="Platform" value={product.platform} />
              <ProductInfoBox label="Kategori" value={product.category} />
              <ProductInfoBox label="Temiz Başlık" value={product.clean_title} />
              <ProductInfoBox label="Alt Başlık" value={product.subtitle} />

              <ProductInfoBox label="Garanti" value={product.guarantee_label} />
              <ProductInfoBox label="Hız" value={product.speed} />
              <ProductInfoBox label="Level" value={product.level} />
              <ProductInfoBox label="Min / Max" value={`${product.min} / ${product.max}`} />

              <ProductInfoBox label="Alış TL" value={formatMoney(product.tl_cost_price)} />
              <ProductInfoBox
                label="Otomatik Satış TL"
                value={formatMoney(product.tl_sale_price)}
              />
              <ProductInfoBox
                label="Alış USD"
                value={formatMoney(product.usd_cost_price, "USD")}
              />
              <ProductInfoBox
                label="Satış USD"
                value={formatMoney(product.usd_sale_price, "USD")}
              />
              <ProductInfoBox
                label="Satış RUB"
                value={formatMoney(product.rub_sale_price, "RUB")}
              />
              <ProductInfoBox
                label="Aktif mi?"
                value={product.is_active === false ? "Pasif" : "Aktif"}
              />
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs text-white/35">Orijinal Panel Adı</p>
              <p className="mt-2 text-sm leading-6 text-white/70">
                {product.original_name || "-"}
              </p>
            </div>

            {product.auto_reject_reason && (
              <div className="mt-4 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm leading-6 text-amber-100">
                <p className="font-semibold text-white">
                  Siteye Otomatik Eklenmeme Sebebi
                </p>
                <p className="mt-1">{product.auto_reject_reason}</p>
              </div>
            )}
          </div>

          <div className="rounded-[28px] border border-white/10 bg-[#121826] p-5">
            <div className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
                MedyaTora Satış Bilgileri
              </p>
              <h2 className="mt-2 text-xl font-bold text-white">
                Sitede Gözükecek Ürün
              </h2>
              <p className="mt-2 text-sm leading-6 text-white/60">
              Başlık, açıklama ve kategori otomatik doldurulur. Hata görürsen elle
              düzeltebilirsin. Manuel satış fiyatını boş bırakırsan sistem panel maliyetine
              göre otomatik satış fiyatını kullanır ve fiyat güncellemeleri devam eder.
              Kaydedince ürün admin kilitli olur; sync bu vitrin kararını bozmaz.
              </p>
            </div>

            <div className="mb-4 grid gap-3 sm:grid-cols-3">
              <ProductInfoBox
                label="Sitede Görünen Fiyat"
                value={formatMoney(visiblePrice)}
                highlight
              />
              <ProductInfoBox
                label="Manuel Satış Fiyatı"
                value={formatMoney(product.manual_sale_price_tl)}
              />
              <ProductInfoBox
                label="Admin Güncelleme"
                value={formatDate(product.admin_updated_at)}
              />
            </div>

            <form action={updateProductDetail} className="space-y-3">
              <input type="hidden" name="id" value={product.id} />

              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-white/40">
                    Ürün Tipi
                  </label>
                  <select
                    name="product_type"
                    defaultValue={product.product_type || "hidden"}
                    className="w-full rounded-2xl border border-white/10 bg-[#111827] px-4 py-3 text-sm text-white outline-none"
                  >
                    <option value="single">Tekli Hizmet</option>
                    <option value="combo">Paket / Combo</option>
                    <option value="hidden">Gizli</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-white/40">
                    Onay Durumu
                  </label>
                  <select
                    name="review_status"
                    defaultValue={product.review_status || "pending"}
                    className="w-full rounded-2xl border border-white/10 bg-[#111827] px-4 py-3 text-sm text-white outline-none"
                  >
                    <option value="approved">Onaylı</option>
                    <option value="pending">Bekliyor</option>
                    <option value="rejected">Reddedildi</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-white/40">
                    Görüneceği Sayfa
                  </label>
                  <select
                    name="public_page"
                    defaultValue={product.public_page || "hidden"}
                    className="w-full rounded-2xl border border-white/10 bg-[#111827] px-4 py-3 text-sm text-white outline-none"
                  >
                    <option value="paketler">paketler</option>
                    <option value="smmtora">smmtora</option>
                    <option value="hidden">hidden</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-white/40">
                    Public Kategori
                  </label>
                  <input
                    name="public_category"
                    defaultValue={product.public_category || product.category || ""}
                    placeholder="takipci, begeni, buyume_paketi..."
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-white/30"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-white/40">
                    Manuel Satış Fiyatı TL
                  </label>
                  <input
                    name="manual_sale_price_tl"
                    defaultValue={product.manual_sale_price_tl || ""}
                    placeholder="Boşsa otomatik satış fiyatı kullanılır"
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-white/30"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-white/40">
                  Manuel Başlık
                </label>
                <input
  name="manual_title"
  defaultValue={product.manual_title || product.clean_title || ""}
  placeholder="Başlık otomatik doldurulur, istersen değiştirebilirsin"
  className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-white/30"
/>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-white/40">
                  Manuel Açıklama
                </label>
                <textarea
  name="manual_description"
  defaultValue={product.manual_description || product.description || ""}
  placeholder="Açıklama otomatik doldurulur, istersen değiştirebilirsin"
  rows={6}
  className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-white/30"
/>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-white/40">
                  Admin Karar Notu
                </label>
                <textarea
                  name="admin_decision_reason"
                  defaultValue={product.admin_decision_reason || ""}
                  placeholder="Örn: Manuel onaylandı, paket olarak smmtora’ya taşındı..."
                  rows={3}
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-white/30"
                />
              </div>

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
                className="w-full rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-bold text-black transition hover:bg-emerald-400"
              >
                Ürünü Kaydet ve Admin Kilidi Koy
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}