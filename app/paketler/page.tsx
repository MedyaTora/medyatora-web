"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import UserMenu from "@/app/components/auth/UserMenu";
import { CONTACT, getWhatsappLink } from "@/lib/contact";
import type { IconType } from "react-icons";
import {
  FaArrowRight,
  FaBoxesStacked,
  FaChartLine,
  FaInstagram,
  FaShieldHalved,
  FaTelegram,
  FaUserCheck,
  FaWhatsapp,
  FaYoutube,
  FaTiktok,
  FaXTwitter,
} from "react-icons/fa6";

type LocaleCode = "tr" | "en" | "ru";
type PlatformSlug = "instagram" | "tiktok" | "youtube" | "x" | "telegram";
type ContactType = "Telegram" | "WhatsApp" | "Instagram" | "E-posta" | "";
type PaymentMethod = "turkey_bank" | "support" | "balance" | "";

type CategoryConfig = {
  slug: string;
  title: string;
  description: string;
};

type PackageTypeSlug = "ekonomik" | "global" | "turk" | "garantili" | "hizli";

type PackageTypeConfig = {
  slug: PackageTypeSlug;
  title: string;
  description: string;
  badge: string;
  colorClass: string;
};

type PlatformConfig = {
  slug: PlatformSlug;
  title: string;
  description: string;
  icon: IconType;
  gradient: string;
  glow: string;
  categories: CategoryConfig[];
};

type AuthUser = {
  id: number;
  email: string;
  full_name: string | null;
  balance_tl: number;
  balance_usd: number;
  balance_rub: number;
};

type CreatedPaymentInfo = {
  orderNumbers: string[];
  fullName: string;
  totalAmount: number;
  paymentMethod: PaymentMethod;
};

type PackagePageText = {
  home: string;
  analysis: string;
  whatsappSupport: string;
  heroBadge: string;
  heroTitle: string;
  heroDesc: string;
  createPackage: string;
  goSingleServices: string;
  selectedPackageSummary: string;
  selected: string;
  select: string;
  package: string;
  packageType: string;
  minimum: string;
  dailyMaximum: string;
  unit: string;
  estimatedTotal: string;
  taxIncludedNote: string;
  packageBuilder: string;
  choosePlatform: string;
  builderDesc: string;
  categorySelection: string;
  whatDoYouWant: string;
  quantitySelection: string;
  selectQuantity: string;
  minDailyMax: string;
  packageTypeSelection: string;
  whatPackage: string;
  per1000: string;
  targetInfo: string;
  targetTitle: string;
  targetUsernamePlaceholder: string;
  targetLinkPlaceholder: string;
  orderNotePlaceholder: string;
  orderSummary: string;
  quantity: string;
  buyPackage: string;
  getSupport: string;
  usernameRequired: string;
  wideServiceList: string;
  wideServiceTitle: string;
  wideServiceDesc: string;
  goSmmtora: string;
  telegramSupport: string;
  footerTitle: string;
  footerDesc: string;
  checkoutTitle: string;
  close: string;
  payerFullNamePlaceholder: string;
  receiptNameWarning: string;
  phonePlaceholder: string;
  contactTypeSelect: string;
  contactValuePlaceholder: string;
  paymentMethod: string;
  paymentDesc: string;
  bankTransfer: string;
  bankTransferDesc: string;
  tlBalance: string;
  balanceLoginRequired: string;
  supportPayment: string;
  supportPaymentDesc: string;
  bankInfo: string;
  receiver: string;
  iban: string;
  description: string;
  yourOrderNumber: string;
  paymentSecurity: string;
  paymentSecurityText: string;
  refundContractApproval: string;
  refundContractText: string;
  terms: string;
  privacy: string;
  refundPolicy: string;
  distanceSales: string;
  acceptPrefix: string;
  acceptSuffix: string;
  and: string;
  acceptanceRequired: string;
  total: string;
  creatingOrder: string;
  createOrder: string;
  packageOrder: string;
  orderReceived: string;
  orderReceivedFallback: string;
  orderNumber: string;
  balancePaymentCompleted: string;
  balancePaymentCompletedText: string;
  goAccount: string;
  viewOrders: string;
  sendPaymentNotice: string;
  sendPaymentNoticeDesc: string;
  goTelegram: string;
  sendWhatsapp: string;
  ok: string;
  paymentLabels: Record<Exclude<PaymentMethod, "">, string>;
  supportMessage: (
    info: CreatedPaymentInfo,
    totalText: string,
    paymentLabel: string
  ) => string;
  packageInfoWhatsapp: (
    platform: string,
    category: string,
    packageType: string,
    quantity: string
  ) => string;
  platformSubtitle: string;
  highlights: {
    title: string;
    description: string;
    icon: IconType;
  }[];
  platforms: PlatformConfig[];
  packageTypes: PackageTypeConfig[];
};

const MIN_QUANTITY = 100;
const MAX_QUANTITY = 5_000_000;

const TELEGRAM_USERNAME = "medyatora";
const WHATSAPP_NUMBER = "905530739292";

const TURKEY_BANK_ACCOUNT_NAME =
  "BİLÇAĞ İLETİŞİM TELEKOMİNASYON BİLGİSAYAR DAY. TÜK. MAİL. GIDA SAN. VE TİC.LTD.ŞTİ";

const TURKEY_BANK_IBAN = "TR48 0001 0001 3349 7700 5150 01";

const localeOptions: LocaleCode[] = ["tr", "en", "ru"];

const contactTypes: ContactType[] = [
  "Telegram",
  "WhatsApp",
  "Instagram",
  "E-posta",
];

const quickQuantities = [
  100,
  500,
  1000,
  2500,
  5000,
  10000,
  25000,
  50000,
  100000,
  250000,
  500000,
  1000000,
  5000000,
];

const packageCardClass =
  "border-white/24 bg-white/[0.095] text-white shadow-[0_18px_60px_rgba(0,0,0,0.22)]";

