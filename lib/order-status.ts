export function getOrderStatusLabel(status: string | null | undefined) {
    switch (status) {
      case "pending_payment":
        return "Ödeme Onaylanıyor";
      case "pending":
        return "Sipariş Alındı";
      case "processing":
        return "İşleme Alındı";
      case "in_progress":
        return "Devam Ediyor";
      case "completed":
        return "Tamamlandı";
      case "failed":
        return "Başarısız";
      case "cancelled":
        return "İptal Edildi";
      case "refunded":
        return "İade Edildi";
      case "partial_refunded":
        return "Kısmi İade Edildi";
      default:
        return "Sipariş Alındı";
    }
  }
  
  export function getOrderStatusDescription(status: string | null | undefined) {
    switch (status) {
      case "pending_payment":
        return "Ödemen kontrol ediliyor. Onaylandıktan sonra sipariş işleme alınacaktır.";
      case "pending":
        return "Siparişin alındı. Ekibimiz tarafından sıraya alınacak.";
      case "processing":
        return "Siparişin ekibimiz tarafından hazırlanıyor.";
      case "in_progress":
        return "Siparişin aktif olarak devam ediyor.";
      case "completed":
        return "Siparişin tamamlandı.";
      case "failed":
        return "Sipariş sırasında bir sorun oluştu. Destek ekibimizle iletişime geçebilirsin.";
      case "cancelled":
        return "Sipariş iptal edildi.";
      case "refunded":
        return "Sipariş tutarı bakiyene iade edildi.";
      case "partial_refunded":
        return "Siparişin bir kısmı tamamlandı, kalan tutar bakiyene iade edildi.";
      default:
        return "Siparişin alındı.";
    }
  }
  
  export function getOrderStatusClass(status: string | null | undefined) {
    switch (status) {
      case "completed":
        return "border-emerald-400/25 bg-emerald-400/10 text-emerald-200";
      case "processing":
      case "in_progress":
        return "border-sky-400/25 bg-sky-400/10 text-sky-200";
      case "pending":
      case "pending_payment":
        return "border-amber-400/25 bg-amber-400/10 text-amber-200";
      case "refunded":
      case "partial_refunded":
        return "border-violet-400/25 bg-violet-400/10 text-violet-200";
      case "failed":
      case "cancelled":
        return "border-rose-400/25 bg-rose-400/10 text-rose-200";
      default:
        return "border-white/10 bg-white/[0.06] text-white/70";
    }
  }
  
  export function getPaymentMethodLabel(method: string | null | undefined) {
    switch (method) {
      case "turkey_bank":
        return "Türkiye Banka Havalesi / EFT";
      case "balance":
        return "MedyaTora Bakiyesi";
      case "support":
        return "Destek ile İletişime Geçilecek";
      default:
        return "Belirtilmedi";
    }
  }
  
  export function formatOrderMoney(value: string | number | null | undefined, currency: string) {
    const amount = Number(value || 0);
  
    if (!Number.isFinite(amount)) {
      return `0.00 ${currency}`;
    }
  
    return `${amount.toFixed(2)} ${currency}`;
  }
  
  export function formatOrderDate(value: string | Date | null | undefined) {
    if (!value) return "-";
  
    const date = new Date(value);
  
    if (Number.isNaN(date.getTime())) {
      return "-";
    }
  
    return new Intl.DateTimeFormat("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }