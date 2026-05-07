"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import type { IconType } from "react-icons";
import {
  FaArrowLeft,
  FaArrowRight,
  FaBuilding,
  FaCheck,
  FaCircleQuestion,
  FaInstagram,
  FaPaperPlane,
  FaTiktok,
  FaUserTie,
  FaXTwitter,
  FaYoutube,
} from "react-icons/fa6";
import { detectBrowserLocale, type Locale } from "@/lib/i18n";

type PlatformKey = "instagram" | "tiktok" | "youtube" | "x";
type ContactType = "WhatsApp" | "Telegram" | "Instagram" | "E-posta" | "";
type CurrencyCode = "TL" | "USD" | "RUB";

type OptionCard = {
  value: string;
  title: string;
  description: string;
  icon?: IconType;
};

type PlatformOption = {
  key: PlatformKey;
  title: string;
  description: string;
  icon: IconType;
};

type AnalysisFormText = {
  selected: string;
  platform: string;
  target: string;
  detail: string;
  confirm: string;

  heroBadge: string;
  heroTitle: string;
  heroDesc: string;

  infoFocusLabel: string;
  infoFocusValue: string;
  infoProcessLabel: string;
  infoProcessValue: string;
  infoResultLabel: string;
  infoResultValue: string;

  sideTitle: string;
  sideItems: string[];

  platformEyebrow: string;
  platformTitle: string;

  accountTypeEyebrow: string;
  accountTypeTitle: string;
  accountTypeDesc: string;

  goalEyebrow: string;
  goalTitle: string;

  detailEyebrow: string;
  detailTitle: string;
  usernameLabel: string;
  usernamePlaceholder: string;
  accountLinkLabel: string;
  accountLinkPlaceholder: string;
  currentStatusLabel: string;
  currentStatusPlaceholder: string;
  contentStyleLabel: string;
  contentStylePlaceholder: string;
  mainProblemLabel: string;
  mainProblemPlaceholder: string;
  extraNoteLabel: string;
  extraNotePlaceholder: string;

  contactEyebrow: string;
  contactTitle: string;
  contactDesc: string;
  summaryPlatform: string;
  summaryAccountType: string;
  summaryGoal: string;
  contactInfoTitle: string;
  fullNameLabel: string;
  fullNamePlaceholder: string;
  contactChannelLabel: string;
  contactChannelPlaceholder: string;
  contactValueLabel: string;
  contactValuePlaceholder: string;

  paymentInfoLabel: string;
  currencyTitle: string;
  currencyDesc: string;
  selectedAmount: string;
  privacyConsent: string;
  privacyConsentLink: string;
  errorPrivacyConsent: string;

  back: string;
  continue: string;
  creating: string;
  finishAndPay: string;

  errorSelectPlatform: string;
  errorAccountTypeGoal: string;
  errorDetailRequired: string;
  errorFullName: string;
  errorContact: string;
  errorUsername: string;
  errorCreateFailed: string;
  errorGeneric: string;

  notePlatform: string;
  noteAccountType: string;
  noteGoal: string;
  noteUsername: string;
  noteAccountLink: string;
  noteCurrentStatus: string;
  noteContentStyle: string;
  noteMainProblem: string;
  noteExtraNote: string;
  noteCurrency: string;
  notePrice: string;

  platforms: PlatformOption[];
  accountTypeOptions: OptionCard[];
  goalOptions: OptionCard[];
  currentStatusOptions: string[];
  contentStyleOptions: string[];
  problemOptions: string[];
};

type AnalysisRequestResponse = {
  success?: boolean;
  ok?: boolean;
  error?: string;
  message?: string;
  requestId?: string | number;
  analysisRequestId?: string | number;
  analysis_request_id?: string | number;
  id?: string | number;
  isFreeAnalysis?: boolean;
  freeAnalysisUsed?: boolean;
  paymentRequired?: boolean;
  packagePrice?: string | number;
  formattedPackagePrice?: string;
  currency?: CurrencyCode;
};

const ANALYSIS_PAYMENT_PATH = "/analiz/odeme";

const contactTypes: ContactType[] = [
  "WhatsApp",
  "Telegram",
  "Instagram",
  "E-posta",
];

const priceMap: Record<CurrencyCode, string> = {
  TL: "1000 TL",
  USD: "15 USD",
  RUB: "1800 RUB",
};

