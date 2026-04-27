export type Locale = "tr" | "en" | "ru";

type Dictionary = {
  newOrder: string;
  newOrderDesc: string;
  currency: string;
  selectPlatform: string;
  category: string;
  products: string;
  orderInfo: string;
  productDescription: string;
  quantity: string;
  fullName: string;
  contact: string;
  totalSalePrice: string;
  createOrder: string;
  sending: string;
  servicesLoading: string;
  productsLoading: string;
  noCategoryFound: string;
  noProductsFound: string;
  selectProductFirst: string;
  minMax: string;
  speed: string;
  serviceNo: string;
  per1000: string;
  up: string;
  down: string;
  successOrder: string;
  addToCart: string;
  goToCart: string;
  cart: string;
  cartEmpty: string;
  remove: string;
  edit: string;
  buyNow: string;
  bulkBuy: string;
  targetUsername: string;
  targetLink: string;
  orderNote: string;
  cartSaleTotal: string;
  cartCostTotal: string;
  orderNumber: string;
  batchCode: string;

  smmHeroBadge: string;
  smmHeroTitle: string;
  smmHeroDesc: string;
  smmTaxIncluded: string;
  smmOrderTracking: string;
  smmSupport: string;
  smmDataUse: string;

  language: string;
  platformSelection: string;
  platformSelectionDesc: string;
  platformLoading: string;
  noActivePlatform: string;
  singleServices: string;
  selected: string;
  showMorePlatforms: string;
  showLessPlatforms: string;
  moreCount: string;

  categorySelection: string;
  noActiveServiceForPlatform: string;

  serviceListTitle: string;
  serviceListDesc: string;
  filter: string;
  servicesShown: string;
  searchPlaceholder: string;
  searchResultText: string;
  quality: string;
  guarantee: string;
  region: string;
  sort: string;
  all: string;
  coreQuality: string;
  plusQuality: string;
  primeQuality: string;
  guaranteed: string;
  noGuarantee: string;
  recommendedSort: string;
  priceAsc: string;
  priceDesc: string;
  clearFilters: string;

  serviceInfo: string;
  beforeOrder: string;
  importantNotes: string;
  serviceInfoP1: string;
  serviceInfoP2: string;
  serviceInfoP3: string;
  beforeOrderP1: string;
  beforeOrderP2: string;
  note1: string;
  note2: string;
  note3: string;
  note4: string;

  orderBeforeBadge: string;
  orderBeforeTitle: string;
  orderBeforeDesc: string;
  noticePriceTitle: string;
  noticePriceText: string;
  noticeProfileTitle: string;
  noticeProfileText: string;
  noticeStartTitle: string;
  noticeStartText: string;
  noticeSupportTitle: string;
  noticeSupportText: string;

  checkoutTitle: string;
  checkoutDesc: string;
  close: string;
  phoneNumber: string;
  contactTypeSelect: string;
  contactValue: string;
  contactWarning1: string;
  contactWarning2: string;
  paymentMethod: string;
  paymentMethodDesc: string;
  turkeyBankTransfer: string;
  turkeyBankTransferDesc: string;
  otherPaymentMethods: string;
  otherPaymentMethodsDesc: string;
  turkeyBankInfo: string;
  receiverName: string;
  iban: string;
  paymentDescription: string;
  digitalServiceOrderNo: string;
  receiptInfo: string;
  otherPaymentInfoText: string;
  servicesToConfirm: string;
  confirmPurchase: string;

  orderConfirmedTitle: string;
  orderConfirmedDesc: string;
  yourOrderNumber: string;
  paymentStepTitle: string;
  paymentStepDesc: string;
  telegramPaymentInfo: string;
  whatsappPaymentInfo: string;
  ok: string;

  cartTotal: string;
  cartTotalDesc: string;

  minQuantityText: string;
};