const pageText: Record<LocaleCode, PackagePageText> = {
  tr: {
    home: "MedyaTora Ana Sayfa",
    analysis: "Analiz",
    whatsappSupport: "WhatsApp Destek",
    heroBadge: "Hızlı sosyal medya paketleri",
    heroTitle: "Platformunu seç, paketini oluştur, hızlıca satın al.",
    heroDesc:
      "Instagram, TikTok, YouTube, X ve Telegram için takipçi, beğeni, izlenme ve etkileşim paketlerini hızlıca seç. Minimum 100, günlük maksimum 5.000.000 adede kadar işlem alınabilir.",
    createPackage: "Paket Oluştur",
    goSingleServices: "Tekli Servislere Git",
    selectedPackageSummary: "Seçili paket özeti",
    selected: "Seçili",
    select: "Seç",
    package: "paketi",
    packageType: "Paket türü",
    minimum: "Minimum",
    dailyMaximum: "Günlük Maksimum",
    unit: "Birim",
    estimatedTotal: "Tahmini Tutar",
    taxIncludedNote:
      "KDV + vergiler dahildir. Paketler, hızlı sipariş vermek isteyen kullanıcılar için hazırlanmıştır.",
    packageBuilder: "Paket oluştur",
    choosePlatform: "Önce platformunu seç",
    builderDesc:
      "Paket yapısı sade tutuldu. Platformu, kategoriyi ve paket türünü seç; hedef kullanıcı adını yaz ve ödeme ekranına geç.",
    categorySelection: "Kategori seçimi",
    whatDoYouWant: "için ne almak istiyorsun?",
    quantitySelection: "Miktar seçimi",
    selectQuantity: "Almak istediğin miktarı seç",
    minDailyMax: "Minimum {min} · Günlük maksimum {max}",
    packageTypeSelection: "Paket türü",
    whatPackage: "Nasıl bir paket istiyorsun?",
    per1000: "/ 1000",
    targetInfo: "Hedef bilgileri",
    targetTitle: "Siparişin uygulanacağı hesabı yaz",
    targetUsernamePlaceholder: "Hedef kullanıcı adı / kanal adı",
    targetLinkPlaceholder: "Hedef link",
    orderNotePlaceholder: "Sipariş notu",
    orderSummary: "Sipariş özeti",
    quantity: "Miktar",
    buyPackage: "Paketi Satın Al",
    getSupport: "Destek Al",
    usernameRequired: "Devam etmek için hedef kullanıcı adını yazmalısın.",
    wideServiceList: "Geniş servis listesi",
    wideServiceTitle: "Daha fazla medya ve servis için SMMTora’ya geç",
    wideServiceDesc:
      "Burada hızlı paket akışı yer alır. Tüm servisleri, detaylı filtreleri ve geniş platform listesini görmek için SMMTora alanını kullanabilirsin.",
    goSmmtora: "SMMTora’ya Git",
    telegramSupport: "Telegram Destek",
    footerTitle: "© MedyaTora Paketler",
    footerDesc: "Platforma göre hızlı sosyal medya paketleri",
    checkoutTitle: "Paket Ödeme",
    close: "Kapat",
    payerFullNamePlaceholder: "Ödeme yapacak kişinin adı soyadı",
    receiptNameWarning: "Dekonttaki gönderen adı soyadı ile aynı olmalıdır.",
    phonePlaceholder: "Telefon numarası",
    contactTypeSelect: "İletişim türü seç",
    contactValuePlaceholder: "İletişim bilgisi",
    paymentMethod: "Ödeme yöntemi",
    paymentDesc:
      "Paketler şu an TL üzerinden satılır. Bakiye ödemesi yalnızca TL bakiyeden düşer.",
    bankTransfer: "Havale / EFT",
    bankTransferDesc: "Dekont sonrası ödeme kontrol edilir.",
    tlBalance: "TL Bakiyesi",
    balanceLoginRequired: "Bakiye ile ödeme için giriş yapmalısın.",
    supportPayment: "Destek ile ödeme",
    supportPaymentDesc: "Alternatif ödeme için destek ekibiyle ilerle.",
    bankInfo: "Banka bilgileri",
    receiver: "Alıcı",
    iban: "IBAN",
    description: "Açıklama",
    yourOrderNumber: "Sipariş numaranız",
    paymentSecurity: "Ödeme Güvenliği",
    paymentSecurityText:
      "Ödeme yapacak kişinin adı soyadı, dekonttaki gönderen adı soyadı ile aynı olmalıdır. Eşleşmeyen ödemeler onaylanmaz.",
    refundContractApproval: "İade ve Sözleşme Onayı",
    refundContractText:
      "İşlem başlamadan önce iade talep edebilirsiniz. İşlem başladıktan sonra iptal/iade yapılamaz. Bizden kaynaklı eksik işlem olursa eksik kalan kısım için iade yapılabilir.",
    terms: "Kullanım şartlarını",
    privacy: "gizlilik politikasını",
    refundPolicy: "iade koşullarını",
    distanceSales: "mesafeli satış sözleşmesini",
    acceptPrefix: "",
    acceptSuffix: "okudum, kabul ediyorum.",
    and: "ve",
    acceptanceRequired:
      "Siparişi oluşturmak için sözleşme ve politika onayını işaretlemelisin.",
    total: "Toplam",
    creatingOrder: "Sipariş oluşturuluyor...",
    createOrder: "Siparişi Oluştur",
    packageOrder: "Paket Siparişi",
    orderReceived: "Siparişiniz alındı",
    orderReceivedFallback:
      "Paket siparişiniz oluşturuldu. Ödeme durumuna göre işleme alınacaktır.",
    orderNumber: "Sipariş numarası",
    balancePaymentCompleted: "Bakiye ile ödeme tamamlandı",
    balancePaymentCompletedText: "Paket tutarı olan {amount} bakiyenden düşüldü.",
    goAccount: "Hesabıma Git",
    viewOrders: "Siparişlerimi Gör",
    sendPaymentNotice: "Ödeme bildirimi gönder",
    sendPaymentNoticeDesc:
      "Ödeme yaptıktan sonra dekontu WhatsApp veya Telegram üzerinden gönder.",
    goTelegram: "Telegram’a Git",
    sendWhatsapp: "WhatsApp’a Gönder",
    ok: "Tamam",
    paymentLabels: {
      turkey_bank: "Türkiye Banka Havalesi / EFT",
      balance: "MedyaTora Bakiyesi",
      support: "Destek ile ödeme",
    },
    supportMessage: (info, totalText, paymentLabel) =>
      `Merhaba, ödeme onayı bekliyorum.\n\nGönderen Ad Soyad: ${info.fullName}\nÖdeme Tutarı: ${totalText}\nSipariş Numarası:\n${info.orderNumbers.join("\n")}\nÖdeme Yöntemi: ${paymentLabel}\n\nDekontu ekte iletiyorum.`,
    packageInfoWhatsapp: (platform, category, packageType, quantity) =>
      `Merhaba, ${platform} ${category} paketi hakkında bilgi almak istiyorum. Paket türü: ${packageType}, miktar: ${quantity}.`,
    platformSubtitle: "Platforma göre hızlı sosyal medya paketleri",
    highlights: [
      {
        title: "Hızlı Paket Seçimi",
        description: "Platform, kategori ve paket türünü seçerek hızlıca ilerle.",
        icon: FaBoxesStacked,
      },
      {
        title: "Günlük Yüksek Limit",
        description:
          "Minimum 100, günlük maksimum 5.000.000 adede kadar işlem alınabilir.",
        icon: FaChartLine,
      },
      {
        title: "Sipariş Takibi",
        description: "Siparişini hesabından ve sipariş numarasıyla takip edebilirsin.",
        icon: FaUserCheck,
      },
      {
        title: "Güvenli Bilgilendirme",
        description: "Ödeme, iade ve işlem detayları sipariş öncesi açıkça gösterilir.",
        icon: FaShieldHalved,
      },
    ],
    platforms: [
      {
        slug: "instagram",
        title: "Instagram",
        description: "Takipçi, beğeni, Reels izlenme, yorum ve kaydetme paketleri.",
        icon: FaInstagram,
        gradient: "from-white/[0.08] via-white/[0.035] to-white/[0.02]",
        glow: "bg-white/[0.06]",
        categories: [
          {
            slug: "takipci",
            title: "Takipçi",
            description: "Profilin daha güçlü ve güvenilir görünmesi için.",
          },
          {
            slug: "begeni",
            title: "Beğeni",
            description: "Gönderilerin daha aktif görünmesi için.",
          },
          {
            slug: "reels_izlenme",
            title: "Reels İzlenme",
            description: "Reels videolarının izlenme sayısını artırmak için.",
          },
          {
            slug: "yorum",
            title: "Yorum",
            description: "Gönderilerde daha canlı bir etkileşim görünümü için.",
          },
          {
            slug: "kaydetme",
            title: "Kaydetme",
            description: "İçeriklerin daha değerli görünmesine destek olur.",
          },
          {
            slug: "story_izlenme",
            title: "Story İzlenme",
            description: "Hikaye görüntülenmelerini artırmak için.",
          },
          {
            slug: "profil_ziyareti",
            title: "Profil Ziyareti",
            description: "Profil ziyaretlerini artırmak için.",
          },
        ],
      },
      {
        slug: "tiktok",
        title: "TikTok",
        description: "Takipçi, beğeni, izlenme, yorum ve paylaşım paketleri.",
        icon: FaTiktok,
        gradient: "from-white/[0.08] via-white/[0.035] to-white/[0.02]",
        glow: "bg-white/[0.06]",
        categories: [
          {
            slug: "takipci",
            title: "Takipçi",
            description: "TikTok profilini daha güçlü göstermek için.",
          },
          {
            slug: "begeni",
            title: "Beğeni",
            description: "Videolardaki etkileşim görüntüsünü artırmak için.",
          },
          {
            slug: "izlenme",
            title: "İzlenme",
            description: "Videoların izlenme sayısını yükseltmek için.",
          },
          {
            slug: "yorum",
            title: "Yorum",
            description: "Videolarda daha aktif bir görünüm oluşturmak için.",
          },
          {
            slug: "paylasim",
            title: "Paylaşım",
            description: "İçeriklerin yayılımını güçlendirmek için.",
          },
          {
            slug: "kaydetme",
            title: "Kaydetme",
            description: "İçeriklerin daha değerli görünmesi için.",
          },
          {
            slug: "favori",
            title: "Favori",
            description: "Videoların favori / kayıt görünümünü güçlendirmek için.",
          },
        ],
      },
      {
        slug: "youtube",
        title: "YouTube",
        description: "Abone, izlenme, beğeni, yorum ve Shorts paketleri.",
        icon: FaYoutube,
        gradient: "from-white/[0.08] via-white/[0.035] to-white/[0.02]",
        glow: "bg-white/[0.06]",
        categories: [
          {
            slug: "abone",
            title: "Abone",
            description: "Kanalın daha güvenilir görünmesi için.",
          },
          {
            slug: "izlenme",
            title: "İzlenme",
            description: "Videoların izlenme sayısını artırmak için.",
          },
          {
            slug: "shorts_izlenme",
            title: "Shorts İzlenme",
            description: "Shorts içerikleri için izlenme desteği.",
          },
          {
            slug: "begeni",
            title: "Beğeni",
            description: "Videolardaki olumlu etkileşim görünümü için.",
          },
          {
            slug: "yorum",
            title: "Yorum",
            description: "Video altında daha aktif bir topluluk görünümü için.",
          },
          {
            slug: "canli_yayin",
            title: "Canlı Yayın",
            description: "Canlı yayın görünürlüğünü desteklemek için.",
          },
        ],
      },
      {
        slug: "x",
        title: "X / Twitter",
        description: "Takipçi, beğeni, görüntülenme, retweet ve yorum paketleri.",
        icon: FaXTwitter,
        gradient: "from-white/[0.08] via-white/[0.035] to-white/[0.02]",
        glow: "bg-white/[0.06]",
        categories: [
          {
            slug: "takipci",
            title: "Takipçi",
            description: "Profilin daha güçlü görünmesi için.",
          },
          {
            slug: "begeni",
            title: "Beğeni",
            description: "Paylaşımlarındaki etkileşimi artırmak için.",
          },
          {
            slug: "izlenme",
            title: "Görüntülenme",
            description: "Tweet görüntülenmelerini artırmak için.",
          },
          {
            slug: "retweet",
            title: "Retweet",
            description: "Paylaşımların daha yaygın görünmesi için.",
          },
          {
            slug: "yorum",
            title: "Yorum",
            description: "Paylaşımlarda daha aktif görünüm için.",
          },
          {
            slug: "bookmark",
            title: "Yer İmi / Kaydetme",
            description: "Paylaşımların daha değerli görünmesini destekler.",
          },
        ],
      },
      {
        slug: "telegram",
        title: "Telegram",
        description: "Üye, gönderi izlenme, reaksiyon ve paylaşım paketleri.",
        icon: FaTelegram,
        gradient: "from-white/[0.08] via-white/[0.035] to-white/[0.02]",
        glow: "bg-white/[0.06]",
        categories: [
          {
            slug: "uye",
            title: "Üye",
            description: "Kanal veya grup üye sayısını artırmak için.",
          },
          {
            slug: "izlenme",
            title: "Gönderi İzlenme",
            description: "Telegram gönderilerinin görüntülenmesini artırmak için.",
          },
          {
            slug: "reaksiyon",
            title: "Reaksiyon",
            description: "Gönderilere emoji reaksiyonu eklemek için.",
          },
          {
            slug: "paylasim",
            title: "Paylaşım",
            description: "Gönderi yayılımını desteklemek için.",
          },
          {
            slug: "oylama",
            title: "Oylama",
            description: "Anket ve oylama görünümünü desteklemek için.",
          },
        ],
      },
    ],
    packageTypes: [
      {
        slug: "ekonomik",
        title: "Ekonomik",
        description: "Uygun fiyatlı, hızlı başlangıç yapmak isteyenler için.",
        badge: "Uygun Fiyat",
        colorClass: packageCardClass,
      },
      {
        slug: "global",
        title: "Global",
        description: "Yabancı / global kitle ağırlıklı dengeli paket.",
        badge: "Global",
        colorClass: packageCardClass,
      },
      {
        slug: "turk",
        title: "Türk Kitle",
        description: "Türkiye odaklı daha kaliteli görünüm isteyenler için.",
        badge: "TR",
        colorClass: packageCardClass,
      },
      {
        slug: "garantili",
        title: "Garantili / Düşmeyen",
        description: "Düşüş riskine karşı daha güvenli paket seçeneği.",
        badge: "Garantili",
        colorClass: packageCardClass,
      },
      {
        slug: "hizli",
        title: "Hızlı Teslimat",
        description: "Daha hızlı başlangıç isteyen kullanıcılar için.",
        badge: "Hızlı",
        colorClass: packageCardClass,
      },
    ],
  },

  en: {
    home: "MedyaTora Home",
    analysis: "Analysis",
    whatsappSupport: "WhatsApp Support",
    heroBadge: "Fast social media packages",
    heroTitle: "Choose your platform, build your package, and buy quickly.",
    heroDesc:
      "Quickly choose followers, likes, views, and engagement packages for Instagram, TikTok, YouTube, X, and Telegram. Minimum 100, up to 5,000,000 daily orders can be processed.",
    createPackage: "Build Package",
    goSingleServices: "Go to Single Services",
    selectedPackageSummary: "Selected package summary",
    selected: "Selected",
    select: "Select",
    package: "package",
    packageType: "Package type",
    minimum: "Minimum",
    dailyMaximum: "Daily Maximum",
    unit: "Unit",
    estimatedTotal: "Estimated Total",
    taxIncludedNote:
      "VAT + taxes are included. Packages are designed for users who want a fast order flow.",
    packageBuilder: "Build package",
    choosePlatform: "First, choose your platform",
    builderDesc:
      "The package flow is kept simple. Choose the platform, category, and package type; enter the target username and continue to checkout.",
    categorySelection: "Category selection",
    whatDoYouWant: "what would you like to buy?",
    quantitySelection: "Quantity selection",
    selectQuantity: "Choose the quantity you want",
    minDailyMax: "Minimum {min} · Daily maximum {max}",
    packageTypeSelection: "Package type",
    whatPackage: "What kind of package do you want?",
    per1000: "/ 1000",
    targetInfo: "Target details",
    targetTitle: "Enter the account where the order will be applied",
    targetUsernamePlaceholder: "Target username / channel name",
    targetLinkPlaceholder: "Target link",
    orderNotePlaceholder: "Order note",
    orderSummary: "Order summary",
    quantity: "Quantity",
    buyPackage: "Buy Package",
    getSupport: "Get Support",
    usernameRequired: "You need to enter the target username to continue.",
    wideServiceList: "Wide service list",
    wideServiceTitle: "Go to SMMTora for more platforms and services",
    wideServiceDesc:
      "This page contains the fast package flow. Use SMMTora to see all services, detailed filters, and the wider platform list.",
    goSmmtora: "Go to SMMTora",
    telegramSupport: "Telegram Support",
    footerTitle: "© MedyaTora Packages",
    footerDesc: "Fast social media packages by platform",
    checkoutTitle: "Package Payment",
    close: "Close",
    payerFullNamePlaceholder: "Full name of the person making the payment",
    receiptNameWarning: "It must match the sender name on the receipt.",
    phonePlaceholder: "Phone number",
    contactTypeSelect: "Select contact type",
    contactValuePlaceholder: "Contact information",
    paymentMethod: "Payment method",
    paymentDesc:
      "Packages are currently sold in TL. Balance payments are deducted only from the TL balance.",
    bankTransfer: "Bank Transfer / EFT",
    bankTransferDesc: "Payment is checked after the receipt is sent.",
    tlBalance: "TL Balance",
    balanceLoginRequired: "You must log in to pay with balance.",
    supportPayment: "Pay with support",
    supportPaymentDesc: "Continue with the support team for alternative payment options.",
    bankInfo: "Bank details",
    receiver: "Receiver",
    iban: "IBAN",
    description: "Description",
    yourOrderNumber: "Your order number",
    paymentSecurity: "Payment Security",
    paymentSecurityText:
      "The full name of the person making the payment must match the sender name on the receipt. Payments that do not match will not be approved.",
    refundContractApproval: "Refund and Contract Approval",
    refundContractText:
      "You may request a refund before the process starts. Once the process has started, cancellation/refund is not possible. If a delivery issue is caused by us, a refund may be issued for the missing part.",
    terms: "Terms of use",
    privacy: "privacy policy",
    refundPolicy: "refund policy",
    distanceSales: "distance sales agreement",
    acceptPrefix: "I have read and accept the",
    acceptSuffix: ".",
    and: "and",
    acceptanceRequired:
      "You must accept the contracts and policies to create the order.",
    total: "Total",
    creatingOrder: "Creating order...",
    createOrder: "Create Order",
    packageOrder: "Package Order",
    orderReceived: "Your order has been received",
    orderReceivedFallback:
      "Your package order has been created. It will be processed according to the payment status.",
    orderNumber: "Order number",
    balancePaymentCompleted: "Balance payment completed",
    balancePaymentCompletedText:
      "The package amount of {amount} has been deducted from your balance.",
    goAccount: "Go to My Account",
    viewOrders: "View My Orders",
    sendPaymentNotice: "Send payment notice",
    sendPaymentNoticeDesc:
      "After payment, send the receipt via WhatsApp or Telegram.",
    goTelegram: "Go to Telegram",
    sendWhatsapp: "Send on WhatsApp",
    ok: "OK",
    paymentLabels: {
      turkey_bank: "Turkey Bank Transfer / EFT",
      balance: "MedyaTora Balance",
      support: "Pay with support",
    },
    supportMessage: (info, totalText, paymentLabel) =>
      `Hello, I am waiting for payment approval.\n\nSender full name: ${info.fullName}\nPayment amount: ${totalText}\nOrder number:\n${info.orderNumbers.join("\n")}\nPayment method: ${paymentLabel}\n\nI am sending the receipt as an attachment.`,
    packageInfoWhatsapp: (platform, category, packageType, quantity) =>
      `Hello, I would like information about the ${platform} ${category} package. Package type: ${packageType}, quantity: ${quantity}.`,
    platformSubtitle: "Fast social media packages by platform",
    highlights: [
      {
        title: "Fast Package Selection",
        description: "Move quickly by choosing the platform, category, and package type.",
        icon: FaBoxesStacked,
      },
      {
        title: "High Daily Limit",
        description:
          "Orders can be processed from a minimum of 100 up to a daily maximum of 5,000,000.",
        icon: FaChartLine,
      },
      {
        title: "Order Tracking",
        description: "You can track your order from your account and with your order number.",
        icon: FaUserCheck,
      },
      {
        title: "Clear Information",
        description: "Payment, refund, and process details are shown clearly before ordering.",
        icon: FaShieldHalved,
      },
    ],
    platforms: [
      {
        slug: "instagram",
        title: "Instagram",
        description: "Follower, like, Reels view, comment, and save packages.",
        icon: FaInstagram,
        gradient: "from-white/[0.08] via-white/[0.035] to-white/[0.02]",
        glow: "bg-white/[0.06]",
        categories: [
          {
            slug: "takipci",
            title: "Followers",
            description: "For a stronger and more trusted profile appearance.",
          },
          {
            slug: "begeni",
            title: "Likes",
            description: "For posts that look more active.",
          },
          {
            slug: "reels_izlenme",
            title: "Reels Views",
            description: "To increase the view count of Reels videos.",
          },
          {
            slug: "yorum",
            title: "Comments",
            description: "For a more lively engagement appearance on posts.",
          },
          {
            slug: "kaydetme",
            title: "Saves",
            description: "Supports a more valuable content appearance.",
          },
          {
            slug: "story_izlenme",
            title: "Story Views",
            description: "To increase story views.",
          },
          {
            slug: "profil_ziyareti",
            title: "Profile Visits",
            description: "To increase profile visits.",
          },
        ],
      },
      {
        slug: "tiktok",
        title: "TikTok",
        description: "Follower, like, view, comment, and share packages.",
        icon: FaTiktok,
        gradient: "from-white/[0.08] via-white/[0.035] to-white/[0.02]",
        glow: "bg-white/[0.06]",
        categories: [
          {
            slug: "takipci",
            title: "Followers",
            description: "To make your TikTok profile look stronger.",
          },
          {
            slug: "begeni",
            title: "Likes",
            description: "To improve the engagement appearance on videos.",
          },
          {
            slug: "izlenme",
            title: "Views",
            description: "To increase video views.",
          },
          {
            slug: "yorum",
            title: "Comments",
            description: "To create a more active look on videos.",
          },
          {
            slug: "paylasim",
            title: "Shares",
            description: "To strengthen content distribution.",
          },
          {
            slug: "kaydetme",
            title: "Saves",
            description: "To make content look more valuable.",
          },
          {
            slug: "favori",
            title: "Favorites",
            description: "To strengthen the favorite/save appearance of videos.",
          },
        ],
      },
      {
        slug: "youtube",
        title: "YouTube",
        description: "Subscriber, view, like, comment, and Shorts packages.",
        icon: FaYoutube,
        gradient: "from-white/[0.08] via-white/[0.035] to-white/[0.02]",
        glow: "bg-white/[0.06]",
        categories: [
          {
            slug: "abone",
            title: "Subscribers",
            description: "For a more trusted channel appearance.",
          },
          {
            slug: "izlenme",
            title: "Views",
            description: "To increase video views.",
          },
          {
            slug: "shorts_izlenme",
            title: "Shorts Views",
            description: "View support for Shorts content.",
          },
          {
            slug: "begeni",
            title: "Likes",
            description: "For a stronger positive engagement appearance on videos.",
          },
          {
            slug: "yorum",
            title: "Comments",
            description: "For a more active community appearance under videos.",
          },
          {
            slug: "canli_yayin",
            title: "Live Stream",
            description: "To support live stream visibility.",
          },
        ],
      },
      {
        slug: "x",
        title: "X / Twitter",
        description: "Follower, like, view, retweet, and comment packages.",
        icon: FaXTwitter,
        gradient: "from-white/[0.08] via-white/[0.035] to-white/[0.02]",
        glow: "bg-white/[0.06]",
        categories: [
          {
            slug: "takipci",
            title: "Followers",
            description: "For a stronger profile appearance.",
          },
          {
            slug: "begeni",
            title: "Likes",
            description: "To increase engagement on your posts.",
          },
          {
            slug: "izlenme",
            title: "Views",
            description: "To increase tweet impressions.",
          },
          {
            slug: "retweet",
            title: "Retweets",
            description: "To make posts look more widely shared.",
          },
          {
            slug: "yorum",
            title: "Comments",
            description: "For a more active look on posts.",
          },
          {
            slug: "bookmark",
            title: "Bookmarks / Saves",
            description: "Supports a more valuable post appearance.",
          },
        ],
      },
      {
        slug: "telegram",
        title: "Telegram",
        description: "Member, post view, reaction, and share packages.",
        icon: FaTelegram,
        gradient: "from-white/[0.08] via-white/[0.035] to-white/[0.02]",
        glow: "bg-white/[0.06]",
        categories: [
          {
            slug: "uye",
            title: "Members",
            description: "To increase channel or group member count.",
          },
          {
            slug: "izlenme",
            title: "Post Views",
            description: "To increase Telegram post views.",
          },
          {
            slug: "reaksiyon",
            title: "Reactions",
            description: "To add emoji reactions to posts.",
          },
          {
            slug: "paylasim",
            title: "Shares",
            description: "To support post distribution.",
          },
          {
            slug: "oylama",
            title: "Poll Votes",
            description: "To support poll and vote appearance.",
          },
        ],
      },
    ],
    packageTypes: [
      {
        slug: "ekonomik",
        title: "Economy",
        description: "For users who want an affordable, quick start.",
        badge: "Affordable",
        colorClass: packageCardClass,
      },
      {
        slug: "global",
        title: "Global",
        description: "A balanced package with a global audience focus.",
        badge: "Global",
        colorClass: packageCardClass,
      },
      {
        slug: "turk",
        title: "Turkish Audience",
        description: "For users who want a Turkey-focused higher-quality appearance.",
        badge: "TR",
        colorClass: packageCardClass,
      },
      {
        slug: "garantili",
        title: "Guaranteed / Non-drop",
        description: "A safer package option against drop risk.",
        badge: "Guaranteed",
        colorClass: packageCardClass,
      },
      {
        slug: "hizli",
        title: "Fast Delivery",
        description: "For users who want a faster start.",
        badge: "Fast",
        colorClass: packageCardClass,
      },
    ],
  },

  ru: {
    home: "Главная MedyaTora",
    analysis: "Анализ",
    whatsappSupport: "Поддержка WhatsApp",
    heroBadge: "Быстрые пакеты для соцсетей",
    heroTitle: "Выберите платформу, соберите пакет и быстро оформите покупку.",
    heroDesc:
      "Быстро выбирайте пакеты подписчиков, лайков, просмотров и вовлечения для Instagram, TikTok, YouTube, X и Telegram. Минимум 100, до 5 000 000 операций в день.",
    createPackage: "Создать пакет",
    goSingleServices: "Перейти к отдельным услугам",
    selectedPackageSummary: "Сводка выбранного пакета",
    selected: "Выбрано",
    select: "Выбрать",
    package: "пакет",
    packageType: "Тип пакета",
    minimum: "Минимум",
    dailyMaximum: "Дневной максимум",
    unit: "Единица",
    estimatedTotal: "Примерная сумма",
    taxIncludedNote:
      "НДС + налоги включены. Пакеты подготовлены для пользователей, которым нужен быстрый заказ.",
    packageBuilder: "Создать пакет",
    choosePlatform: "Сначала выберите платформу",
    builderDesc:
      "Структура пакета сделана простой. Выберите платформу, категорию и тип пакета; укажите целевой username и перейдите к оплате.",
    categorySelection: "Выбор категории",
    whatDoYouWant: "что вы хотите купить?",
    quantitySelection: "Выбор количества",
    selectQuantity: "Выберите нужное количество",
    minDailyMax: "Минимум {min} · Дневной максимум {max}",
    packageTypeSelection: "Тип пакета",
    whatPackage: "Какой пакет вам нужен?",
    per1000: "/ 1000",
    targetInfo: "Данные цели",
    targetTitle: "Укажите аккаунт, к которому будет применён заказ",
    targetUsernamePlaceholder: "Целевой username / название канала",
    targetLinkPlaceholder: "Целевая ссылка",
    orderNotePlaceholder: "Примечание к заказу",
    orderSummary: "Сводка заказа",
    quantity: "Количество",
    buyPackage: "Купить пакет",
    getSupport: "Получить поддержку",
    usernameRequired: "Чтобы продолжить, нужно указать целевой username.",
    wideServiceList: "Широкий список услуг",
    wideServiceTitle: "Для большего количества платформ и услуг перейдите в SMMTora",
    wideServiceDesc:
      "Здесь находится быстрый поток пакетов. Чтобы увидеть все услуги, детальные фильтры и расширенный список платформ, используйте SMMTora.",
    goSmmtora: "Перейти в SMMTora",
    telegramSupport: "Поддержка Telegram",
    footerTitle: "© Пакеты MedyaTora",
    footerDesc: "Быстрые пакеты для соцсетей по платформам",
    checkoutTitle: "Оплата пакета",
    close: "Закрыть",
    payerFullNamePlaceholder: "Имя и фамилия плательщика",
    receiptNameWarning: "Должно совпадать с именем отправителя в чеке.",
    phonePlaceholder: "Номер телефона",
    contactTypeSelect: "Выберите тип связи",
    contactValuePlaceholder: "Контактная информация",
    paymentMethod: "Способ оплаты",
    paymentDesc:
      "Пакеты сейчас продаются в TL. Оплата с баланса списывается только с TL-баланса.",
    bankTransfer: "Банковский перевод / EFT",
    bankTransferDesc: "Платёж проверяется после отправки чека.",
    tlBalance: "Баланс TL",
    balanceLoginRequired: "Для оплаты с баланса необходимо войти в аккаунт.",
    supportPayment: "Оплата через поддержку",
    supportPaymentDesc: "Для альтернативной оплаты продолжите с командой поддержки.",
    bankInfo: "Банковские реквизиты",
    receiver: "Получатель",
    iban: "IBAN",
    description: "Описание",
    yourOrderNumber: "Ваш номер заказа",
    paymentSecurity: "Безопасность оплаты",
    paymentSecurityText:
      "Имя и фамилия плательщика должны совпадать с именем отправителя в чеке. Платежи без совпадения не подтверждаются.",
    refundContractApproval: "Подтверждение возврата и договора",
    refundContractText:
      "Вы можете запросить возврат до начала процесса. После начала процесса отмена/возврат невозможны. Если недоставка произошла по нашей причине, за недостающую часть может быть выполнен возврат.",
    terms: "условия использования",
    privacy: "политику конфиденциальности",
    refundPolicy: "условия возврата",
    distanceSales: "договор дистанционной продажи",
    acceptPrefix: "Я прочитал(а) и принимаю",
    acceptSuffix: ".",
    and: "и",
    acceptanceRequired:
      "Чтобы создать заказ, необходимо принять договоры и политики.",
    total: "Итого",
    creatingOrder: "Создание заказа...",
    createOrder: "Создать заказ",
    packageOrder: "Заказ пакета",
    orderReceived: "Ваш заказ получен",
    orderReceivedFallback:
      "Ваш заказ пакета создан. Он будет обработан в зависимости от статуса оплаты.",
    orderNumber: "Номер заказа",
    balancePaymentCompleted: "Оплата с баланса завершена",
    balancePaymentCompletedText:
      "Сумма пакета {amount} была списана с вашего баланса.",
    goAccount: "Перейти в аккаунт",
    viewOrders: "Посмотреть заказы",
    sendPaymentNotice: "Отправить уведомление об оплате",
    sendPaymentNoticeDesc:
      "После оплаты отправьте чек через WhatsApp или Telegram.",
    goTelegram: "Перейти в Telegram",
    sendWhatsapp: "Отправить в WhatsApp",
    ok: "ОК",
    paymentLabels: {
      turkey_bank: "Банковский перевод / EFT в Турции",
      balance: "Баланс MedyaTora",
      support: "Оплата через поддержку",
    },
    supportMessage: (info, totalText, paymentLabel) =>
      `Здравствуйте, ожидаю подтверждения оплаты.\n\nИмя отправителя: ${info.fullName}\nСумма оплаты: ${totalText}\nНомер заказа:\n${info.orderNumbers.join("\n")}\nСпособ оплаты: ${paymentLabel}\n\nПрикрепляю чек.`,
    packageInfoWhatsapp: (platform, category, packageType, quantity) =>
      `Здравствуйте, хочу получить информацию о пакете ${platform} ${category}. Тип пакета: ${packageType}, количество: ${quantity}.`,
    platformSubtitle: "Быстрые пакеты для соцсетей по платформам",
    highlights: [
      {
        title: "Быстрый выбор пакета",
        description: "Быстро продолжайте, выбрав платформу, категорию и тип пакета.",
        icon: FaBoxesStacked,
      },
      {
        title: "Высокий дневной лимит",
        description: "Обрабатываются заказы от минимума 100 до дневного максимума 5 000 000.",
        icon: FaChartLine,
      },
      {
        title: "Отслеживание заказа",
        description: "Вы можете отслеживать заказ в аккаунте и по номеру заказа.",
        icon: FaUserCheck,
      },
      {
        title: "Понятная информация",
        description: "Оплата, возврат и детали процесса ясно показываются до заказа.",
        icon: FaShieldHalved,
      },
    ],
    platforms: [
      {
        slug: "instagram",
        title: "Instagram",
        description: "Пакеты подписчиков, лайков, просмотров Reels, комментариев и сохранений.",
        icon: FaInstagram,
        gradient: "from-white/[0.08] via-white/[0.035] to-white/[0.02]",
        glow: "bg-white/[0.06]",
        categories: [
          {
            slug: "takipci",
            title: "Подписчики",
            description: "Для более сильного и доверительного вида профиля.",
          },
          {
            slug: "begeni",
            title: "Лайки",
            description: "Чтобы публикации выглядели активнее.",
          },
          {
            slug: "reels_izlenme",
            title: "Просмотры Reels",
            description: "Для увеличения числа просмотров Reels.",
          },
          {
            slug: "yorum",
            title: "Комментарии",
            description: "Для более живого вида вовлечения в публикациях.",
          },
          {
            slug: "kaydetme",
            title: "Сохранения",
            description: "Поддерживает более ценный вид контента.",
          },
          {
            slug: "story_izlenme",
            title: "Просмотры Stories",
            description: "Для увеличения просмотров историй.",
          },
          {
            slug: "profil_ziyareti",
            title: "Посещения профиля",
            description: "Для увеличения посещений профиля.",
          },
        ],
      },
      {
        slug: "tiktok",
        title: "TikTok",
        description: "Пакеты подписчиков, лайков, просмотров, комментариев и репостов.",
        icon: FaTiktok,
        gradient: "from-white/[0.08] via-white/[0.035] to-white/[0.02]",
        glow: "bg-white/[0.06]",
        categories: [
          {
            slug: "takipci",
            title: "Подписчики",
            description: "Чтобы профиль TikTok выглядел сильнее.",
          },
          {
            slug: "begeni",
            title: "Лайки",
            description: "Чтобы усилить вид вовлечения в видео.",
          },
          {
            slug: "izlenme",
            title: "Просмотры",
            description: "Для увеличения просмотров видео.",
          },
          {
            slug: "yorum",
            title: "Комментарии",
            description: "Чтобы видео выглядели активнее.",
          },
          {
            slug: "paylasim",
            title: "Репосты",
            description: "Для усиления распространения контента.",
          },
          {
            slug: "kaydetme",
            title: "Сохранения",
            description: "Чтобы контент выглядел более ценным.",
          },
          {
            slug: "favori",
            title: "Избранное",
            description: "Для усиления вида избранного/сохранений у видео.",
          },
        ],
      },
      {
        slug: "youtube",
        title: "YouTube",
        description: "Пакеты подписчиков, просмотров, лайков, комментариев и Shorts.",
        icon: FaYoutube,
        gradient: "from-white/[0.08] via-white/[0.035] to-white/[0.02]",
        glow: "bg-white/[0.06]",
        categories: [
          {
            slug: "abone",
            title: "Подписчики",
            description: "Для более доверительного вида канала.",
          },
          {
            slug: "izlenme",
            title: "Просмотры",
            description: "Для увеличения просмотров видео.",
          },
          {
            slug: "shorts_izlenme",
            title: "Просмотры Shorts",
            description: "Поддержка просмотров для Shorts.",
          },
          {
            slug: "begeni",
            title: "Лайки",
            description: "Для более сильного положительного вовлечения на видео.",
          },
          {
            slug: "yorum",
            title: "Комментарии",
            description: "Для более активного вида сообщества под видео.",
          },
          {
            slug: "canli_yayin",
            title: "Прямой эфир",
            description: "Для поддержки видимости прямого эфира.",
          },
        ],
      },
      {
        slug: "x",
        title: "X / Twitter",
        description: "Пакеты подписчиков, лайков, просмотров, ретвитов и комментариев.",
        icon: FaXTwitter,
        gradient: "from-white/[0.08] via-white/[0.035] to-white/[0.02]",
        glow: "bg-white/[0.06]",
        categories: [
          {
            slug: "takipci",
            title: "Подписчики",
            description: "Для более сильного вида профиля.",
          },
          {
            slug: "begeni",
            title: "Лайки",
            description: "Для увеличения вовлечения в публикациях.",
          },
          {
            slug: "izlenme",
            title: "Просмотры",
            description: "Для увеличения просмотров твитов.",
          },
          {
            slug: "retweet",
            title: "Ретвиты",
            description: "Чтобы публикации выглядели более распространяемыми.",
          },
          {
            slug: "yorum",
            title: "Комментарии",
            description: "Для более активного вида публикаций.",
          },
          {
            slug: "bookmark",
            title: "Закладки / сохранения",
            description: "Поддерживает более ценный вид публикаций.",
          },
        ],
      },
      {
        slug: "telegram",
        title: "Telegram",
        description: "Пакеты участников, просмотров постов, реакций и репостов.",
        icon: FaTelegram,
        gradient: "from-white/[0.08] via-white/[0.035] to-white/[0.02]",
        glow: "bg-white/[0.06]",
        categories: [
          {
            slug: "uye",
            title: "Участники",
            description: "Для увеличения числа участников канала или группы.",
          },
          {
            slug: "izlenme",
            title: "Просмотры постов",
            description: "Для увеличения просмотров постов Telegram.",
          },
          {
            slug: "reaksiyon",
            title: "Реакции",
            description: "Чтобы добавить emoji-реакции к постам.",
          },
          {
            slug: "paylasim",
            title: "Репосты",
            description: "Для поддержки распространения поста.",
          },
          {
            slug: "oylama",
            title: "Голоса в опросе",
            description: "Для поддержки вида опросов и голосований.",
          },
        ],
      },
    ],
    packageTypes: [
      {
        slug: "ekonomik",
        title: "Эконом",
        description: "Для тех, кто хочет доступный и быстрый старт.",
        badge: "Доступно",
        colorClass: packageCardClass,
      },
      {
        slug: "global",
        title: "Global",
        description: "Сбалансированный пакет с акцентом на global-аудиторию.",
        badge: "Global",
        colorClass: packageCardClass,
      },
      {
        slug: "turk",
        title: "Турецкая аудитория",
        description: "Для более качественного вида с фокусом на Турцию.",
        badge: "TR",
        colorClass: packageCardClass,
      },
      {
        slug: "garantili",
        title: "С гарантией / Non-drop",
        description: "Более безопасный вариант против риска списаний.",
        badge: "Гарантия",
        colorClass: packageCardClass,
      },
      {
        slug: "hizli",
        title: "Быстрая доставка",
        description: "Для пользователей, которым нужен более быстрый старт.",
        badge: "Быстро",
        colorClass: packageCardClass,
      },
    ],
  },
};