const analysisFormText: Record<Locale, AnalysisFormText> = {
  tr: {
    selected: "Seçili",
    platform: "Platform",
    target: "Hedef",
    detail: "Detay",
    confirm: "Onay",

    heroBadge: "Profesyonel Hesap Analizi",
    heroTitle: "Analize Başla",
    heroDesc:
      "Sosyal medya hesabınızın neden yeterli büyüme, güven veya dönüşüm sağlayamadığını profesyonel bakışla inceliyoruz. Profil görünümü, içerik düzeni, ilk saniye etkisi, anlatım dili, hedef kitle uyumu ve satışa giden akış birlikte değerlendirilir.",

    infoFocusLabel: "Odak",
    infoFocusValue: "Profil, içerik, güven ve dönüşüm",
    infoProcessLabel: "Süreç",
    infoProcessValue: "Form alınır, ekip inceler, analiz hazırlanır",
    infoResultLabel: "Sonuç",
    infoResultValue: "Eksikler ve iyileştirme alanları paylaşılır",

    sideTitle: "Analizde neleri inceliyoruz?",
    sideItems: [
      "Profilinizin ilk bakışta ne kadar güven verdiğini",
      "İçeriklerinizin kullanıcıyı ilk saniyede yakalayıp yakalamadığını",
      "Video, görsel ve açıklama dilinizin hedef kitleyle uyumunu",
      "Paylaşım düzeninizin büyüme açısından yeterli olup olmadığını",
      "Reklam, DM, web sitesi veya satış akışında kopma yaşanan noktaları",
    ],

    platformEyebrow: "Platform seçimi",
    platformTitle: "Hangi platformu analiz ettirmek istiyorsunuz?",

    accountTypeEyebrow: "Hesap türü",
    accountTypeTitle: "Hesabınız ne için kullanılıyor?",
    accountTypeDesc:
      "Hesabınız işletme, marka, içerik sayfası, proje, medya kanalı, e-ticaret veya kişisel marka olabilir. Size en yakın yapıyı seçin.",

    goalEyebrow: "Analizde ne bekliyorsunuz?",
    goalTitle: "Bu analizden asıl beklentiniz nedir?",

    detailEyebrow: "Profil / hesap linki",
    detailTitle: "Hesabınızı daha iyi anlayalım",
    usernameLabel: "Kullanıcı adı veya hesap adı",
    usernamePlaceholder: "@kullaniciadi veya hesap adı",
    accountLinkLabel: "Profil / hesap linki",
    accountLinkPlaceholder: "https://...",
    currentStatusLabel: "Mevcut durum",
    currentStatusPlaceholder: "Mevcut durumu seçin",
    contentStyleLabel: "İçerik yapısı",
    contentStylePlaceholder: "İçerik yapısını seçin",
    mainProblemLabel: "Ana sorun alanı",
    mainProblemPlaceholder: "Ana sorunu seçin",
    extraNoteLabel: "Ek not",
    extraNotePlaceholder:
      "Özellikle bakılmasını istediğiniz bir konu varsa buraya yazabilirsiniz.",

    contactEyebrow: "İletişim ve onay",
    contactTitle: "Başvuruyu tamamla ve ödemeye geç",
    contactDesc:
      "Başvurunuz oluşturulduktan sonra ödeme ekranına yönlendirilirsiniz. Ödeme tamamlandığında analiz talebiniz ekip tarafından incelenir.",
    summaryPlatform: "Platform",
    summaryAccountType: "Hesap tipi",
    summaryGoal: "Beklenti",
    contactInfoTitle: "İletişim bilgileri",
    fullNameLabel: "Ad soyad",
    fullNamePlaceholder: "Adınız ve soyadınız",
    contactChannelLabel: "İletişim kanalı",
    contactChannelPlaceholder: "İletişim kanalı seçin",
    contactValueLabel: "İletişim bilginiz",
    contactValuePlaceholder: "+90 5xx..., @kullanici veya e-posta",

    paymentInfoLabel: "Ödeme bilgisi",
    currencyTitle: "Para birimini seçin",
    currencyDesc:
      "Sonraki ekranda analiz talebi numarası, seçilen para birimi ve ödeme bilgileri gösterilecek.",
    selectedAmount: "Seçili tutar",
    privacyConsent:
      "Gizlilik politikası, mesafeli satış sözleşmesi ve analiz hizmeti bilgilendirmesini okudum, onaylıyorum.",
    privacyConsentLink: "Sözleşmeleri ve politikaları görüntüle",
    errorPrivacyConsent:
      "Devam etmek için gizlilik politikası ve hizmet onayını kabul etmelisin.",

    back: "Geri",
    continue: "Devam Et",
    creating: "Analiz oluşturuluyor...",
    finishAndPay: "Analizi Bitir ve Ödemeye Geç",

    errorSelectPlatform: "Lütfen analiz edilecek platformu seçin.",
    errorAccountTypeGoal:
      "Lütfen hesap tipini ve analizden beklentinizi seçin.",
    errorDetailRequired:
      "Lütfen hesap bilgisi, mevcut durum, içerik yapısı ve ana sorun alanlarını doldurun.",
    errorFullName: "Ad soyad boş bırakılamaz.",
    errorContact: "İletişim kanalı ve iletişim bilginiz gereklidir.",
    errorUsername: "Kullanıcı adı veya hesap bilgisi gereklidir.",
    errorCreateFailed: "Analiz başvurusu oluşturulamadı.",
    errorGeneric: "Başvuru oluşturulurken bir hata oluştu.",

    notePlatform: "Platform",
    noteAccountType: "Hesap tipi",
    noteGoal: "Analizde beklenen",
    noteUsername: "Kullanıcı adı / hesap adı",
    noteAccountLink: "Hesap linki",
    noteCurrentStatus: "Mevcut durum",
    noteContentStyle: "İçerik yapısı",
    noteMainProblem: "Ana sorun",
    noteExtraNote: "Ek not",
    noteCurrency: "Seçilen para birimi",
    notePrice: "Analiz fiyat etiketi",

    platforms: [
      {
        key: "instagram",
        title: "Instagram",
        description:
          "Profil güveni, Reels düzeni, içerik dili, DM ve satış dönüşümü incelenir.",
        icon: FaInstagram,
      },
      {
        key: "tiktok",
        title: "TikTok",
        description:
          "İlk saniye etkisi, video akışı, izlenme potansiyeli ve takipçi dönüşümü incelenir.",
        icon: FaTiktok,
      },
      {
        key: "youtube",
        title: "YouTube",
        description:
          "Kanal görünümü, başlıklar, kapaklar, Shorts yapısı, izlenme süresi ve abone dönüşümü incelenir.",
        icon: FaYoutube,
      },
      {
        key: "x",
        title: "X / Twitter",
        description:
          "Profil algısı, paylaşım dili, görünürlük, etkileşim ve yönlendirme gücü incelenir.",
        icon: FaXTwitter,
      },
    ],

    accountTypeOptions: [
      {
        value: "İşletme / Marka Hesabı",
        title: "İşletme / Marka",
        description:
          "Ürün, hizmet veya marka güveni oluşturmak isteyen hesaplar için uygundur.",
        icon: FaBuilding,
      },
      {
        value: "E-ticaret / Satış Hesabı",
        title: "E-ticaret / Satış",
        description:
          "Ürün satışı, reklam dönüşümü, DM siparişi veya site trafiği hedefleyen hesaplar için.",
      },
      {
        value: "İçerik Üretici / Kişisel Marka",
        title: "Kişisel Marka / Creator",
        description:
          "Uzmanlık, görünürlük, takipçi büyümesi ve içerik disiplini hedefleyen hesaplar için.",
        icon: FaUserTie,
      },
      {
        value: "Hizmet Sağlayıcı / Uzman Hesabı",
        title: "Uzman / Hizmet",
        description:
          "Danışmanlık, klinik, emlak, güzellik, ajans, eğitim veya profesyonel hizmet sunan hesaplar için.",
      },
      {
        value: "Medya / Haber / Eğlence Kanalı",
        title: "Medya / Kanal",
        description:
          "Film, haber, mizah, bilgi, içerik derleme, Reels veya Shorts temelli sayfalar için.",
      },
      {
        value: "Topluluk / Proje / Organizasyon",
        title: "Topluluk / Proje",
        description:
          "Etkinlik, topluluk, organizasyon, kulüp veya proje hesabı olarak kullanılan yapılar için.",
      },
      {
        value: "Yeni Açılmış Hesap",
        title: "Yeni Hesap",
        description:
          "Henüz düzeni oturmamış, doğru başlangıç ve sağlam kurulum isteyen hesaplar için.",
      },
      {
        value: "Diğer",
        title: "Diğer",
        description:
          "Yukarıdakilere tam uymuyorsa bu seçeneği seçip detayları not alanında belirtebilirsiniz.",
      },
    ],

    goalOptions: [
      {
        value: "Profil güveni ve profesyonel görünüm kazanmak",
        title: "Profil güveni",
        description:
          "Hesabımın ilk bakışta daha güçlü, düzenli ve güven veren bir yapıya kavuşmasını istiyorum.",
      },
      {
        value: "Daha fazla görünürlük ve erişim elde etmek",
        title: "Görünürlük",
        description:
          "Paylaşımlarımın daha çok kişiye ulaşmasını ve keşfet / önerilen alanlarda güçlenmesini istiyorum.",
      },
      {
        value: "Takipçi, abone veya topluluk büyümesini artırmak",
        title: "Büyüme",
        description:
          "Hesabın kitlesini daha sağlıklı ve daha istikrarlı biçimde büyütmek istiyorum.",
      },
      {
        value: "Satış, mesaj veya müşteri dönüşümünü iyileştirmek",
        title: "Dönüşüm",
        description:
          "İzlenme veya trafik geliyor ama mesaj, satış ya da müşteri dönüşümü yeterli değil.",
      },
      {
        value: "İçerik düzeni ve paylaşım stratejisi oluşturmak",
        title: "İçerik düzeni",
        description:
          "Ne paylaşacağımı, hangi formatta ilerleyeceğimi ve nasıl bir sistem kuracağımı netleştirmek istiyorum.",
      },
      {
        value: "Reklam performansını destekleyecek hesap yapısı kurmak",
        title: "Reklam desteği",
        description:
          "Reklam veriyorum veya vermeyi düşünüyorum; önce hesabımın buna ne kadar hazır olduğunu görmek istiyorum.",
      },
      {
        value: "Hesabımdaki açıkları profesyonel analizle görmek",
        title: "Genel analiz",
        description:
          "Profil, içerik, güven algısı, dönüşüm ve büyüme tarafındaki açıkları görmek istiyorum.",
      },
    ],

    currentStatusOptions: [
      "Yeni başladım, hesabın temel düzenini doğru kurmak istiyorum",
      "Hesabım aktif ama profesyonel görünmediğini düşünüyorum",
      "Düzenli paylaşım yapıyorum fakat büyüme zayıf ilerliyor",
      "İçerik üretiyorum ama beklediğim görünürlüğü alamıyorum",
      "İzlenme alıyorum ancak etkileşim düşük kalıyor",
      "Mesaj geliyor ama satışa ya da müşteriye dönüşmüyor",
      "Reklam veriyorum ama sonuçlardan memnun değilim",
      "Hesapta neyin eksik olduğunu net göremiyorum",
      "Marka / işletme hesabım var ama güven algısını güçlendirmek istiyorum",
    ],

    contentStyleOptions: [
      "Ürün / hizmet tanıtımı içerikleri",
      "Reels / Shorts / kısa video ağırlıklı içerikler",
      "Bilgilendirici / eğitici içerikler",
      "Kişisel marka / uzmanlık içerikleri",
      "Kampanya / satış / reklam odaklı içerikler",
      "Hikâye anlatımı / vlog / yaşam tarzı içerikleri",
      "Medya / haber / eğlence içerikleri",
      "Karışık içerik yapısı",
      "Henüz net bir içerik düzenim yok",
    ],

    problemOptions: [
      "Profil ilk bakışta yeterince güven vermiyor",
      "İçerikler dikkat çekmiyor veya ilk saniyede kullanıcıyı tutmuyor",
      "Paylaşımlar düzenli olsa da görünürlük zayıf kalıyor",
      "Takipçi / abone artışı yavaş ilerliyor",
      "İzlenme geliyor ama etkileşim düşük",
      "Etkileşim geliyor ama satış / mesaj / müşteri dönüşümü düşük",
      "Reklam veriyorum ama dönüşler tatmin etmiyor",
      "Marka dili, görsel düzen veya içerik yapısı dağınık duruyor",
      "Hesapta neyin eksik olduğunu bilmiyorum, profesyonel yorum istiyorum",
    ],
  },

  en: {
    selected: "Selected",
    platform: "Platform",
    target: "Goal",
    detail: "Details",
    confirm: "Confirm",

    heroBadge: "Professional Account Analysis",
    heroTitle: "Start Analysis",
    heroDesc:
      "We professionally review why your social media account is not achieving enough growth, trust, or conversion. Profile appearance, content structure, first-second impact, communication style, audience fit, and the path to sales are evaluated together.",

    infoFocusLabel: "Focus",
    infoFocusValue: "Profile, content, trust, and conversion",
    infoProcessLabel: "Process",
    infoProcessValue: "Form is received, team reviews, analysis is prepared",
    infoResultLabel: "Result",
    infoResultValue: "Weak points and improvement areas are shared",

    sideTitle: "What do we review in the analysis?",
    sideItems: [
      "How much trust your profile creates at first glance",
      "Whether your content catches users in the first second",
      "How well your video, visual, and caption language fits your audience",
      "Whether your posting structure is enough for growth",
      "Where users drop off in ads, DM, website, or sales flow",
    ],

    platformEyebrow: "Platform selection",
    platformTitle: "Which platform would you like to analyze?",

    accountTypeEyebrow: "Account type",
    accountTypeTitle: "What is your account used for?",
    accountTypeDesc:
      "Your account may be a business, brand, content page, project, media channel, e-commerce account, or personal brand. Choose the closest structure.",

    goalEyebrow: "What do you expect from the analysis?",
    goalTitle: "What is your main expectation from this analysis?",

    detailEyebrow: "Profile / account link",
    detailTitle: "Let’s understand your account better",
    usernameLabel: "Username or account name",
    usernamePlaceholder: "@username or account name",
    accountLinkLabel: "Profile / account link",
    accountLinkPlaceholder: "https://...",
    currentStatusLabel: "Current status",
    currentStatusPlaceholder: "Select current status",
    contentStyleLabel: "Content structure",
    contentStylePlaceholder: "Select content structure",
    mainProblemLabel: "Main problem area",
    mainProblemPlaceholder: "Select main problem",
    extraNoteLabel: "Extra note",
    extraNotePlaceholder:
      "If there is anything specific you want us to review, write it here.",

    contactEyebrow: "Contact and confirmation",
    contactTitle: "Complete the request and continue to payment",
    contactDesc:
      "After your request is created, you will be redirected to the payment screen. Once payment is completed, your analysis request will be reviewed by the team.",
    summaryPlatform: "Platform",
    summaryAccountType: "Account type",
    summaryGoal: "Expectation",
    contactInfoTitle: "Contact information",
    fullNameLabel: "Full name",
    fullNamePlaceholder: "Your full name",
    contactChannelLabel: "Contact channel",
    contactChannelPlaceholder: "Select contact channel",
    contactValueLabel: "Your contact information",
    contactValuePlaceholder: "+90 5xx..., @username or email",

    paymentInfoLabel: "Payment information",
    currencyTitle: "Choose currency",
    currencyDesc:
      "On the next screen, the analysis request number, selected currency, and payment details will be shown.",
    selectedAmount: "Selected amount",
    privacyConsent:
      "I have read and accept the privacy policy, distance sales agreement, and analysis service information.",
    privacyConsentLink: "View agreements and policies",
    errorPrivacyConsent:
      "You must accept the privacy policy and service confirmation to continue.",

    back: "Back",
    continue: "Continue",
    creating: "Creating analysis...",
    finishAndPay: "Finish Analysis and Continue to Payment",

    errorSelectPlatform: "Please select the platform to analyze.",
    errorAccountTypeGoal:
      "Please select the account type and your expectation from the analysis.",
    errorDetailRequired:
      "Please fill in the account information, current status, content structure, and main problem area.",
    errorFullName: "Full name cannot be empty.",
    errorContact: "Contact channel and contact information are required.",
    errorUsername: "Username or account information is required.",
    errorCreateFailed: "Analysis request could not be created.",
    errorGeneric: "An error occurred while creating the request.",

    notePlatform: "Platform",
    noteAccountType: "Account type",
    noteGoal: "Expected from analysis",
    noteUsername: "Username / account name",
    noteAccountLink: "Account link",
    noteCurrentStatus: "Current status",
    noteContentStyle: "Content structure",
    noteMainProblem: "Main problem",
    noteExtraNote: "Extra note",
    noteCurrency: "Selected currency",
    notePrice: "Analysis price label",

    platforms: [
      {
        key: "instagram",
        title: "Instagram",
        description:
          "Profile trust, Reels structure, content language, DM, and sales conversion are reviewed.",
        icon: FaInstagram,
      },
      {
        key: "tiktok",
        title: "TikTok",
        description:
          "First-second impact, video flow, view potential, and follower conversion are reviewed.",
        icon: FaTiktok,
      },
      {
        key: "youtube",
        title: "YouTube",
        description:
          "Channel appearance, titles, thumbnails, Shorts structure, watch time, and subscriber conversion are reviewed.",
        icon: FaYoutube,
      },
      {
        key: "x",
        title: "X / Twitter",
        description:
          "Profile perception, posting language, visibility, engagement, and referral strength are reviewed.",
        icon: FaXTwitter,
      },
    ],

    accountTypeOptions: [
      {
        value: "Business / Brand Account",
        title: "Business / Brand",
        description:
          "Suitable for accounts that want to build product, service, or brand trust.",
        icon: FaBuilding,
      },
      {
        value: "E-commerce / Sales Account",
        title: "E-commerce / Sales",
        description:
          "For accounts targeting product sales, ad conversion, DM orders, or website traffic.",
      },
      {
        value: "Content Creator / Personal Brand",
        title: "Personal Brand / Creator",
        description:
          "For accounts targeting expertise, visibility, audience growth, and content discipline.",
        icon: FaUserTie,
      },
      {
        value: "Service Provider / Expert Account",
        title: "Expert / Service",
        description:
          "For consulting, clinic, real estate, beauty, agency, education, or professional service accounts.",
      },
      {
        value: "Media / News / Entertainment Channel",
        title: "Media / Channel",
        description:
          "For movie, news, humor, information, content curation, Reels, or Shorts-based pages.",
      },
      {
        value: "Community / Project / Organization",
        title: "Community / Project",
        description:
          "For event, community, organization, club, or project accounts.",
      },
      {
        value: "New Account",
        title: "New Account",
        description:
          "For accounts that need a correct start and solid setup before the structure is fully settled.",
      },
      {
        value: "Other",
        title: "Other",
        description:
          "Choose this if none of the above fits exactly, and explain the details in the note field.",
      },
    ],

    goalOptions: [
      {
        value: "Gain profile trust and professional appearance",
        title: "Profile trust",
        description:
          "I want my account to look stronger, more organized, and more trustworthy at first glance.",
      },
      {
        value: "Get more visibility and reach",
        title: "Visibility",
        description:
          "I want my posts to reach more people and become stronger in discovery or recommended areas.",
      },
      {
        value: "Increase follower, subscriber, or community growth",
        title: "Growth",
        description:
          "I want to grow the account audience in a healthier and more stable way.",
      },
      {
        value: "Improve sales, messages, or customer conversion",
        title: "Conversion",
        description:
          "Views or traffic are coming, but messages, sales, or customer conversion are not enough.",
      },
      {
        value: "Create a content structure and posting strategy",
        title: "Content structure",
        description:
          "I want to clarify what to post, which format to use, and what system to build.",
      },
      {
        value: "Build an account structure that supports ad performance",
        title: "Ad support",
        description:
          "I run ads or plan to run ads; I want to see how ready my account is first.",
      },
      {
        value: "See account weaknesses with professional analysis",
        title: "General analysis",
        description:
          "I want to see weaknesses in profile, content, trust perception, conversion, and growth.",
      },
    ],

    currentStatusOptions: [
      "I have just started and want to set up the account correctly",
      "My account is active but I think it does not look professional",
      "I post regularly but growth is weak",
      "I create content but do not get the visibility I expect",
      "I get views but engagement remains low",
      "I get messages but they do not convert into sales or customers",
      "I run ads but I am not satisfied with the results",
      "I cannot clearly see what is missing in the account",
      "I have a brand / business account and want to strengthen trust perception",
    ],

    contentStyleOptions: [
      "Product / service promotion content",
      "Reels / Shorts / short-video focused content",
      "Informational / educational content",
      "Personal brand / expertise content",
      "Campaign / sales / ad-focused content",
      "Storytelling / vlog / lifestyle content",
      "Media / news / entertainment content",
      "Mixed content structure",
      "I do not have a clear content structure yet",
    ],

    problemOptions: [
      "The profile does not create enough trust at first glance",
      "Content does not catch attention or hold users in the first second",
      "Posts are regular but visibility is weak",
      "Follower / subscriber growth is slow",
      "Views come in but engagement is low",
      "Engagement comes in but sales / messages / customer conversion is low",
      "I run ads but returns are not satisfying",
      "Brand language, visual layout, or content structure looks scattered",
      "I do not know what is missing and want professional feedback",
    ],
  },

  ru: {
    selected: "Выбрано",
    platform: "Платформа",
    target: "Цель",
    detail: "Детали",
    confirm: "Подтверждение",

    heroBadge: "Профессиональный анализ аккаунта",
    heroTitle: "Начать анализ",
    heroDesc:
      "Мы профессионально анализируем, почему ваш аккаунт в социальных сетях не даёт достаточного роста, доверия или конверсии. Внешний вид профиля, структура контента, первые секунды, стиль подачи, соответствие аудитории и путь к продаже оцениваются вместе.",

    infoFocusLabel: "Фокус",
    infoFocusValue: "Профиль, контент, доверие и конверсия",
    infoProcessLabel: "Процесс",
    infoProcessValue: "Форма принимается, команда изучает, анализ готовится",
    infoResultLabel: "Результат",
    infoResultValue: "Передаются слабые места и зоны улучшения",

    sideTitle: "Что мы анализируем?",
    sideItems: [
      "Насколько профиль вызывает доверие с первого взгляда",
      "Захватывает ли контент пользователя в первые секунды",
      "Насколько видео, визуал и текст подходят целевой аудитории",
      "Достаточна ли структура публикаций для роста",
      "Где происходит разрыв в рекламе, DM, сайте или продажах",
    ],

    platformEyebrow: "Выбор платформы",
    platformTitle: "Какую платформу вы хотите проанализировать?",

    accountTypeEyebrow: "Тип аккаунта",
    accountTypeTitle: "Для чего используется ваш аккаунт?",
    accountTypeDesc:
      "Аккаунт может быть бизнесом, брендом, контент-страницей, проектом, медиа-каналом, e-commerce или личным брендом. Выберите наиболее близкий вариант.",

    goalEyebrow: "Что вы ожидаете от анализа?",
    goalTitle: "Какая главная цель этого анализа?",

    detailEyebrow: "Профиль / ссылка на аккаунт",
    detailTitle: "Давайте лучше поймём ваш аккаунт",
    usernameLabel: "Username или название аккаунта",
    usernamePlaceholder: "@username или название аккаунта",
    accountLinkLabel: "Ссылка на профиль / аккаунт",
    accountLinkPlaceholder: "https://...",
    currentStatusLabel: "Текущая ситуация",
    currentStatusPlaceholder: "Выберите текущую ситуацию",
    contentStyleLabel: "Структура контента",
    contentStylePlaceholder: "Выберите структуру контента",
    mainProblemLabel: "Главная проблема",
    mainProblemPlaceholder: "Выберите главную проблему",
    extraNoteLabel: "Дополнительная заметка",
    extraNotePlaceholder:
      "Если есть тема, на которую нужно обратить особое внимание, напишите здесь.",

    contactEyebrow: "Контакты и подтверждение",
    contactTitle: "Завершите заявку и перейдите к оплате",
    contactDesc:
      "После создания заявки вы будете перенаправлены на экран оплаты. После оплаты заявка будет изучена командой.",
    summaryPlatform: "Платформа",
    summaryAccountType: "Тип аккаунта",
    summaryGoal: "Ожидание",
    contactInfoTitle: "Контактная информация",
    fullNameLabel: "Имя и фамилия",
    fullNamePlaceholder: "Ваше имя и фамилия",
    contactChannelLabel: "Канал связи",
    contactChannelPlaceholder: "Выберите канал связи",
    contactValueLabel: "Ваши контактные данные",
    contactValuePlaceholder: "+90 5xx..., @username или e-mail",

    paymentInfoLabel: "Информация об оплате",
    currencyTitle: "Выберите валюту",
    currencyDesc:
      "На следующем экране будет показан номер заявки, выбранная валюта и платёжная информация.",
    selectedAmount: "Выбранная сумма",
    privacyConsent:
      "Я прочитал(а) и принимаю политику конфиденциальности, дистанционный договор продажи и информацию об услуге анализа.",
    privacyConsentLink: "Посмотреть договоры и политики",
    errorPrivacyConsent:
      "Чтобы продолжить, необходимо принять политику конфиденциальности и условия услуги.",

    back: "Назад",
    continue: "Продолжить",
    creating: "Создание анализа...",
    finishAndPay: "Завершить анализ и перейти к оплате",

    errorSelectPlatform: "Пожалуйста, выберите платформу для анализа.",
    errorAccountTypeGoal:
      "Пожалуйста, выберите тип аккаунта и ожидание от анализа.",
    errorDetailRequired:
      "Пожалуйста, заполните данные аккаунта, текущую ситуацию, структуру контента и главную проблему.",
    errorFullName: "Имя и фамилия не могут быть пустыми.",
    errorContact: "Канал связи и контактные данные обязательны.",
    errorUsername: "Username или данные аккаунта обязательны.",
    errorCreateFailed: "Не удалось создать заявку на анализ.",
    errorGeneric: "Произошла ошибка при создании заявки.",

    notePlatform: "Платформа",
    noteAccountType: "Тип аккаунта",
    noteGoal: "Ожидание от анализа",
    noteUsername: "Username / название аккаунта",
    noteAccountLink: "Ссылка на аккаунт",
    noteCurrentStatus: "Текущая ситуация",
    noteContentStyle: "Структура контента",
    noteMainProblem: "Главная проблема",
    noteExtraNote: "Дополнительная заметка",
    noteCurrency: "Выбранная валюта",
    notePrice: "Ценник анализа",

    platforms: [
      {
        key: "instagram",
        title: "Instagram",
        description:
          "Анализируются доверие к профилю, структура Reels, язык контента, DM и конверсия в продажи.",
        icon: FaInstagram,
      },
      {
        key: "tiktok",
        title: "TikTok",
        description:
          "Анализируются первые секунды, поток видео, потенциал просмотров и конверсия в подписчиков.",
        icon: FaTiktok,
      },
      {
        key: "youtube",
        title: "YouTube",
        description:
          "Анализируются вид канала, заголовки, обложки, структура Shorts, время просмотра и конверсия в подписчиков.",
        icon: FaYoutube,
      },
      {
        key: "x",
        title: "X / Twitter",
        description:
          "Анализируются восприятие профиля, язык публикаций, видимость, вовлечённость и сила переходов.",
        icon: FaXTwitter,
      },
    ],

    accountTypeOptions: [
      {
        value: "Бизнес / Брендовый аккаунт",
        title: "Бизнес / Бренд",
        description:
          "Для аккаунтов, которые хотят создать доверие к продукту, услуге или бренду.",
        icon: FaBuilding,
      },
      {
        value: "E-commerce / Продажи",
        title: "E-commerce / Продажи",
        description:
          "Для аккаунтов, ориентированных на продажи, конверсию рекламы, заказы в DM или трафик на сайт.",
      },
      {
        value: "Контент-мейкер / Личный бренд",
        title: "Личный бренд / Creator",
        description:
          "Для аккаунтов, ориентированных на экспертность, видимость, рост аудитории и дисциплину контента.",
        icon: FaUserTie,
      },
      {
        value: "Поставщик услуг / Экспертный аккаунт",
        title: "Эксперт / Услуги",
        description:
          "Для консультаций, клиник, недвижимости, красоты, агентств, образования или профессиональных услуг.",
      },
      {
        value: "Медиа / Новости / Развлекательный канал",
        title: "Медиа / Канал",
        description:
          "Для страниц с фильмами, новостями, юмором, информацией, подборками, Reels или Shorts.",
      },
      {
        value: "Сообщество / Проект / Организация",
        title: "Сообщество / Проект",
        description:
          "Для мероприятий, сообществ, организаций, клубов или проектных аккаунтов.",
      },
      {
        value: "Новый аккаунт",
        title: "Новый аккаунт",
        description:
          "Для аккаунтов, которым нужен правильный старт и крепкая настройка.",
      },
      {
        value: "Другое",
        title: "Другое",
        description:
          "Выберите это, если варианты выше не подходят, и опишите детали в поле заметки.",
      },
    ],

    goalOptions: [
      {
        value: "Получить доверие к профилю и профессиональный внешний вид",
        title: "Доверие к профилю",
        description:
          "Я хочу, чтобы аккаунт с первого взгляда выглядел сильнее, аккуратнее и вызывал больше доверия.",
      },
      {
        value: "Получить больше видимости и охвата",
        title: "Видимость",
        description:
          "Я хочу, чтобы публикации доходили до большего количества людей и усиливались в рекомендациях.",
      },
      {
        value: "Увеличить рост подписчиков, аудитории или сообщества",
        title: "Рост",
        description:
          "Я хочу более здорово и стабильно растить аудиторию аккаунта.",
      },
      {
        value: "Улучшить продажи, сообщения или конверсию клиентов",
        title: "Конверсия",
        description:
          "Просмотры или трафик есть, но сообщений, продаж или клиентов недостаточно.",
      },
      {
        value: "Создать структуру контента и стратегию публикаций",
        title: "Структура контента",
        description:
          "Я хочу понять, что публиковать, в каком формате двигаться и какую систему построить.",
      },
      {
        value: "Создать структуру аккаунта для поддержки рекламы",
        title: "Поддержка рекламы",
        description:
          "Я запускаю рекламу или планирую запуск; сначала хочу понять, насколько аккаунт готов.",
      },
      {
        value: "Увидеть слабые места аккаунта через профессиональный анализ",
        title: "Общий анализ",
        description:
          "Я хочу увидеть слабые места профиля, контента, доверия, конверсии и роста.",
      },
    ],

    currentStatusOptions: [
      "Я только начал(а) и хочу правильно настроить основу аккаунта",
      "Аккаунт активен, но мне кажется, что он выглядит непрофессионально",
      "Я регулярно публикую, но рост идёт слабо",
      "Я создаю контент, но не получаю ожидаемой видимости",
      "Просмотры есть, но вовлечённость низкая",
      "Сообщения приходят, но не превращаются в продажи или клиентов",
      "Я запускаю рекламу, но недоволен(на) результатами",
      "Я не понимаю, чего именно не хватает аккаунту",
      "У меня бренд / бизнес-аккаунт, и я хочу усилить доверие",
    ],

    contentStyleOptions: [
      "Контент с продвижением товаров / услуг",
      "Reels / Shorts / короткие видео",
      "Информационный / образовательный контент",
      "Личный бренд / экспертный контент",
      "Кампании / продажи / рекламный контент",
      "Storytelling / vlog / lifestyle контент",
      "Медиа / новости / развлекательный контент",
      "Смешанная структура контента",
      "У меня пока нет чёткой структуры контента",
    ],

    problemOptions: [
      "Профиль с первого взгляда не вызывает достаточно доверия",
      "Контент не привлекает внимание или не удерживает в первые секунды",
      "Публикации регулярные, но видимость слабая",
      "Рост подписчиков / аудитории идёт медленно",
      "Просмотры есть, но вовлечённость низкая",
      "Вовлечённость есть, но продажи / сообщения / клиенты слабые",
      "Я запускаю рекламу, но результат не удовлетворяет",
      "Язык бренда, визуальная структура или контент выглядят хаотично",
      "Я не знаю, чего не хватает аккаунту, и хочу профессиональный комментарий",
    ],
  },
};