export const dictionaries: Record<Locale, Dictionary> = {
  tr: {
    newOrder: "Yeni Sipariş",
    newOrderDesc: "Platform seç, ürün detaylarını gir ve tekli veya toplu sipariş oluştur.",
    currency: "Para Birimi",
    selectPlatform: "Platform Seç",
    category: "Kategori",
    products: "Ürünler",
    orderInfo: "Sipariş Bilgileri",
    productDescription: "Ürün Açıklaması",
    quantity: "Miktar",
    fullName: "Ad Soyad",
    contact: "İletişim bilgisi",
    totalSalePrice: "Toplam Satış Fiyatı",
    createOrder: "Sipariş Oluştur",
    sending: "Gönderiliyor...",
    servicesLoading: "Servisler yükleniyor...",
    productsLoading: "Ürünler yükleniyor...",
    noCategoryFound: "Bu platform için henüz kategori bulunamadı.",
    noProductsFound: "Bu kategori için henüz ürün yok.",
    selectProductFirst: "Önce bir ürün seç.",
    minMax: "Min",
    speed: "Hız",
    serviceNo: "Servis No",
    per1000: "1000 adet",
    up: "↑ Yukarı",
    down: "↓ Aşağı",
    successOrder: "Sipariş başarıyla oluşturuldu.",
    addToCart: "Sepete Ekle",
    goToCart: "Sepete Git",
    cart: "Sepet",
    cartEmpty: "Sepet henüz boş.",
    remove: "Sil",
    edit: "Düzenle",
    buyNow: "Satın Al",
    bulkBuy: "Toplu Satın Al",
    targetUsername: "Hedef kullanıcı adı",
    targetLink: "Hedef link",
    orderNote: "Sipariş notu",
    cartSaleTotal: "Sepet Satış Toplamı",
    cartCostTotal: "Sepet Alış Toplamı",
    orderNumber: "Sipariş No",
    batchCode: "Batch Kodu",

    smmHeroBadge: "SMMTora tekli sosyal medya hizmetleri",
    smmHeroTitle: "Tekli Sosyal Medya Hizmetleri",
    smmHeroDesc:
      "Platform, kategori ve hizmet seçerek tekli sipariş oluşturabilirsiniz. Takipçi, beğeni, izlenme, yorum ve diğer sosyal medya destekleri burada listelenir.",
    smmTaxIncluded: "KDV + vergiler dahil",
    smmOrderTracking: "Sipariş numarası ile takip",
    smmSupport: "WhatsApp / Telegram destek",
    smmDataUse: "Bilgiler işlem için kullanılır",

    language: "Dil",
    platformSelection: "Platform seçimi",
    platformSelectionDesc: "Satışa açık platformlardan birini seçin.",
    platformLoading: "Platformlar yükleniyor...",
    noActivePlatform: "Şu anda aktif satışa açık platform bulunmamaktadır.",
    singleServices: "Tekli hizmetler",
    selected: "Seçili",
    showMorePlatforms: "Tüm Platformları Göster",
    showLessPlatforms: "Daha Az Platform Göster",
    moreCount: "daha",

    categorySelection: "Kategori seçimi",
    noActiveServiceForPlatform: "Bu platformda aktif satışa açık hizmet bulunmamaktadır.",

    serviceListTitle: "Hizmetler",
    serviceListDesc: "Ürün kodu, panel ID veya hizmet adıyla arama yapabilirsiniz.",
    filter: "Filtrele",
    servicesShown: "hizmet gösteriliyor",
    searchPlaceholder: "Ürün kodu, panel ID veya hizmet adı ara... Örn: 9059",
    searchResultText: "sonuç",
    quality: "Kalite",
    guarantee: "Garanti",
    region: "Bölge",
    sort: "Sıralama",
    all: "Tümü",
    coreQuality: "Core Kalite",
    plusQuality: "Plus Kalite",
    primeQuality: "Prime Kalite",
    guaranteed: "Garantili",
    noGuarantee: "Garantisiz",
    recommendedSort: "Önerilen Sıralama",
    priceAsc: "Fiyat Artan",
    priceDesc: "Fiyat Azalan",
    clearFilters: "Filtreleri Temizle",

    serviceInfo: "Hizmet Bilgisi",
    beforeOrder: "Sipariş Öncesi",
    importantNotes: "Önemli Notlar",
    serviceInfoP1:
      "Satın alacağınız hizmet, seçtiğiniz platform ve kategoriye göre işleme alınır. Her hizmet için minimum ve maksimum sipariş limiti vardır.",
    serviceInfoP2:
      "Garantili hizmetlerde belirtilen süre içinde destek sağlanır. Garantisiz hizmetlerde teslimat sonrası ek koruma bulunmaz.",
    serviceInfoP3: "Sipariş yoğunluğa bağlı olarak genellikle 0-24 saat içerisinde başlar.",
    beforeOrderP1:
      "Kullanıcı adı, bağlantı ve miktar bilgilerini dikkatli giriniz. Yanlış bilgi girilmesi siparişin gecikmesine veya başlatılamamasına neden olabilir.",
    beforeOrderP2:
      "Link isteyen hizmetlerde doğru profil, gönderi, video, kanal veya grup bağlantısı verilmesi gerekir.",
    note1: "• Siparişten sonra kullanıcı adı veya bağlantıyı değiştirmemeniz önerilir.",
    note2: "• Aynı hedefe aynı anda birden fazla benzer sipariş verilmesi önerilmez.",
    note3: "• Profilin veya içeriğin erişilebilir olması gerekir.",
    note4: "• Destek talebinde bulunurken sipariş numaranız ile yazınız.",

    orderBeforeBadge: "MedyaTora Bilgilendirme Sistemi",
    orderBeforeTitle: "Sipariş Öncesi Önemli Bilgilendirme",
    orderBeforeDesc:
      "Sipariş oluşturmadan önce hedef hesabın, bağlantının ve miktarın doğru olduğundan emin olun.",
    noticePriceTitle: "Fiyat Bilgisi",
    noticePriceText:
      "Tüm fiyatlara KDV + vergiler dahildir. Gördüğünüz tutar nihai ödeme tutarıdır.",
    noticeProfileTitle: "Profil Durumu",
    noticeProfileText:
      "İşlem yapılacak profil, gönderi, video veya kanal herkese açık olmalıdır.",
    noticeStartTitle: "Başlangıç Süresi",
    noticeStartText:
      "Başlangıç süresi servise göre değişebilir. Genellikle işlemler 0-24 saat içinde başlar.",
    noticeSupportTitle: "Destek",
    noticeSupportText:
      "Ödeme sonrası dekontu WhatsApp veya Telegram üzerinden iletebilirsiniz.",

    checkoutTitle: "İletişim ve Onay",
    checkoutDesc: "Siparişinizi onaylamak için aşağıdaki alanları eksiksiz doldurunuz.",
    close: "Kapat",
    phoneNumber: "Telefon Numarası",
    contactTypeSelect: "İletişim Türü Seç",
    contactValue: "İletişim Bilgisi",
    contactWarning1: "Lütfen yalnızca WhatsApp, Instagram, Telegram veya E-posta bilgisi giriniz.",
    contactWarning2: "Önerilen iletişim yöntemi Telegram’dır.",
    paymentMethod: "Ödeme Yöntemi",
    paymentMethodDesc: "Siparişinizi onaylamadan önce ödeme yöntemi seçiniz.",
    turkeyBankTransfer: "Türkiye Banka Havalesi / EFT",
    turkeyBankTransferDesc: "Türkiye içi ödemeler için banka hesabı bilgileri gösterilir.",
    otherPaymentMethods: "Diğer Ödeme Yöntemleri",
    otherPaymentMethodsDesc: "Aktif ödeme yöntemi görülmemektedir. Lütfen destek ile iletişime geçiniz.",
    turkeyBankInfo: "Türkiye Banka Bilgileri",
    receiverName: "Alıcı Adı",
    iban: "IBAN",
    paymentDescription: "Açıklama",
    digitalServiceOrderNo: "Dijital Hizmet - Sipariş No",
    receiptInfo:
      "Ödeme sonrası dekontu Telegram veya WhatsApp üzerinden sipariş numaranızla birlikte iletiniz.",
    otherPaymentInfoText:
      "Ödeme bilgisi almak için lütfen Telegram veya WhatsApp üzerinden destek ile iletişime geçiniz.",
    servicesToConfirm: "Onaylanacak Hizmet Sayısı",
    confirmPurchase: "Alımı Onayla",

    orderConfirmedTitle: "Siparişiniz Onaylandı",
    orderConfirmedDesc:
      "Siparişiniz başarıyla oluşturuldu. Aşağıdaki sipariş numarası veya numaraları ile bize ulaşabilirsiniz.",
    yourOrderNumber: "Sipariş Numaranız",
    paymentStepTitle: "Ödeme ve işlem adımı için bize yazın",
    paymentStepDesc:
      "Sipariş numaranız otomatik mesajın içine eklenecek. Ödeme ve işlem adımları için Telegram veya WhatsApp üzerinden bize ulaşabilirsiniz.",
    telegramPaymentInfo: "Telegram’dan Ödeme Bilgisi Al",
    whatsappPaymentInfo: "WhatsApp’tan Ödeme Bilgisi Al",
    ok: "Tamam",

    cartTotal: "Sepet Toplamı",
    cartTotalDesc:
      "Tüm fiyatlara KDV + vergiler dahildir. Ödeme sonrası sipariş numaranız ile destek alabilirsiniz.",

    minQuantityText: "Bu hizmet için minimum {min}, maksimum {max} adet sipariş verilebilir.",
  },

  en: {
    newOrder: "New Order",
    newOrderDesc: "Choose a platform, enter service details, and create single or bulk orders.",
    currency: "Currency",
    selectPlatform: "Select Platform",
    category: "Category",
    products: "Services",
    orderInfo: "Order Details",
    productDescription: "Service Description",
    quantity: "Quantity",
    fullName: "Full Name",
    contact: "Contact information",
    totalSalePrice: "Total Price",
    createOrder: "Create Order",
    sending: "Sending...",
    servicesLoading: "Loading services...",
    productsLoading: "Loading services...",
    noCategoryFound: "No category found for this platform yet.",
    noProductsFound: "No services found for this category yet.",
    selectProductFirst: "Select a service first.",
    minMax: "Min",
    speed: "Speed",
    serviceNo: "Service No",
    per1000: "per 1000",
    up: "↑ Up",
    down: "↓ Down",
    successOrder: "Order created successfully.",
    addToCart: "Add to Cart",
    goToCart: "Go to Cart",
    cart: "Cart",
    cartEmpty: "Your cart is empty.",
    remove: "Remove",
    edit: "Edit",
    buyNow: "Buy Now",
    bulkBuy: "Checkout Cart",
    targetUsername: "Target username",
    targetLink: "Target link",
    orderNote: "Order note",
    cartSaleTotal: "Cart Total",
    cartCostTotal: "Cart Cost Total",
    orderNumber: "Order No",
    batchCode: "Batch Code",

    smmHeroBadge: "SMMTora single social media services",
    smmHeroTitle: "Single Social Media Services",
    smmHeroDesc:
      "Choose a platform, category, and service to create a single order. Followers, likes, views, comments, and other social media support services are listed here.",
    smmTaxIncluded: "VAT + taxes included",
    smmOrderTracking: "Track with order number",
    smmSupport: "WhatsApp / Telegram support",
    smmDataUse: "Information is used for processing only",

    language: "Language",
    platformSelection: "Platform selection",
    platformSelectionDesc: "Choose one of the available platforms.",
    platformLoading: "Loading platforms...",
    noActivePlatform: "There are currently no active platforms available for sale.",
    singleServices: "Single services",
    selected: "Selected",
    showMorePlatforms: "Show All Platforms",
    showLessPlatforms: "Show Fewer Platforms",
    moreCount: "more",

    categorySelection: "Category selection",
    noActiveServiceForPlatform: "There are currently no active services for this platform.",

    serviceListTitle: "Services",
    serviceListDesc: "Search by service code, panel ID, or service name.",
    filter: "Filter",
    servicesShown: "services shown",
    searchPlaceholder: "Search service code, panel ID, or service name... Example: 9059",
    searchResultText: "results",
    quality: "Quality",
    guarantee: "Guarantee",
    region: "Region",
    sort: "Sort",
    all: "All",
    coreQuality: "Core Quality",
    plusQuality: "Plus Quality",
    primeQuality: "Prime Quality",
    guaranteed: "Guaranteed",
    noGuarantee: "No guarantee",
    recommendedSort: "Recommended Sort",
    priceAsc: "Price Low to High",
    priceDesc: "Price High to Low",
    clearFilters: "Clear Filters",

    serviceInfo: "Service Info",
    beforeOrder: "Before Order",
    importantNotes: "Important Notes",
    serviceInfoP1:
      "The service you purchase is processed according to the selected platform and category. Each service has minimum and maximum order limits.",
    serviceInfoP2:
      "For guaranteed services, support is provided within the specified guarantee period. Non-guaranteed services do not include extra protection after delivery.",
    serviceInfoP3: "Orders usually start within 0-24 hours depending on service load.",
    beforeOrderP1:
      "Please enter the username, link, and quantity carefully. Incorrect information may delay or prevent the order from starting.",
    beforeOrderP2:
      "For services that require a link, the correct profile, post, video, channel, or group link must be provided.",
    note1: "• It is recommended not to change the username or link after placing the order.",
    note2: "• Avoid placing multiple similar orders for the same target at the same time.",
    note3: "• The profile or content must be accessible.",
    note4: "• Please include your order number when requesting support.",

    orderBeforeBadge: "MedyaTora Information System",
    orderBeforeTitle: "Important Information Before Ordering",
    orderBeforeDesc:
      "Before creating an order, make sure the target account, link, and quantity are correct.",
    noticePriceTitle: "Price Information",
    noticePriceText:
      "All prices include VAT + taxes. The amount shown is the final payment amount.",
    noticeProfileTitle: "Profile Status",
    noticeProfileText:
      "The target profile, post, video, or channel must be public and accessible.",
    noticeStartTitle: "Start Time",
    noticeStartText:
      "Start time may vary by service. Orders usually start within 0-24 hours.",
    noticeSupportTitle: "Support",
    noticeSupportText:
      "After payment, you can send your receipt via WhatsApp or Telegram.",

    checkoutTitle: "Contact and Confirmation",
    checkoutDesc: "Fill in the fields below completely to confirm your order.",
    close: "Close",
    phoneNumber: "Phone Number",
    contactTypeSelect: "Select Contact Type",
    contactValue: "Contact Information",
    contactWarning1: "Please enter only WhatsApp, Instagram, Telegram, or email information.",
    contactWarning2: "Telegram is the recommended contact method.",
    paymentMethod: "Payment Method",
    paymentMethodDesc: "Please select a payment method before confirming your order.",
    turkeyBankTransfer: "Turkey Bank Transfer / EFT",
    turkeyBankTransferDesc: "Bank account details are shown for payments within Turkey.",
    otherPaymentMethods: "Other Payment Methods",
    otherPaymentMethodsDesc: "No active payment method is visible. Please contact support.",
    turkeyBankInfo: "Turkey Bank Details",
    receiverName: "Receiver Name",
    iban: "IBAN",
    paymentDescription: "Description",
    digitalServiceOrderNo: "Digital Service - Order No",
    receiptInfo:
      "After payment, please send your receipt via Telegram or WhatsApp together with your order number.",
    otherPaymentInfoText:
      "To get payment information, please contact support via Telegram or WhatsApp.",
    servicesToConfirm: "Number of Services to Confirm",
    confirmPurchase: "Confirm Purchase",

    orderConfirmedTitle: "Your Order Has Been Confirmed",
    orderConfirmedDesc:
      "Your order has been created successfully. You can contact us with the order number or numbers below.",
    yourOrderNumber: "Your Order Number",
    paymentStepTitle: "Message us for payment and processing steps",
    paymentStepDesc:
      "Your order number will be added to the automatic message. You can contact us via Telegram or WhatsApp for payment and processing steps.",
    telegramPaymentInfo: "Get Payment Info on Telegram",
    whatsappPaymentInfo: "Get Payment Info on WhatsApp",
    ok: "OK",

    cartTotal: "Cart Total",
    cartTotalDesc:
      "All prices include VAT + taxes. You can receive support with your order number after payment.",

    minQuantityText: "For this service, the minimum is {min} and the maximum is {max}.",
  },

  ru: {
    newOrder: "Новый заказ",
    newOrderDesc: "Выберите платформу, укажите данные услуги и оформите один или несколько заказов.",
    currency: "Валюта",
    selectPlatform: "Выберите платформу",
    category: "Категория",
    products: "Услуги",
    orderInfo: "Детали заказа",
    productDescription: "Описание услуги",
    quantity: "Количество",
    fullName: "Имя и фамилия",
    contact: "Контактная информация",
    totalSalePrice: "Итоговая цена",
    createOrder: "Оформить заказ",
    sending: "Отправка...",
    servicesLoading: "Загрузка услуг...",
    productsLoading: "Загрузка услуг...",
    noCategoryFound: "Для этой платформы пока нет категорий.",
    noProductsFound: "Для этой категории пока нет услуг.",
    selectProductFirst: "Сначала выберите услугу.",
    minMax: "Мин",
    speed: "Скорость",
    serviceNo: "№ услуги",
    per1000: "за 1000",
    up: "↑ Вверх",
    down: "↓ Вниз",
    successOrder: "Заказ успешно создан.",
    addToCart: "В корзину",
    goToCart: "К корзине",
    cart: "Корзина",
    cartEmpty: "Корзина пуста.",
    remove: "Удалить",
    edit: "Изменить",
    buyNow: "Купить сейчас",
    bulkBuy: "Оформить корзину",
    targetUsername: "Целевой username",
    targetLink: "Целевая ссылка",
    orderNote: "Примечание к заказу",
    cartSaleTotal: "Итог корзины",
    cartCostTotal: "Себестоимость корзины",
    orderNumber: "№ заказа",
    batchCode: "Batch код",

    smmHeroBadge: "SMMTora — отдельные услуги для социальных сетей",
    smmHeroTitle: "Отдельные услуги для социальных сетей",
    smmHeroDesc:
      "Выберите платформу, категорию и услугу, чтобы оформить отдельный заказ. Подписчики, лайки, просмотры, комментарии и другие услуги поддержки социальных сетей доступны здесь.",
    smmTaxIncluded: "НДС + налоги включены",
    smmOrderTracking: "Отслеживание по номеру заказа",
    smmSupport: "Поддержка WhatsApp / Telegram",
    smmDataUse: "Данные используются только для обработки",

    language: "Язык",
    platformSelection: "Выбор платформы",
    platformSelectionDesc: "Выберите одну из доступных платформ.",
    platformLoading: "Загрузка платформ...",
    noActivePlatform: "Сейчас нет активных платформ, доступных для заказа.",
    singleServices: "Отдельные услуги",
    selected: "Выбрано",
    showMorePlatforms: "Показать все платформы",
    showLessPlatforms: "Показать меньше платформ",
    moreCount: "ещё",

    categorySelection: "Выбор категории",
    noActiveServiceForPlatform: "Для этой платформы сейчас нет активных услуг.",

    serviceListTitle: "Услуги",
    serviceListDesc: "Поиск по коду услуги, panel ID или названию услуги.",
    filter: "Фильтр",
    servicesShown: "услуг показано",
    searchPlaceholder: "Поиск по коду услуги, panel ID или названию... Например: 9059",
    searchResultText: "результатов",
    quality: "Качество",
    guarantee: "Гарантия",
    region: "Регион",
    sort: "Сортировка",
    all: "Все",
    coreQuality: "Core качество",
    plusQuality: "Plus качество",
    primeQuality: "Prime качество",
    guaranteed: "С гарантией",
    noGuarantee: "Без гарантии",
    recommendedSort: "Рекомендуемая сортировка",
    priceAsc: "Цена по возрастанию",
    priceDesc: "Цена по убыванию",
    clearFilters: "Очистить фильтры",

    serviceInfo: "Информация об услуге",
    beforeOrder: "Перед заказом",
    importantNotes: "Важные заметки",
    serviceInfoP1:
      "Покупаемая услуга обрабатывается в соответствии с выбранной платформой и категорией. У каждой услуги есть минимальный и максимальный лимит заказа.",
    serviceInfoP2:
      "Для услуг с гарантией поддержка предоставляется в течение указанного гарантийного срока. Для услуг без гарантии дополнительная защита после выполнения не предусмотрена.",
    serviceInfoP3: "Обычно заказы запускаются в течение 0-24 часов в зависимости от нагрузки.",
    beforeOrderP1:
      "Внимательно укажите username, ссылку и количество. Неверные данные могут задержать запуск заказа или сделать его невозможным.",
    beforeOrderP2:
      "Для услуг, где требуется ссылка, необходимо указать правильную ссылку на профиль, пост, видео, канал или группу.",
    note1: "• После оформления заказа рекомендуется не менять username или ссылку.",
    note2: "• Не рекомендуется одновременно оформлять несколько похожих заказов на одну и ту же цель.",
    note3: "• Профиль или контент должен быть доступен.",
    note4: "• При обращении в поддержку указывайте номер заказа.",

    orderBeforeBadge: "Информационная система MedyaTora",
    orderBeforeTitle: "Важная информация перед заказом",
    orderBeforeDesc:
      "Перед созданием заказа убедитесь, что аккаунт, ссылка и количество указаны правильно.",
    noticePriceTitle: "Информация о цене",
    noticePriceText:
      "Все цены включают НДС + налоги. Указанная сумма является окончательной суммой оплаты.",
    noticeProfileTitle: "Статус профиля",
    noticeProfileText:
      "Целевой профиль, пост, видео или канал должны быть открытыми и доступными.",
    noticeStartTitle: "Время запуска",
    noticeStartText:
      "Время запуска зависит от услуги. Обычно заказы запускаются в течение 0-24 часов.",
    noticeSupportTitle: "Поддержка",
    noticeSupportText:
      "После оплаты вы можете отправить чек через WhatsApp или Telegram.",

    checkoutTitle: "Контакты и подтверждение",
    checkoutDesc: "Заполните поля ниже, чтобы подтвердить заказ.",
    close: "Закрыть",
    phoneNumber: "Номер телефона",
    contactTypeSelect: "Выберите тип связи",
    contactValue: "Контактные данные",
    contactWarning1: "Укажите только WhatsApp, Instagram, Telegram или e-mail.",
    contactWarning2: "Рекомендуемый способ связи — Telegram.",
    paymentMethod: "Способ оплаты",
    paymentMethodDesc: "Выберите способ оплаты перед подтверждением заказа.",
    turkeyBankTransfer: "Банковский перевод / EFT в Турции",
    turkeyBankTransferDesc: "Для оплат внутри Турции показываются банковские реквизиты.",
    otherPaymentMethods: "Другие способы оплаты",
    otherPaymentMethodsDesc: "Активный способ оплаты не отображается. Свяжитесь с поддержкой.",
    turkeyBankInfo: "Банковские реквизиты в Турции",
    receiverName: "Получатель",
    iban: "IBAN",
    paymentDescription: "Описание",
    digitalServiceOrderNo: "Digital Service - Order No",
    receiptInfo:
      "После оплаты отправьте чек через Telegram или WhatsApp вместе с номером заказа.",
    otherPaymentInfoText:
      "Чтобы получить информацию об оплате, свяжитесь с поддержкой через Telegram или WhatsApp.",
    servicesToConfirm: "Количество услуг для подтверждения",
    confirmPurchase: "Подтвердить покупку",

    orderConfirmedTitle: "Ваш заказ подтверждён",
    orderConfirmedDesc:
      "Ваш заказ успешно создан. Вы можете связаться с нами, используя номер или номера заказа ниже.",
    yourOrderNumber: "Ваш номер заказа",
    paymentStepTitle: "Напишите нам для оплаты и дальнейших шагов",
    paymentStepDesc:
      "Номер заказа будет автоматически добавлен в сообщение. Для оплаты и дальнейших шагов свяжитесь с нами через Telegram или WhatsApp.",
    telegramPaymentInfo: "Получить информацию об оплате в Telegram",
    whatsappPaymentInfo: "Получить информацию об оплате в WhatsApp",
    ok: "ОК",

    cartTotal: "Итог корзины",
    cartTotalDesc:
      "Все цены включают НДС + налоги. После оплаты вы можете получить поддержку по номеру заказа.",

    minQuantityText: "Для этой услуги минимум {min}, максимум {max}.",
  },
};

export function getDictionary(locale: Locale) {
  return dictionaries[locale] || dictionaries.tr;
}