const PACKAGE_PRICE_MATRIX: Record<
  PlatformSlug,
  Record<string, Record<PackageTypeSlug, number>>
> = {
  instagram: {
    takipci: { ekonomik: 119, global: 149, turk: 249, garantili: 249, hizli: 299 },
    begeni: { ekonomik: 59, global: 79, turk: 119, garantili: 119, hizli: 149 },
    reels_izlenme: { ekonomik: 29, global: 39, turk: 59, garantili: 59, hizli: 79 },
    reels_begeni: { ekonomik: 59, global: 79, turk: 119, garantili: 119, hizli: 149 },
    reels_yorum: { ekonomik: 199, global: 249, turk: 399, garantili: 399, hizli: 449 },
    yorum: { ekonomik: 199, global: 249, turk: 399, garantili: 399, hizli: 449 },
    kaydetme: { ekonomik: 69, global: 89, turk: 139, garantili: 139, hizli: 169 },
    story_izlenme: { ekonomik: 39, global: 49, turk: 79, garantili: 79, hizli: 99 },
    profil_ziyareti: { ekonomik: 49, global: 69, turk: 99, garantili: 99, hizli: 129 },
  },
  tiktok: {
    takipci: { ekonomik: 109, global: 139, turk: 229, garantili: 229, hizli: 279 },
    begeni: { ekonomik: 49, global: 69, turk: 109, garantili: 109, hizli: 139 },
    izlenme: { ekonomik: 19, global: 29, turk: 49, garantili: 49, hizli: 69 },
    yorum: { ekonomik: 179, global: 229, turk: 379, garantili: 379, hizli: 429 },
    kaydetme: { ekonomik: 59, global: 79, turk: 119, garantili: 119, hizli: 149 },
    paylasim: { ekonomik: 59, global: 79, turk: 119, garantili: 119, hizli: 149 },
    favori: { ekonomik: 59, global: 79, turk: 119, garantili: 119, hizli: 149 },
  },
  youtube: {
    abone: { ekonomik: 299, global: 399, turk: 599, garantili: 599, hizli: 699 },
    izlenme: { ekonomik: 69, global: 89, turk: 149, garantili: 149, hizli: 179 },
    shorts_izlenme: { ekonomik: 39, global: 59, turk: 89, garantili: 89, hizli: 119 },
    begeni: { ekonomik: 89, global: 119, turk: 179, garantili: 179, hizli: 219 },
    yorum: { ekonomik: 249, global: 329, turk: 499, garantili: 499, hizli: 599 },
    canli_yayin: { ekonomik: 99, global: 129, turk: 199, garantili: 199, hizli: 249 },
  },
  x: {
    takipci: { ekonomik: 149, global: 199, turk: 299, garantili: 299, hizli: 349 },
    begeni: { ekonomik: 69, global: 89, turk: 139, garantili: 139, hizli: 169 },
    izlenme: { ekonomik: 29, global: 39, turk: 69, garantili: 69, hizli: 89 },
    retweet: { ekonomik: 89, global: 119, turk: 179, garantili: 179, hizli: 219 },
    yorum: { ekonomik: 199, global: 249, turk: 399, garantili: 399, hizli: 449 },
    bookmark: { ekonomik: 69, global: 89, turk: 139, garantili: 139, hizli: 169 },
  },
  telegram: {
    uye: { ekonomik: 129, global: 169, turk: 249, garantili: 249, hizli: 299 },
    izlenme: { ekonomik: 19, global: 29, turk: 49, garantili: 49, hizli: 69 },
    reaksiyon: { ekonomik: 49, global: 69, turk: 99, garantili: 99, hizli: 129 },
    paylasim: { ekonomik: 59, global: 79, turk: 119, garantili: 119, hizli: 149 },
    oylama: { ekonomik: 79, global: 99, turk: 149, garantili: 149, hizli: 179 },
  },
};