function FieldLabel({
  children,
  required = false,
}: {
  children: ReactNode;
  required?: boolean;
}) {
  return (
    <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.18em] text-white/42 sm:text-[11px] sm:tracking-[0.22em]">
      {children}
      {required && <span className="ml-1 text-white/70">*</span>}
    </label>
  );
}

function PremiumInput({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      type={type}
      className="min-h-[52px] w-full rounded-2xl border border-white/10 bg-white/[0.055] px-4 py-4 text-[15px] font-semibold text-white outline-none placeholder:text-white/30 transition focus:border-white/25 focus:bg-white/[0.075] sm:min-h-[54px] sm:text-sm"
    />
  );
}

function PremiumTextarea({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder: string;
}) {
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={5}
      className="min-h-[150px] w-full resize-none rounded-2xl border border-white/10 bg-white/[0.055] px-4 py-4 text-[15px] font-semibold leading-7 text-white outline-none placeholder:text-white/30 transition focus:border-white/25 focus:bg-white/[0.075] sm:text-sm"
    />
  );
}

function PremiumSelect({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  children: ReactNode;
}) {
  return (
    <select
      value={value}
      onChange={onChange}
      className="min-h-[52px] w-full rounded-2xl border border-white/10 bg-[#111318] px-4 py-4 text-[15px] font-semibold text-white outline-none transition focus:border-white/25 focus:bg-[#151820] sm:min-h-[54px] sm:text-sm"
    >
      {children}
    </select>
  );
}

function ChoiceCard({
  title,
  description,
  active,
  icon: Icon,
  selectedText,
  onClick,
}: {
  title: string;
  description: string;
  active: boolean;
  icon?: IconType;
  selectedText: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative w-full overflow-hidden rounded-[24px] border p-4 text-left transition hover:-translate-y-0.5 sm:rounded-[26px] sm:p-5 ${
        active
          ? "border-white/24 bg-white/[0.095] text-white shadow-[0_18px_40px_rgba(0,0,0,0.32)]"
          : "border-white/10 bg-white/[0.035] text-white hover:border-white/18 hover:bg-white/[0.055]"
      }`}
    >
      <div
        className={`mb-3 flex h-10 w-10 items-center justify-center rounded-2xl border text-base sm:mb-4 sm:h-11 sm:w-11 ${
          active
            ? "border-white/18 bg-black/45 text-white"
            : "border-white/10 bg-black/25 text-white/82"
        }`}
      >
        {Icon ? <Icon /> : <FaCircleQuestion />}
      </div>

      <h4 className="text-base font-black leading-6 sm:text-lg">{title}</h4>

      <p
        className={`mt-2 text-[13px] leading-6 sm:text-sm ${
          active ? "text-white/74" : "text-white/58"
        }`}
      >
        {description}
      </p>

      {active && (
        <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/12 bg-black/45 px-3 py-1 text-xs font-black text-white">
          {selectedText} <FaCheck />
        </div>
      )}
    </button>
  );
}

function StepPill({
  step,
  currentStep,
  label,
}: {
  step: number;
  currentStep: number;
  label: string;
}) {
  const active = currentStep === step;
  const done = currentStep > step;

  return (
    <div
      className={`shrink-0 rounded-full border px-3 py-2 text-[10px] font-black uppercase tracking-[0.11em] transition sm:text-[11px] sm:tracking-[0.14em] ${
        active
          ? "border-white/28 bg-white/[0.12] text-white"
          : done
            ? "border-white/18 bg-white/[0.07] text-white"
            : "border-white/10 bg-white/[0.03] text-white/38"
      }`}
    >
      {step}. {label}
    </div>
  );
}

function MiniInfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[20px] border border-white/10 bg-white/[0.045] p-4 sm:rounded-[22px]">
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/38 sm:text-[11px] sm:tracking-[0.18em]">
        {label}
      </p>
      <p className="mt-2 text-sm font-black leading-6 text-white sm:text-base sm:leading-7">
        {value}
      </p>
    </div>
  );
}

function safeJsonParse<T>(value: string): T | null {
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export default function AnalysisForm() {
  const router = useRouter();
  const formTopRef = useRef<HTMLDivElement | null>(null);

  const [locale, setLocale] = useState<Locale>("tr");
  const [step, setStep] = useState(1);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  const t = useMemo(
    () => analysisFormText[locale] || analysisFormText.tr,
    [locale]
  );

  const platformOptions = t.platforms;
  const accountTypeOptions = t.accountTypeOptions;
  const goalOptions = t.goalOptions;
  const currentStatusOptions = t.currentStatusOptions;
  const contentStyleOptions = t.contentStyleOptions;
  const problemOptions = t.problemOptions;

  const [selectedPlatform, setSelectedPlatform] =
    useState<PlatformKey>("instagram");
  const [accountType, setAccountType] = useState("");
  const [mainGoal, setMainGoal] = useState("");

  const [accountUsername, setAccountUsername] = useState("");
  const [accountLink, setAccountLink] = useState("");
  const [currentStatus, setCurrentStatus] = useState("");
  const [contentStyle, setContentStyle] = useState("");
  const [mainProblem, setMainProblem] = useState("");
  const [extraNote, setExtraNote] = useState("");

  const [fullName, setFullName] = useState("");
  const [contactType, setContactType] = useState<ContactType>("WhatsApp");
  const [contactValue, setContactValue] = useState("");

  const [selectedCurrency, setSelectedCurrency] =
    useState<CurrencyCode>("TL");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setLocale(detectBrowserLocale());

    function handleLocaleChange(event: Event) {
      const customEvent = event as CustomEvent<{ locale?: Locale }>;
      const nextLocale = customEvent.detail?.locale;

      if (nextLocale === "tr" || nextLocale === "en" || nextLocale === "ru") {
        setLocale(nextLocale);
        return;
      }

      setLocale(detectBrowserLocale());
    }

    window.addEventListener("medyatora_locale_change", handleLocaleChange);
    window.addEventListener("medyatora_locale_changed", handleLocaleChange);

    return () => {
      window.removeEventListener("medyatora_locale_change", handleLocaleChange);
      window.removeEventListener("medyatora_locale_changed", handleLocaleChange);
    };
  }, []);

  const selectedPlatformTitle = useMemo(() => {
    return (
      platformOptions.find((platform) => platform.key === selectedPlatform)
        ?.title || "Instagram"
    );
  }, [platformOptions, selectedPlatform]);

  const currentPrice = priceMap[selectedCurrency];

  function scrollToFormTop() {
    window.setTimeout(() => {
      formTopRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 80);
  }

  function nextStep() {
    setError("");

    if (step === 1 && !selectedPlatform) {
      setError(t.errorSelectPlatform);
      return;
    }

    if (step === 2 && (!accountType || !mainGoal)) {
      setError(t.errorAccountTypeGoal);
      return;
    }

    if (
      step === 3 &&
      (!accountUsername.trim() ||
        !currentStatus ||
        !contentStyle ||
        !mainProblem)
    ) {
      setError(t.errorDetailRequired);
      return;
    }

    setStep((prev) => Math.min(prev + 1, 4));
    scrollToFormTop();
  }

  function previousStep() {
    setError("");
    setStep((prev) => Math.max(prev - 1, 1));
    scrollToFormTop();
  }

  async function submitAnalysisAndGoToPayment() {
    setError("");

    if (!fullName.trim()) {
      setError(t.errorFullName);
      return;
    }

    if (!contactType || !contactValue.trim()) {
      setError(t.errorContact);
      return;
    }

    if (!accountUsername.trim()) {
      setError(t.errorUsername);
      return;
    }

    if (!privacyAccepted) {
      setError(t.errorPrivacyConsent);
      return;
    }

    setLoading(true);

    try {
      const analysisNote = [
        `${t.notePlatform}: ${selectedPlatformTitle}`,
        `${t.noteAccountType}: ${accountType}`,
        `${t.noteGoal}: ${mainGoal}`,
        `${t.noteUsername}: ${accountUsername.trim()}`,
        accountLink.trim() ? `${t.noteAccountLink}: ${accountLink.trim()}` : "",
        `${t.noteCurrentStatus}: ${currentStatus}`,
        `${t.noteContentStyle}: ${contentStyle}`,
        `${t.noteMainProblem}: ${mainProblem}`,
        extraNote.trim() ? `${t.noteExtraNote}: ${extraNote.trim()}` : "",
        `${t.noteCurrency}: ${selectedCurrency}`,
        `${t.notePrice}: ${currentPrice}`,
      ]
        .filter(Boolean)
        .join("\n");

      const res = await fetch("/api/analysis-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          full_name: fullName.trim(),
          contact_type: contactType,
          contact_value: contactValue.trim(),

          platform: selectedPlatform,
          account_username: accountUsername.trim(),
          account_link: accountLink.trim(),

          account_type: accountType,
          content_type: contentStyle,
          daily_post_count: currentStatus,
          main_problem: mainProblem,
          main_missing: analysisNote,

          goal: mainGoal,
          extra_note: extraNote.trim(),
          selected_currency: selectedCurrency,
          selected_price: currentPrice,
        }),
      });

      const text = await res.text();
      const data = safeJsonParse<AnalysisRequestResponse>(text);

      if (!res.ok || data?.success === false || data?.ok === false) {
        throw new Error(data?.error || t.errorCreateFailed);
      }

      const requestId =
        data?.requestId ||
        data?.analysisRequestId ||
        data?.analysis_request_id ||
        data?.id ||
        "";

      const isFreeAnalysis =
        data?.isFreeAnalysis === true ||
        data?.freeAnalysisUsed === true ||
        data?.paymentRequired === false;

      if (isFreeAnalysis) {
        router.push("/hesabim");
        return;
      }

      const paymentCurrency = data?.currency || selectedCurrency;
      const paymentPrice =
        data?.formattedPackagePrice ||
        (data?.packagePrice
          ? `${data.packagePrice} ${paymentCurrency}`
          : currentPrice);

      const params = new URLSearchParams({
        source: "analysis",
        currency: paymentCurrency,
        price: paymentPrice,
        platform: selectedPlatformTitle,
      });

      if (requestId) {
        params.set("request_id", String(requestId));
      }

      router.push(`${ANALYSIS_PAYMENT_PATH}?${params.toString()}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errorGeneric);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      ref={formTopRef}
      className="relative -mx-1 scroll-mt-24 overflow-hidden rounded-[28px] border border-white/10 bg-[#080a0d] p-3 shadow-[0_28px_100px_rgba(0,0,0,0.45)] ring-1 ring-white/[0.025] sm:mx-0 sm:rounded-[34px] sm:p-5 md:p-7"
    >
      <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-white/[0.03] blur-[90px]" />
      <div className="pointer-events-none absolute -bottom-40 left-1/4 h-80 w-80 rounded-full bg-white/[0.025] blur-[100px]" />

      <div className="relative">
        <div className="mb-5 flex gap-2 overflow-x-auto rounded-2xl border border-white/10 bg-black/20 p-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mb-6 sm:flex-wrap sm:overflow-visible sm:border-0 sm:bg-transparent sm:p-0">
          <StepPill step={1} currentStep={step} label={t.platform} />
          <StepPill step={2} currentStep={step} label={t.target} />
          <StepPill step={3} currentStep={step} label={t.detail} />
          <StepPill step={4} currentStep={step} label={t.confirm} />
        </div>

        <div className="mb-6 grid gap-4 lg:mb-7 lg:grid-cols-[1fr_0.82fr] lg:gap-5">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-white/72 sm:px-4 sm:text-xs sm:tracking-[0.18em]">
              <span className="h-1.5 w-1.5 rounded-full bg-white/85" />
              {t.heroBadge}
            </div>

            <h2 className="text-[28px] font-black leading-tight tracking-tight text-white sm:text-4xl md:text-5xl">
              {t.heroTitle}
            </h2>

            <p className="mt-3 max-w-3xl text-[13px] leading-6 text-white/64 md:mt-4 md:text-base md:leading-7">
              {t.heroDesc}
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-3 md:mt-6">
              <MiniInfoCard label={t.infoFocusLabel} value={t.infoFocusValue} />
              <MiniInfoCard
                label={t.infoProcessLabel}
                value={t.infoProcessValue}
              />
              <MiniInfoCard label={t.infoResultLabel} value={t.infoResultValue} />
            </div>
          </div>

          <div className="hidden rounded-[28px] border border-white/10 bg-white/[0.045] p-5 lg:block">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-black/25 text-white">
              <FaCircleQuestion />
            </div>

            <h3 className="text-xl font-black text-white">{t.sideTitle}</h3>

            <div className="mt-4 space-y-3 text-sm leading-6 text-white/62">
              {t.sideItems.map((item) => (
                <p key={item}>• {item}</p>
              ))}
            </div>
          </div>
        </div>

        {step === 1 && (
          <>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/42 sm:text-xs sm:tracking-[0.22em]">
              {t.platformEyebrow}
            </p>

            <h3 className="mt-2 text-2xl font-black leading-tight text-white sm:text-3xl">
              {t.platformTitle}
            </h3>

            <div className="mt-5 grid gap-3 sm:mt-6 sm:grid-cols-2 xl:grid-cols-4">
              {platformOptions.map((platform) => (
                <ChoiceCard
                  key={platform.key}
                  title={platform.title}
                  description={platform.description}
                  icon={platform.icon}
                  active={selectedPlatform === platform.key}
                  selectedText={t.selected}
                  onClick={() => setSelectedPlatform(platform.key)}
                />
              ))}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/42 sm:text-xs sm:tracking-[0.22em]">
              {t.accountTypeEyebrow}
            </p>

            <h3 className="mt-2 text-2xl font-black leading-tight text-white sm:text-3xl">
              {t.accountTypeTitle}
            </h3>

            <p className="mt-3 max-w-3xl text-sm leading-7 text-white/60">
              {t.accountTypeDesc}
            </p>

            <div className="mt-5 grid gap-3 sm:mt-6 md:grid-cols-2">
              {accountTypeOptions.map((option) => (
                <ChoiceCard
                  key={option.value}
                  title={option.title}
                  description={option.description}
                  icon={option.icon}
                  active={accountType === option.value}
                  selectedText={t.selected}
                  onClick={() => setAccountType(option.value)}
                />
              ))}
            </div>

            <div className="mt-8">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/42 sm:text-xs sm:tracking-[0.22em]">
                {t.goalEyebrow}
              </p>

              <h3 className="mt-2 text-2xl font-black leading-tight text-white sm:text-3xl">
                {t.goalTitle}
              </h3>

              <div className="mt-5 grid gap-3 sm:mt-6 md:grid-cols-2">
                {goalOptions.map((option) => (
                  <ChoiceCard
                    key={option.value}
                    title={option.title}
                    description={option.description}
                    active={mainGoal === option.value}
                    selectedText={t.selected}
                    onClick={() => setMainGoal(option.value)}
                  />
                ))}
              </div>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/42 sm:text-xs sm:tracking-[0.22em]">
              {t.detailEyebrow}
            </p>

            <h3 className="mt-2 text-2xl font-black leading-tight text-white sm:text-3xl">
              {t.detailTitle}
            </h3>

            <div className="mt-5 grid gap-4 sm:mt-6 md:grid-cols-2">
              <div>
                <FieldLabel required>{t.usernameLabel}</FieldLabel>
                <PremiumInput
                  value={accountUsername}
                  onChange={(e) => setAccountUsername(e.target.value)}
                  placeholder={t.usernamePlaceholder}
                />
              </div>

              <div>
                <FieldLabel>{t.accountLinkLabel}</FieldLabel>
                <PremiumInput
                  value={accountLink}
                  onChange={(e) => setAccountLink(e.target.value)}
                  placeholder={t.accountLinkPlaceholder}
                />
              </div>

              <div>
                <FieldLabel required>{t.currentStatusLabel}</FieldLabel>
                <PremiumSelect
                  value={currentStatus}
                  onChange={(e) => setCurrentStatus(e.target.value)}
                >
                  <option value="">{t.currentStatusPlaceholder}</option>
                  {currentStatusOptions.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </PremiumSelect>
              </div>

              <div>
                <FieldLabel required>{t.contentStyleLabel}</FieldLabel>
                <PremiumSelect
                  value={contentStyle}
                  onChange={(e) => setContentStyle(e.target.value)}
                >
                  <option value="">{t.contentStylePlaceholder}</option>
                  {contentStyleOptions.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </PremiumSelect>
              </div>

              <div className="md:col-span-2">
                <FieldLabel required>{t.mainProblemLabel}</FieldLabel>
                <PremiumSelect
                  value={mainProblem}
                  onChange={(e) => setMainProblem(e.target.value)}
                >
                  <option value="">{t.mainProblemPlaceholder}</option>
                  {problemOptions.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </PremiumSelect>
              </div>

              <div className="md:col-span-2">
                <FieldLabel>{t.extraNoteLabel}</FieldLabel>
                <PremiumTextarea
                  value={extraNote}
                  onChange={(e) => setExtraNote(e.target.value)}
                  placeholder={t.extraNotePlaceholder}
                />
              </div>
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/42 sm:text-xs sm:tracking-[0.22em]">
              {t.contactEyebrow}
            </p>

            <h3 className="mt-2 text-2xl font-black leading-tight text-white sm:text-3xl">
              {t.contactTitle}
            </h3>

            <p className="mt-3 max-w-3xl text-sm leading-7 text-white/62">
              {t.contactDesc}
            </p>

            <div className="mt-5 grid gap-3 sm:mt-6 md:grid-cols-3">
              <MiniInfoCard label={t.summaryPlatform} value={selectedPlatformTitle} />
              <MiniInfoCard label={t.summaryAccountType} value={accountType || "-"} />
              <MiniInfoCard label={t.summaryGoal} value={mainGoal || "-"} />
            </div>

            <div className="mt-6 rounded-[26px] border border-white/10 bg-black/20 p-4 sm:rounded-[28px] sm:p-5">
              <h4 className="text-xl font-black text-white sm:text-2xl">
                {t.contactInfoTitle}
              </h4>

              <div className="mt-5 grid gap-4 lg:grid-cols-3">
                <div>
                  <FieldLabel required>{t.fullNameLabel}</FieldLabel>
                  <PremiumInput
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={t.fullNamePlaceholder}
                  />
                </div>

                <div>
                  <FieldLabel required>{t.contactChannelLabel}</FieldLabel>
                  <PremiumSelect
                    value={contactType}
                    onChange={(e) =>
                      setContactType(e.target.value as ContactType)
                    }
                  >
                    <option value="">{t.contactChannelPlaceholder}</option>
                    {contactTypes.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </PremiumSelect>
                </div>

                <div>
                  <FieldLabel required>{t.contactValueLabel}</FieldLabel>
                  <PremiumInput
                    value={contactValue}
                    onChange={(e) => setContactValue(e.target.value)}
                    placeholder={t.contactValuePlaceholder}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-[26px] border border-white/10 bg-white/[0.035] p-4 sm:rounded-[28px] sm:p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/38 sm:text-xs">
                    {t.paymentInfoLabel}
                  </p>

                  <h4 className="mt-2 text-xl font-black text-white sm:text-2xl">
                    {t.currencyTitle}
                  </h4>

                  <p className="mt-2 max-w-2xl text-sm leading-7 text-white/60">
                    {t.currencyDesc}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/25 px-5 py-4">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-white/38">
                    {t.selectedAmount}
                  </p>
                  <p className="mt-1 text-xl font-black text-white">
                    {currentPrice}
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {(["TL", "USD", "RUB"] as CurrencyCode[]).map((currency) => {
                  const active = selectedCurrency === currency;

                  return (
                    <button
                      key={currency}
                      type="button"
                      onClick={() => setSelectedCurrency(currency)}
                      className={`rounded-2xl border px-4 py-3 text-sm font-black transition ${
                        active
                          ? "border-white/28 bg-white/[0.13] text-white"
                          : "border-white/10 bg-white/[0.035] text-white/72 hover:border-white/18 hover:bg-white/[0.055]"
                      }`}
                    >
                      {priceMap[currency]}
                    </button>
                  );
                })}
              </div>

              <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 bg-black/25 p-4 transition hover:bg-white/[0.045]">
                <input
                  type="checkbox"
                  checked={privacyAccepted}
                  onChange={(event) => setPrivacyAccepted(event.target.checked)}
                  className="mt-1 h-4 w-4 shrink-0 accent-white"
                />

                <span className="text-sm leading-6 text-white/65">
                  {t.privacyConsent}{" "}
                  <a
                    href="/mesafeli-satis-sozlesmesi"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-white underline underline-offset-4 hover:text-white/80"
                    onClick={(event) => event.stopPropagation()}
                  >
                    {t.privacyConsentLink}
                  </a>
                </span>
              </label>
            </div>
          </>
        )}

        {error && (
          <div className="mt-6 rounded-2xl border border-[#6b2232] bg-[#31101b]/70 px-4 py-3 text-sm font-semibold text-[#f2c7d1]">
            {error}
          </div>
        )}

        <div className="sticky bottom-3 z-20 mt-8 grid gap-3 rounded-3xl border border-white/10 bg-[#080a0d]/95 p-3 shadow-[0_18px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:static sm:flex sm:flex-row sm:items-center sm:justify-between sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none sm:backdrop-blur-0">
          <button
            type="button"
            onClick={previousStep}
            disabled={step === 1 || loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3.5 text-sm font-black text-white transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
          >
            <FaArrowLeft />
            {t.back}
          </button>

          {step < 4 ? (
            <button
              type="button"
              onClick={nextStep}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white/[0.92] px-6 py-3.5 text-sm font-black text-black transition hover:bg-white sm:w-auto"
            >
              {t.continue}
              <FaArrowRight />
            </button>
          ) : (
            <button
              type="button"
              onClick={submitAnalysisAndGoToPayment}
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white/[0.92] px-6 py-3.5 text-sm font-black text-black transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {loading ? t.creating : t.finishAndPay}
              {loading ? <FaPaperPlane /> : <FaCheck />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}