function getPackagePricePer1000(
  platform: PlatformSlug,
  category: string,
  packageType: PackageTypeSlug
) {
  const platformPrices = PACKAGE_PRICE_MATRIX[platform];
  const categoryPrices = platformPrices?.[category];

  if (categoryPrices?.[packageType]) {
    return categoryPrices[packageType];
  }

  const firstCategoryKey = Object.keys(platformPrices || {})[0];
  const fallbackPrice = platformPrices?.[firstCategoryKey]?.[packageType];

  return fallbackPrice || 149;
}

function detectInitialLocale(): LocaleCode {
  if (typeof window === "undefined") return "tr";

  const saved = window.localStorage.getItem("medyatora_locale");

  if (saved === "tr" || saved === "en" || saved === "ru") {
    return saved;
  }

  const browserLang = (navigator.language || "").toLowerCase();

  if (browserLang.startsWith("tr")) return "tr";
  if (browserLang.startsWith("ru")) return "ru";

  return "en";
}

function MobileLanguageSwitcher({
  selectedLocale,
  onChange,
}: {
  selectedLocale: LocaleCode;
  onChange: (locale: LocaleCode) => void;
}) {
  return (
    <div className="flex h-9 w-fit items-center overflow-hidden rounded-full border border-white/10 bg-white/[0.05] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:hidden">
      {localeOptions.map((locale) => (
        <button
          key={locale}
          type="button"
          onClick={() => onChange(locale)}
          className={`h-7 rounded-full px-2.5 text-[10px] font-black uppercase transition ${
            selectedLocale === locale
              ? "bg-white text-black"
              : "text-white/60 hover:bg-white/[0.08] hover:text-white"
          }`}
        >
          {locale}
        </button>
      ))}
    </div>
  );
}

function formatNumber(value: number) {
  return value.toLocaleString("tr-TR");
}

function formatMoney(value: number) {
  return `${Number(value || 0).toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} TL`;
}

function clampQuantity(value: number) {
  if (!Number.isFinite(value)) return MIN_QUANTITY;
  return Math.min(Math.max(value, MIN_QUANTITY), MAX_QUANTITY);
}

export default function PaketlerPage() {
  const [selectedLocale, setSelectedLocale] = useState<LocaleCode>("tr");

  useEffect(() => {
    setSelectedLocale(detectInitialLocale());

    function handleLocaleEvent() {
      setSelectedLocale(detectInitialLocale());
    }

    window.addEventListener("medyatora_locale_changed", handleLocaleEvent);

    return () => {
      window.removeEventListener("medyatora_locale_changed", handleLocaleEvent);
    };
  }, []);

  function handleLocaleChange(locale: LocaleCode) {
    setSelectedLocale(locale);

    if (typeof window !== "undefined") {
      window.localStorage.setItem("medyatora_locale", locale);
      window.dispatchEvent(new Event("medyatora_locale_changed"));
    }
  }

  const t = useMemo(
    () => pageText[selectedLocale] || pageText.tr,
    [selectedLocale]
  );

  const platforms = t.platforms;
  const packageTypes = t.packageTypes;
  const highlights = t.highlights;

  const [selectedPlatformSlug, setSelectedPlatformSlug] =
    useState<PlatformSlug>("instagram");

  const selectedPlatform = useMemo(
    () =>
      platforms.find((platform) => platform.slug === selectedPlatformSlug) ||
      platforms[0],
    [platforms, selectedPlatformSlug]
  );

  const [selectedCategorySlug, setSelectedCategorySlug] = useState(
    selectedPlatform.categories[0].slug
  );

  const [selectedPackageTypeSlug, setSelectedPackageTypeSlug] =
    useState<PackageTypeConfig["slug"]>("global");

  const [quantity, setQuantity] = useState(1000);
  const [targetUsername, setTargetUsername] = useState("");
  const [targetLink, setTargetLink] = useState("");
  const [orderNote, setOrderNote] = useState("");

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [contactType, setContactType] = useState<ContactType>("");
  const [contactValue, setContactValue] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("");
  const [paymentTermsAccepted, setPaymentTermsAccepted] = useState(false);

  const [authUser, setAuthUser] = useState<AuthUser | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [createdPaymentInfo, setCreatedPaymentInfo] =
    useState<CreatedPaymentInfo | null>(null);

  useEffect(() => {
    if (
      !selectedPlatform.categories.some(
        (category) => category.slug === selectedCategorySlug
      )
    ) {
      setSelectedCategorySlug(selectedPlatform.categories[0].slug);
    }
  }, [selectedPlatform, selectedCategorySlug]);

  const selectedCategory = useMemo(() => {
    return (
      selectedPlatform.categories.find(
        (category) => category.slug === selectedCategorySlug
      ) || selectedPlatform.categories[0]
    );
  }, [selectedPlatform, selectedCategorySlug]);

  const selectedPackageType = useMemo(() => {
    return (
      packageTypes.find((type) => type.slug === selectedPackageTypeSlug) ||
      packageTypes[0]
    );
  }, [packageTypes, selectedPackageTypeSlug]);

  const selectedPricePer1000 = useMemo(() => {
    return getPackagePricePer1000(
      selectedPlatform.slug,
      selectedCategory.slug,
      selectedPackageType.slug
    );
  }, [selectedPlatform.slug, selectedCategory.slug, selectedPackageType.slug]);

  function getTypePricePer1000(typeSlug: PackageTypeSlug) {
    return getPackagePricePer1000(
      selectedPlatform.slug,
      selectedCategory.slug,
      typeSlug
    );
  }

  const estimatedPrice = useMemo(() => {
    return (quantity / 1000) * selectedPricePer1000;
  }, [quantity, selectedPricePer1000]);

  const canOpenCheckout =
    Boolean(targetUsername.trim()) && quantity >= MIN_QUANTITY;

  const isCheckoutValid =
    !!fullName.trim() &&
    !!phoneNumber.trim() &&
    !!contactType &&
    !!contactValue.trim() &&
    !!paymentMethod &&
    paymentTermsAccepted;

  useEffect(() => {
    async function loadAuthUser() {
      try {
        const res = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        const data = await res.json();

        if (data.ok && data.user) {
          setAuthUser({
            id: data.user.id,
            email: data.user.email,
            full_name: data.user.full_name,
            balance_tl: Number(data.user.balance_tl || 0),
            balance_usd: Number(data.user.balance_usd || 0),
            balance_rub: Number(data.user.balance_rub || 0),
          });
        } else {
          setAuthUser(null);
        }
      } catch {
        setAuthUser(null);
      }
    }

    loadAuthUser();
  }, []);

  function handlePlatformSelect(slug: PlatformSlug) {
    const nextPlatform =
      platforms.find((platform) => platform.slug === slug) || platforms[0];

    setSelectedPlatformSlug(slug);
    setSelectedCategorySlug(nextPlatform.categories[0].slug);
    setError("");
    setSuccessMessage("");
  }

  function handleQuantityInput(value: string) {
    const onlyDigits = value.replace(/\D/g, "");
    const numericValue = Number(onlyDigits || MIN_QUANTITY);
    setQuantity(clampQuantity(numericValue));
  }

  function resetCheckoutForm() {
    setFullName("");
    setPhoneNumber("");
    setContactType("");
    setContactValue("");
    setPaymentMethod("");
    setPaymentTermsAccepted(false);
  }

  function closeCheckoutModal() {
    setCheckoutOpen(false);
    resetCheckoutForm();
  }

  function getPaymentMethodLabel(method: PaymentMethod) {
    if (method === "turkey_bank") return t.paymentLabels.turkey_bank;
    if (method === "balance") return t.paymentLabels.balance;
    if (method === "support") return t.paymentLabels.support;
    return "-";
  }

  function getOrderSupportMessage(paymentInfo: CreatedPaymentInfo) {
    return t.supportMessage(
      paymentInfo,
      formatMoney(paymentInfo.totalAmount),
      getPaymentMethodLabel(paymentInfo.paymentMethod)
    );
  }

  function buildTelegramLink(paymentInfo?: CreatedPaymentInfo | null) {
    const message = paymentInfo ? getOrderSupportMessage(paymentInfo) : "";

    return `https://t.me/${TELEGRAM_USERNAME}${
      message ? `?text=${encodeURIComponent(message)}` : ""
    }`;
  }

  function buildWhatsappPaymentLink(paymentInfo: CreatedPaymentInfo) {
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
      getOrderSupportMessage(paymentInfo)
    )}`;
  }

  async function submitPackageOrder() {
    if (!isCheckoutValid) return;

    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const res = await fetch("/api/package-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          platform: selectedPlatform.slug,
          category: selectedCategory.slug,
          package_type: selectedPackageType.slug,
          quantity,
          target_username: targetUsername.trim(),
          target_link: targetLink.trim(),
          order_note: orderNote.trim(),
          full_name: fullName.trim(),
          phone_number: phoneNumber.trim(),
          contact_type: contactType,
          contact_value: contactValue.trim(),
          payment_method: paymentMethod,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Paket siparişi oluşturulamadı.");
      }

      const orderNumbers = Array.isArray(data.orderNumbers)
        ? data.orderNumbers
        : data.orderNumber
          ? [data.orderNumber]
          : [];

      setCreatedPaymentInfo({
        orderNumbers,
        fullName: fullName.trim(),
        totalAmount: Number(data.totalPrice || estimatedPrice),
        paymentMethod,
      });

      setSuccessMessage(data.message || "");
      setCheckoutOpen(false);
      setSuccessOpen(true);
      resetCheckoutForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mt-premium-page text-white">
      <div className="mt-premium-inner">
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.04),transparent_34%),linear-gradient(to_bottom,rgba(255,255,255,0.02),transparent_28%,transparent_72%,rgba(255,255,255,0.02))]" />

          <div className="relative mx-auto max-w-6xl px-6 py-10 md:py-16">
            <header className="mb-8 flex flex-col gap-4 rounded-[28px] border border-white/10 bg-[#080a0d]/92 p-4 shadow-[0_18px_70px_rgba(0,0,0,0.36)] ring-1 ring-white/[0.025] backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center justify-between gap-3">
                <Link
                  href="/"
                  className="inline-flex w-fit items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-black text-white/72 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
                >
                  ← {t.home}
                </Link>

                <MobileLanguageSwitcher
                  selectedLocale={selectedLocale}
                  onChange={handleLocaleChange}
                />
              </div>

              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-end">
                <nav className="flex flex-wrap gap-2">
                  <Link
                    href="/analiz"
                    className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-white/70 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
                  >
                    {t.analysis}
                  </Link>

                  <Link
                    href="/smmtora"
                    className="rounded-2xl border border-white/12 bg-white px-4 py-2.5 text-sm font-black text-black shadow-[0_14px_34px_rgba(255,255,255,0.08)] transition hover:bg-white/90"
                  >
                    SMMTora
                  </Link>

                  <a
                    href={getWhatsappLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-white/70 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
                  >
                    {t.whatsappSupport}
                  </a>
                </nav>

                <UserMenu />
              </div>
            </header>

            <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
              <div>
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-white/72">
                  <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
                  {t.heroBadge}
                </div>

                <h1 className="mb-5 text-4xl font-bold leading-tight tracking-tight md:text-6xl">
                  {t.heroTitle}
                </h1>

                <p className="mb-8 max-w-2xl text-lg leading-8 text-white/70 md:text-xl">
                  {t.heroDesc}
                </p>

                <div className="flex flex-col gap-4 sm:flex-row">
                  <a
                    href="#package-builder"
                    className="rounded-2xl bg-white px-6 py-3 text-center font-semibold text-black transition hover:bg-white/90"
                  >
                    {t.createPackage}
                  </a>

                  <a
                    href="/smmtora"
                    className="rounded-2xl border border-white/20 px-6 py-3 text-center font-semibold text-white transition hover:bg-white/10"
                  >
                    {t.goSingleServices}
                  </a>
                </div>
              </div>

              <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.35)] backdrop-blur md:p-8">
                <p className="mb-4 text-sm uppercase tracking-[0.2em] text-white/45">
                  {t.selectedPackageSummary}
                </p>

                <div className="rounded-3xl border border-white/10 bg-white/[0.055] p-5">
                  <div className="mb-4 inline-flex rounded-full bg-white px-3 py-1 text-xs font-bold text-black">
                    {selectedPackageType.badge}
                  </div>

                  <h3 className="mb-3 text-2xl font-bold">
                    {selectedPlatform.title} {selectedCategory.title}
                  </h3>

                  <p className="mb-5 text-sm leading-6 text-white/65">
                    {selectedPackageType.title} {t.package} ·{" "}
                    {formatNumber(quantity)}
                  </p>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                      <p className="text-xs text-white/40">{t.minimum}</p>
                      <p className="mt-1 font-black text-white">
                        {formatNumber(MIN_QUANTITY)}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                      <p className="text-xs text-white/40">{t.dailyMaximum}</p>
                      <p className="mt-1 font-black text-white">
                        {formatNumber(MAX_QUANTITY)}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                      <p className="text-xs text-white/40">{t.unit}</p>
                      <p className="mt-1 font-black text-white">
                        {formatMoney(selectedPricePer1000)} {t.per1000}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/12 bg-white/[0.065] px-4 py-3">
                      <p className="text-xs text-white/45">{t.estimatedTotal}</p>
                      <p className="mt-1 font-black text-white">
                        {formatMoney(estimatedPrice)}
                      </p>
                    </div>
                  </div>

                  <p className="mt-5 text-xs leading-5 text-white/45">
                    {t.taxIncludedNote}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="package-builder"
          className="mx-auto max-w-6xl scroll-mt-8 px-6 pb-14"
        >
          <div className="mb-7">
            <p className="mb-2 text-sm uppercase tracking-[0.2em] text-white/50">
              {t.packageBuilder}
            </p>

            <h2 className="text-3xl font-bold md:text-4xl">
              {t.choosePlatform}
            </h2>

            <p className="mt-3 max-w-3xl leading-7 text-white/65">
              {t.builderDesc}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {platforms.map((platform) => {
              const Icon = platform.icon;
              const active = selectedPlatform.slug === platform.slug;

              return (
                <button
                  key={platform.slug}
                  type="button"
                  onClick={() => handlePlatformSelect(platform.slug)}
                  className={`group relative overflow-hidden rounded-[28px] border bg-gradient-to-br p-5 text-left transition hover:-translate-y-1 hover:shadow-[0_18px_60px_rgba(0,0,0,0.35)] ${
                    active
                      ? "border-white/28 from-white/[0.13] to-white/[0.045]"
                      : `border-white/10 ${platform.gradient} hover:border-white/20`
                  }`}
                >
                  <div
                    className={`pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full ${platform.glow} blur-3xl transition group-hover:scale-125`}
                  />

                  <div className="relative">
                    <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/15 bg-black/30 text-white">
                      <Icon className="h-7 w-7" />
                    </div>

                    <h3 className="mb-2 text-xl font-bold">{platform.title}</h3>

                    <p className="min-h-[72px] text-sm leading-6 text-white/65">
                      {platform.description}
                    </p>

                    {active ? (
                      <span className="mt-4 inline-flex rounded-full bg-white px-3 py-1 text-xs font-black text-black">
                        {t.selected}
                      </span>
                    ) : (
                      <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-white">
                        {t.select}
                        <FaArrowRight className="transition group-hover:translate-x-1" />
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.85fr]">
            <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 md:p-6">
              <p className="mb-2 text-sm uppercase tracking-[0.2em] text-white/50">
                {t.categorySelection}
              </p>

              <h3 className="mb-4 text-2xl font-bold">
                {selectedPlatform.title} {t.whatDoYouWant}
              </h3>

              <div className="grid gap-3 sm:grid-cols-2">
                {selectedPlatform.categories.map((category) => {
                  const active = selectedCategory.slug === category.slug;

                  return (
                    <button
                      key={category.slug}
                      type="button"
                      onClick={() => setSelectedCategorySlug(category.slug)}
                      className={`rounded-3xl border p-4 text-left transition hover:-translate-y-0.5 ${
                        active
                          ? "border-white/28 bg-white/[0.095]"
                          : "border-white/10 bg-black/20 hover:bg-white/[0.06]"
                      }`}
                    >
                      <p className="font-black text-white">{category.title}</p>
                      <p className="mt-2 text-sm leading-6 text-white/55">
                        {category.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 md:p-6">
              <p className="mb-2 text-sm uppercase tracking-[0.2em] text-white/50">
                {t.quantitySelection}
              </p>

              <h3 className="mb-4 text-2xl font-bold">{t.selectQuantity}</h3>

              <input
                value={String(quantity)}
                onChange={(event) => handleQuantityInput(event.target.value)}
                inputMode="numeric"
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-lg font-black text-white outline-none transition focus:border-white/28"
              />

              <p className="mt-2 text-xs leading-5 text-white/45">
                {t.minDailyMax
                  .replace("{min}", formatNumber(MIN_QUANTITY))
                  .replace("{max}", formatNumber(MAX_QUANTITY))}
              </p>

              <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
                {quickQuantities.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setQuantity(item)}
                    className={`rounded-2xl border px-3 py-2 text-xs font-black transition hover:-translate-y-0.5 ${
                      quantity === item
                        ? "border-white bg-white text-black"
                        : "border-white/10 bg-black/20 text-white/75 hover:bg-white/[0.06]"
                    }`}
                  >
                    {formatNumber(item)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-[28px] border border-white/10 bg-white/[0.04] p-5 md:p-6">
            <p className="mb-2 text-sm uppercase tracking-[0.2em] text-white/50">
              {t.packageTypeSelection}
            </p>

            <h3 className="mb-4 text-2xl font-bold">{t.whatPackage}</h3>

            <div className="grid gap-3 md:grid-cols-5">
              {packageTypes.map((type) => {
                const active = selectedPackageType.slug === type.slug;

                return (
                  <button
                    key={type.slug}
                    type="button"
                    onClick={() => setSelectedPackageTypeSlug(type.slug)}
                    className={`relative overflow-hidden rounded-3xl border p-4 text-left transition hover:-translate-y-0.5 ${
                      active
                        ? type.colorClass
                        : "border-white/10 bg-black/20 hover:bg-white/[0.06]"
                    }`}
                  >
                    <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/10 blur-3xl" />

                    <div className="relative">
                      <span className="mb-3 inline-flex rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-[10px] font-black uppercase tracking-wide text-white/55">
                        {type.badge}
                      </span>

                      <p className="font-black text-white">{type.title}</p>

                      <p className="mt-2 text-sm leading-6 text-white/55">
                        {type.description}
                      </p>

                      <p
                        className={`mt-3 text-sm font-black ${
                          active ? "text-white" : "text-white/78"
                        }`}
                      >
                        {formatMoney(getTypePricePer1000(type.slug))} {t.per1000}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-5 rounded-[28px] border border-white/10 bg-white/[0.04] p-5 md:p-6">
            <p className="mb-2 text-sm uppercase tracking-[0.2em] text-white/50">
              {t.targetInfo}
            </p>

            <h3 className="mb-4 text-2xl font-bold">{t.targetTitle}</h3>

            <div className="grid gap-3 md:grid-cols-2">
              <input
                value={targetUsername}
                onChange={(event) => setTargetUsername(event.target.value)}
                placeholder={t.targetUsernamePlaceholder}
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none placeholder:text-white/35 transition focus:border-white/28"
              />

              <input
                value={targetLink}
                onChange={(event) => setTargetLink(event.target.value)}
                placeholder={t.targetLinkPlaceholder}
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none placeholder:text-white/35 transition focus:border-white/28"
              />
            </div>

            <textarea
              value={orderNote}
              onChange={(event) => setOrderNote(event.target.value)}
              placeholder={t.orderNotePlaceholder}
              className="mt-3 min-h-[90px] w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none placeholder:text-white/35 transition focus:border-white/28"
            />
          </div>

          <div className="mt-5 rounded-[28px] border border-white/12 bg-white/[0.055] p-5 md:p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-white/45">
                  {t.orderSummary}
                </p>

                <h3 className="mt-2 text-2xl font-black text-white">
                  {selectedPlatform.title} {selectedCategory.title} ·{" "}
                  {selectedPackageType.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-white/65">
                  {t.quantity}:{" "}
                  <span className="font-black text-white">
                    {formatNumber(quantity)}
                  </span>{" "}
                  · {t.estimatedTotal}:{" "}
                  <span className="font-black text-white">
                    {formatMoney(estimatedPrice)}
                  </span>
                </p>

                <p className="mt-2 text-xs leading-5 text-white/45">
                  {t.taxIncludedNote}
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  disabled={!canOpenCheckout}
                  onClick={() => {
                    setError("");
                    setPaymentTermsAccepted(false);
                    setCheckoutOpen(true);
                  }}
                  className="rounded-2xl bg-white px-6 py-3 text-center text-sm font-black text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {t.buyPackage}
                </button>

                <a
                  href={getWhatsappLink(
                    t.packageInfoWhatsapp(
                      selectedPlatform.title,
                      selectedCategory.title,
                      selectedPackageType.title,
                      formatNumber(quantity)
                    )
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 px-6 py-3 text-center text-sm font-bold text-white transition hover:bg-white/10"
                >
                  <FaWhatsapp />
                  {t.getSupport}
                </a>
              </div>
            </div>

            {!canOpenCheckout && (
              <div className="mt-4 rounded-2xl border border-[#6b5b2a]/60 bg-[#211d11]/70 px-4 py-3 text-sm text-[#e7d9a4]">
                {t.usernameRequired}
              </div>
            )}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-14">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {highlights.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-5"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-black/20 text-lg text-white/82">
                  <item.icon />
                </div>

                <h3 className="mb-2 font-semibold">{item.title}</h3>
                <p className="text-sm leading-6 text-white/65">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-24">
          <div className="flex flex-col gap-6 rounded-[28px] border border-white/10 bg-gradient-to-br from-white/[0.1] to-white/[0.03] p-8 md:p-10 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="mb-3 text-sm uppercase tracking-[0.2em] text-white/50">
                {t.wideServiceList}
              </p>

              <h2 className="mb-3 text-3xl font-bold md:text-4xl">
                {t.wideServiceTitle}
              </h2>

              <p className="leading-7 text-white/70">{t.wideServiceDesc}</p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <a
                href="/smmtora"
                className="rounded-2xl bg-white px-6 py-3 text-center font-semibold text-black transition hover:bg-white/90"
              >
                {t.goSmmtora}
              </a>

              <a
                href={CONTACT.telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-2xl border border-white/20 px-6 py-3 text-center font-semibold text-white transition hover:bg-white/10"
              >
                {t.telegramSupport}
              </a>
            </div>
          </div>
        </section>

        <footer className="border-t border-white/10 px-6 py-10">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 text-sm text-white/50 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="font-semibold text-white">{t.footerTitle}</div>
              <div>{t.footerDesc}</div>
            </div>

            <div className="flex flex-wrap gap-4">
              <a href="/" className="transition hover:text-white">
                MedyaTora
              </a>

              <a href="/smmtora" className="transition hover:text-white">
                SMMTora
              </a>

              <a
                href={CONTACT.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="transition hover:text-white"
              >
                Instagram
              </a>
            </div>
          </div>
        </footer>
      </div>

      {checkoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 backdrop-blur-sm sm:p-4">
          <div className="flex max-h-[calc(100dvh-24px)] w-full max-w-2xl flex-col overflow-hidden rounded-[28px] border border-white/10 bg-[#121826]/95 shadow-[0_28px_120px_rgba(0,0,0,0.58)] ring-1 ring-white/[0.035] backdrop-blur-xl sm:max-h-[92vh] sm:rounded-[32px]">
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/10 px-4 py-3 sm:px-5">
              <div>
                <p className="text-sm font-black text-white">{t.checkoutTitle}</p>
                <p className="mt-1 text-xs text-white/45">
                  {selectedPlatform.title} {selectedCategory.title} ·{" "}
                  {formatMoney(estimatedPrice)}
                </p>
              </div>

              <button
                type="button"
                onClick={closeCheckoutModal}
                className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-bold text-white/75 transition hover:bg-white/10 hover:text-white"
              >
                {t.close}
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <input
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    placeholder={t.payerFullNamePlaceholder}
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.055] px-4 py-3 text-white outline-none placeholder:text-white/30 transition focus:border-white/28"
                  />

                  <p className="mt-2 text-xs leading-5 text-amber-100/80">
                    {t.receiptNameWarning}
                  </p>
                </div>

                <input
                  value={phoneNumber}
                  onChange={(event) =>
                    setPhoneNumber(event.target.value.replace(/[^\d+]/g, ""))
                  }
                  placeholder={t.phonePlaceholder}
                  inputMode="tel"
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.055] px-4 py-3 text-white outline-none placeholder:text-white/30 transition focus:border-white/28"
                />

                <select
                  value={contactType}
                  onChange={(event) =>
                    setContactType(event.target.value as ContactType)
                  }
                  className="w-full rounded-2xl border border-white/10 bg-[#121826] px-4 py-3 text-white outline-none transition focus:border-white/28"
                >
                  <option value="" className="bg-[#121826]">
                    {t.contactTypeSelect}
                  </option>
                  {contactTypes.map((item) => (
                    <option key={item} value={item} className="bg-[#121826]">
                      {item}
                    </option>
                  ))}
                </select>

                <input
                  value={contactValue}
                  onChange={(event) => setContactValue(event.target.value)}
                  placeholder={t.contactValuePlaceholder}
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.055] px-4 py-3 text-white outline-none placeholder:text-white/30 transition focus:border-white/28"
                />
              </div>

              <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.055] p-4">
                <p className="text-sm font-bold text-white">{t.paymentMethod}</p>
                <p className="mt-1 text-sm leading-6 text-white/60">
                  {t.paymentDesc}
                </p>

                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("turkey_bank")}
                    className={`rounded-2xl border p-4 text-left transition ${
                      paymentMethod === "turkey_bank"
                        ? "border-white/28 bg-white/[0.095]"
                        : "border-white/10 bg-black/20 hover:bg-white/[0.06]"
                    }`}
                  >
                    <p className="text-sm font-bold text-white">
                      {t.bankTransfer}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-white/55">
                      {t.bankTransferDesc}
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("balance")}
                    disabled={!authUser}
                    className={`rounded-2xl border p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-50 ${
                      paymentMethod === "balance"
                        ? "border-white/28 bg-white/[0.095]"
                        : "border-white/10 bg-black/20 hover:bg-white/[0.06]"
                    }`}
                  >
                    <p className="text-sm font-bold text-white">{t.tlBalance}</p>
                    <p className="mt-1 text-xs leading-5 text-white/55">
                      {authUser
                        ? `${t.tlBalance}: ${formatMoney(authUser.balance_tl)}`
                        : t.balanceLoginRequired}
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("support")}
                    className={`rounded-2xl border p-4 text-left transition ${
                      paymentMethod === "support"
                        ? "border-white/28 bg-white/[0.095]"
                        : "border-white/10 bg-black/20 hover:bg-white/[0.06]"
                    }`}
                  >
                    <p className="text-sm font-bold text-white">
                      {t.supportPayment}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-white/55">
                      {t.supportPaymentDesc}
                    </p>
                  </button>
                </div>

                {paymentMethod === "turkey_bank" && (
                  <div className="mt-4 rounded-2xl border border-white/12 bg-white/[0.055] p-4 text-sm leading-6 text-white/72">
                    <p className="font-bold text-white">{t.bankInfo}</p>
                    <p className="mt-2">
                      <span className="font-bold text-white">{t.receiver}:</span>{" "}
                      {TURKEY_BANK_ACCOUNT_NAME}
                    </p>
                    <p>
                      <span className="font-bold text-white">{t.iban}:</span>{" "}
                      {TURKEY_BANK_IBAN}
                    </p>
                    <p>
                      <span className="font-bold text-white">
                        {t.description}:
                      </span>{" "}
                      {t.yourOrderNumber}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-4 rounded-2xl border border-[#6b5b2a]/60 bg-[#211d11]/70 p-4 text-sm leading-6 text-[#e7d9a4]">
                <p className="font-bold text-white">{t.paymentSecurity}</p>
                <p className="mt-2">{t.paymentSecurityText}</p>

                <p className="mt-4 font-bold text-white">
                  {t.refundContractApproval}
                </p>
                <p className="mt-2">{t.refundContractText}</p>

                <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 bg-black/20 p-3">
                  <input
                    type="checkbox"
                    checked={paymentTermsAccepted}
                    onChange={(event) =>
                      setPaymentTermsAccepted(event.target.checked)
                    }
                    className="mt-1 h-4 w-4 shrink-0 accent-white"
                  />

                  <span className="text-sm leading-6 text-white/80">
                    {t.acceptPrefix ? `${t.acceptPrefix} ` : ""}
                    <a
                      href="/kullanim-sartlari"
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-white underline underline-offset-4 hover:text-white/80"
                    >
                      {t.terms}
                    </a>
                    ,{" "}
                    <a
                      href="/gizlilik-politikasi"
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-white underline underline-offset-4 hover:text-white/80"
                    >
                      {t.privacy}
                    </a>
                    ,{" "}
                    <a
                      href="/iade-politikasi"
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-white underline underline-offset-4 hover:text-white/80"
                    >
                      {t.refundPolicy}
                    </a>{" "}
                    {t.and}{" "}
                    <a
                      href="/mesafeli-satis-sozlesmesi"
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-white underline underline-offset-4 hover:text-white/80"
                    >
                      {t.distanceSales}
                    </a>{" "}
                    {t.acceptSuffix}
                  </span>
                </label>

                {!paymentTermsAccepted && (
                  <p className="mt-3 text-xs leading-5">
                    {t.acceptanceRequired}
                  </p>
                )}
              </div>

              <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.055] p-4">
                <div className="flex items-center justify-between text-sm text-white/60">
                  <span>{t.package}</span>
                  <span>
                    {selectedPlatform.title} {selectedCategory.title}
                  </span>
                </div>

                <div className="mt-2 flex items-center justify-between text-sm text-white/60">
                  <span>{t.packageType}</span>
                  <span>{selectedPackageType.title}</span>
                </div>

                <div className="mt-2 flex items-center justify-between text-sm text-white/60">
                  <span>{t.quantity}</span>
                  <span>{formatNumber(quantity)}</span>
                </div>

                <div className="mt-3 flex items-center justify-between text-base font-black text-white">
                  <span>{t.total}</span>
                  <span>{formatMoney(estimatedPrice)}</span>
                </div>
              </div>

              {error && (
                <div className="mt-4 rounded-2xl border border-[#6b2232] bg-[#31101b]/70 px-4 py-3 text-sm text-[#f2c7d1]">
                  {error}
                </div>
              )}
            </div>

            <div className="shrink-0 border-t border-white/10 bg-[#121826]/95 px-4 py-3 backdrop-blur-xl sm:px-5">
              <button
                type="button"
                onClick={submitPackageOrder}
                disabled={!isCheckoutValid || loading}
                className="w-full rounded-2xl bg-white px-5 py-3 text-sm font-black text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? t.creatingOrder : t.createOrder}
              </button>
            </div>
          </div>
        </div>
      )}

      {successOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 backdrop-blur-sm sm:p-4">
          <div className="flex max-h-[calc(100dvh-24px)] w-full max-w-2xl flex-col overflow-hidden rounded-[28px] border border-white/10 bg-[#121826]/95 shadow-[0_28px_120px_rgba(0,0,0,0.58)] ring-1 ring-white/[0.035] backdrop-blur-xl sm:max-h-[92vh] sm:rounded-[32px]">
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/10 px-4 py-3 sm:px-5">
              <p className="text-sm font-black text-white/80">
                {t.packageOrder}
              </p>

              <button
                type="button"
                onClick={() => setSuccessOpen(false)}
                className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-bold text-white/75 transition hover:bg-white/10 hover:text-white"
              >
                {t.close}
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
              <h2 className="text-2xl font-bold text-white">
                {t.orderReceived}
              </h2>

              <p className="mt-2 text-sm leading-6 text-white/60">
                {successMessage || t.orderReceivedFallback}
              </p>

              <div className="mt-5 space-y-3">
                {createdPaymentInfo?.orderNumbers.map((number) => (
                  <div
                    key={number}
                    className="rounded-2xl border border-white/12 bg-white/[0.055] p-4"
                  >
                    <p className="text-sm text-white/62">{t.orderNumber}</p>
                    <p className="mt-1 text-lg font-bold text-white">{number}</p>
                  </div>
                ))}
              </div>

              {createdPaymentInfo?.paymentMethod === "balance" ? (
                <div className="mt-5 rounded-2xl border border-white/12 bg-white/[0.055] p-4">
                  <p className="text-sm font-bold text-white">
                    {t.balancePaymentCompleted}
                  </p>

                  <p className="mt-2 text-sm leading-6 text-white/70">
                    {t.balancePaymentCompletedText.replace(
                      "{amount}",
                      formatMoney(createdPaymentInfo.totalAmount)
                    )}
                  </p>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <a
                      href="/hesabim"
                      className="rounded-2xl bg-white px-5 py-3 text-center text-sm font-black text-black transition hover:bg-white/90"
                    >
                      {t.goAccount}
                    </a>

                    <a
                      href="/hesabim/siparisler"
                      className="rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-3 text-center text-sm font-bold text-white transition hover:bg-white/[0.1]"
                    >
                      {t.viewOrders}
                    </a>
                  </div>
                </div>
              ) : (
                <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.055] p-4">
                  <p className="text-sm font-bold text-white">
                    {t.sendPaymentNotice}
                  </p>

                  <p className="mt-2 text-sm leading-6 text-white/60">
                    {t.sendPaymentNoticeDesc}
                  </p>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <a
                      href={buildTelegramLink(createdPaymentInfo)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-2xl border border-white/12 bg-white/[0.08] px-5 py-3 text-center text-sm font-bold text-white transition hover:bg-white/[0.12]"
                    >
                      {t.goTelegram}
                    </a>

                    <a
                      href={
                        createdPaymentInfo
                          ? buildWhatsappPaymentLink(createdPaymentInfo)
                          : "#"
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-2xl bg-white px-5 py-3 text-center text-sm font-black text-black transition hover:bg-white/90"
                    >
                      {t.sendWhatsapp}
                    </a>
                  </div>
                </div>
              )}
            </div>

            <div className="shrink-0 border-t border-white/10 bg-[#121826]/95 px-4 py-3 backdrop-blur-xl sm:px-5">
              <button
                type="button"
                onClick={() => setSuccessOpen(false)}
                className="w-full rounded-2xl bg-white px-5 py-3 text-sm font-black text-black transition hover:bg-white/90"
              >
                {t.ok}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}