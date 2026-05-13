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
    newOrderDesc:
      "Platform seç, hizmet detaylarını gir ve tekli ya da toplu siparişini güvenle oluştur.",
    currency: "Para Birimi",
    selectPlatform: "Platform Seç",
    category: "Kategori",
    products: "Hizmetler",
    orderInfo: "Sipariş Bilgileri",
    productDescription: "Hizmet Açıklaması",
    quantity: "Miktar",
    fullName: "Ad Soyad",
    contact: "İletişim Bilgisi",
    totalSalePrice: "Toplam Tutar",
    createOrder: "Sipariş Oluştur",
    sending: "Gönderiliyor...",
    servicesLoading: "Servisler yükleniyor...",
    productsLoading: "Hizmetler yükleniyor...",
    noCategoryFound: "Bu platform için henüz kategori bulunamadı.",
    noProductsFound: "Seçili kategori için uygun hizmet bulunamadı.",
    selectProductFirst: "Devam etmek için önce bir hizmet seç.",
    minMax: "Min / Max",
    speed: "Hız",
    serviceNo: "Hizmet Kodu",
    per1000: "1000 adet",
    up: "Yukarı",
    down: "Aşağı",
    successOrder: "Hizmet sepete eklendi.",
    addToCart: "Sepete Ekle",
    goToCart: "Sepete Git",
    cart: "Sepet",
    cartEmpty: "Sepet henüz boş.",
    remove: "Sil",
    edit: "Düzenle",
    buyNow: "Hemen Satın Al",
    bulkBuy: "Sepeti Satın Al",
    targetUsername: "Hedef kullanıcı adı",
    targetLink: "Hedef bağlantı",
    orderNote: "Sipariş notu",
    cartSaleTotal: "Sepet Toplamı",
    cartCostTotal: "Sepet Maliyet Toplamı",
    orderNumber: "Sipariş No",
    batchCode: "Toplu İşlem Kodu",

    smmHeroBadge: "SMMTora sosyal medya hizmet paneli",
    smmHeroTitle: "Tekli Sosyal Medya Hizmetleri",
    smmHeroDesc:
      "Platform, kategori ve hizmet seçerek sipariş oluşturabilirsiniz. Takipçi, beğeni, izlenme, yorum, kaydetme ve diğer sosyal medya destekleri bu panelde listelenir.",
    smmTaxIncluded: "KDV + vergiler dahil",
    smmOrderTracking: "Sipariş numarası ile takip",
    smmSupport: "WhatsApp / Telegram destek",
    smmDataUse: "Bilgiler yalnızca işlem için kullanılır",

    language: "Dil",
    platformSelection: "Platform Seçimi",
    platformSelectionDesc:
      "Sipariş vermek istediğiniz sosyal medya platformunu seçin.",
    platformLoading: "Platformlar yükleniyor...",
    noActivePlatform: "Şu anda satışa açık aktif platform bulunmamaktadır.",
    singleServices: "Tekli hizmetler",
    selected: "Seçili",
    showMorePlatforms: "Tüm Platformları Göster",
    showLessPlatforms: "Daha Az Platform Göster",
    moreCount: "daha",

    categorySelection: "Kategori Seçimi",
    noActiveServiceForPlatform:
      "Bu platform için satışa açık aktif hizmet bulunmamaktadır.",

    serviceListTitle: "Hizmetler",
    serviceListDesc:
      "Hizmet adı, hizmet kodu, panel ID veya bölge bilgisiyle arama yapabilirsiniz.",
    filter: "Filtrele",
    servicesShown: "hizmet gösteriliyor",
    searchPlaceholder: "Hizmet adı, hizmet kodu veya panel ID ara... Örn: 9059",
    searchResultText: "sonuç bulundu",
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
      "Satın alacağınız hizmet, seçtiğiniz platform ve kategoriye göre işleme alınır. Her hizmetin minimum ve maksimum sipariş limiti bulunur.",
    serviceInfoP2:
      "Garantili hizmetlerde belirtilen garanti süresi içinde destek sağlanır. Garantisiz hizmetlerde teslimat sonrası ek koruma taahhüdü bulunmaz.",
    serviceInfoP3:
      "Siparişlerin başlangıç süresi hizmet yoğunluğuna göre değişebilir; çoğu işlem genellikle 0-24 saat içinde başlar.",
    beforeOrderP1:
      "Kullanıcı adı, bağlantı ve miktar bilgilerini dikkatli girin. Hatalı bilgi siparişin gecikmesine veya başlatılamamasına neden olabilir.",
    beforeOrderP2:
      "Bağlantı isteyen hizmetlerde doğru profil, gönderi, video, kanal veya grup linki girilmelidir.",
    note1:
      "• Sipariş oluşturulduktan sonra kullanıcı adı veya bağlantıyı değiştirmemeniz önerilir.",
    note2:
      "• Aynı hedefe aynı anda birden fazla benzer sipariş verilmesi önerilmez.",
    note3: "• Profil, gönderi, video veya kanal herkese açık ve erişilebilir olmalıdır.",
    note4:
      "• Destek talebi oluştururken sipariş numaranızı iletmeniz işlemi hızlandırır.",

    orderBeforeBadge: "MedyaTora Bilgilendirme Sistemi",
    orderBeforeTitle: "Sipariş Öncesi Önemli Bilgilendirme",
    orderBeforeDesc:
      "Sipariş oluşturmadan önce hedef hesabın, bağlantının, miktarın ve hizmet limitlerinin doğru olduğundan emin olun.",
    noticePriceTitle: "Fiyat Bilgisi",
    noticePriceText:
      "Tüm fiyatlara KDV + vergiler dahildir. Ekranda gördüğünüz tutar nihai ödeme tutarıdır.",
    noticeProfileTitle: "Profil Durumu",
    noticeProfileText:
      "İşlem yapılacak profil, gönderi, video, kanal veya grup herkese açık olmalıdır.",
    noticeStartTitle: "Başlangıç Süresi",
    noticeStartText:
      "Başlangıç süresi seçilen hizmete ve yoğunluğa göre değişebilir. İşlemler genellikle 0-24 saat içinde başlar.",
    noticeSupportTitle: "Destek",
    noticeSupportText:
      "Ödeme sonrası dekontu sipariş numaranızla birlikte WhatsApp veya Telegram üzerinden iletebilirsiniz.",

    checkoutTitle: "İletişim ve Ödeme Onayı",
    checkoutDesc:
      "Siparişinizi oluşturmak ve ödeme adımına geçmek için aşağıdaki bilgileri eksiksiz doldurun.",
    close: "Kapat",
    phoneNumber: "Telefon Numarası",
    contactTypeSelect: "İletişim Türü Seç",
    contactValue: "İletişim Bilgisi",
    contactWarning1:
      "Lütfen ulaşılabilir WhatsApp, Instagram, Telegram veya e-posta bilginizi girin.",
    contactWarning2:
      "En hızlı destek ve ödeme kontrolü için önerilen iletişim yöntemi Telegram’dır.",
    paymentMethod: "Ödeme Yöntemi",
    paymentMethodDesc:
      "Siparişinizi onaylamadan önce kullanmak istediğiniz ödeme yöntemini seçin.",
    turkeyBankTransfer: "Türkiye Banka Havalesi / EFT",
    turkeyBankTransferDesc:
      "Türkiye içi ödemeler için banka hesabı bilgileri gösterilir.",
    otherPaymentMethods: "Destek ile Ödeme",
    otherPaymentMethodsDesc:
      "Alternatif ödeme seçenekleri için WhatsApp veya Telegram üzerinden destek alın.",
    turkeyBankInfo: "Türkiye Banka Bilgileri",
    receiverName: "Alıcı Adı",
    iban: "IBAN",
    paymentDescription: "Açıklama",
    digitalServiceOrderNo: "Açıklama kısmını boş bırakın",
    receiptInfo:
      "Ödeme yaparken açıklama kısmına hiçbir şey yazmayın. Ödeme sonrası dekontu Telegram veya WhatsApp üzerinden sipariş numaranızla birlikte iletin.",
    otherPaymentInfoText:
      "Alternatif ödeme bilgisi almak için Telegram veya WhatsApp üzerinden destek ekibimizle iletişime geçin. Ödeme yaparken açıklama kısmını boş bırakın.",
    servicesToConfirm: "Onaylanacak Hizmet Sayısı",
    confirmPurchase: "Alımı Onayla",

    orderConfirmedTitle: "Siparişiniz Oluşturuldu",
    orderConfirmedDesc:
      "Siparişiniz başarıyla oluşturuldu. Aşağıdaki sipariş numarası veya numaraları ile ödeme ve destek adımlarını takip edebilirsiniz.",
    yourOrderNumber: "Sipariş Numaranız",
    paymentStepTitle: "Ödeme ve İşlem Adımı",
    paymentStepDesc:
      "Ödeme yaparken açıklama kısmını boş bırakın. Ödeme bildirimi ve işlem takibi için Telegram veya WhatsApp üzerinden bize ulaşabilirsiniz.",
    telegramPaymentInfo: "Telegram’dan Ödeme Bilgisi Al",
    whatsappPaymentInfo: "WhatsApp’tan Ödeme Bilgisi Al",
    ok: "Tamam",

    cartTotal: "Sepet Toplamı",
    cartTotalDesc:
      "Tüm fiyatlara KDV + vergiler dahildir. Ödeme yaparken açıklama kısmını boş bırakın. Ödeme sonrası sipariş numaranızla destek alabilirsiniz.",

    minQuantityText:
      "Bu hizmet için minimum {min}, maksimum {max} adet sipariş verilebilir.",
  },

  en: {
    newOrder: "New Order",
    newOrderDesc:
      "Choose a platform, enter the service details, and create a single or bulk order securely.",
    currency: "Currency",
    selectPlatform: "Select Platform",
    category: "Category",
    products: "Services",
    orderInfo: "Order Details",
    productDescription: "Service Description",
    quantity: "Quantity",
    fullName: "Full Name",
    contact: "Contact Information",
    totalSalePrice: "Total Amount",
    createOrder: "Create Order",
    sending: "Sending...",
    servicesLoading: "Loading services...",
    productsLoading: "Loading services...",
    noCategoryFound: "No category has been found for this platform yet.",
    noProductsFound: "No suitable service was found for the selected category.",
    selectProductFirst: "Select a service first to continue.",
    minMax: "Min / Max",
    speed: "Speed",
    serviceNo: "Service Code",
    per1000: "per 1000",
    up: "Up",
    down: "Down",
    successOrder: "Service added to cart.",
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

    smmHeroBadge: "SMMTora social media service panel",
    smmHeroTitle: "Single Social Media Services",
    smmHeroDesc:
      "Create an order by selecting a platform, category, and service. Followers, likes, views, comments, saves, and other social media support services are listed in this panel.",
    smmTaxIncluded: "VAT + taxes included",
    smmOrderTracking: "Track with order number",
    smmSupport: "WhatsApp / Telegram support",
    smmDataUse: "Information is used only for processing",

    language: "Language",
    platformSelection: "Platform Selection",
    platformSelectionDesc:
      "Choose the social media platform you want to order for.",
    platformLoading: "Loading platforms...",
    noActivePlatform:
      "There are currently no active platforms available for sale.",
    singleServices: "Single services",
    selected: "Selected",
    showMorePlatforms: "Show All Platforms",
    showLessPlatforms: "Show Fewer Platforms",
    moreCount: "more",

    categorySelection: "Category Selection",
    noActiveServiceForPlatform:
      "There are currently no active services available for this platform.",

    serviceListTitle: "Services",
    serviceListDesc:
      "You can search by service name, service code, panel ID, or region.",
    filter: "Filter",
    servicesShown: "services shown",
    searchPlaceholder:
      "Search service name, service code, or panel ID... Example: 9059",
    searchResultText: "results found",
    quality: "Quality",
    guarantee: "Guarantee",
    region: "Region",
    sort: "Sort",
    all: "All",
    coreQuality: "Core Quality",
    plusQuality: "Plus Quality",
    primeQuality: "Prime Quality",
    guaranteed: "Guaranteed",
    noGuarantee: "No Guarantee",
    recommendedSort: "Recommended Sort",
    priceAsc: "Price: Low to High",
    priceDesc: "Price: High to Low",
    clearFilters: "Clear Filters",

    serviceInfo: "Service Info",
    beforeOrder: "Before Ordering",
    importantNotes: "Important Notes",
    serviceInfoP1:
      "The service you purchase is processed according to the selected platform and category. Each service has minimum and maximum order limits.",
    serviceInfoP2:
      "For guaranteed services, support is provided within the stated guarantee period. Non-guaranteed services do not include additional protection after delivery.",
    serviceInfoP3:
      "Order start times may vary depending on service load; most orders usually begin within 0-24 hours.",
    beforeOrderP1:
      "Please enter the username, link, and quantity carefully. Incorrect information may delay the order or prevent it from starting.",
    beforeOrderP2:
      "For services that require a link, the correct profile, post, video, channel, or group link must be provided.",
    note1:
      "• It is recommended not to change the username or link after creating the order.",
    note2:
      "• It is not recommended to place multiple similar orders for the same target at the same time.",
    note3:
      "• The profile, post, video, or channel must be public and accessible.",
    note4:
      "• Providing your order number when contacting support helps us assist you faster.",

    orderBeforeBadge: "MedyaTora Information System",
    orderBeforeTitle: "Important Information Before Ordering",
    orderBeforeDesc:
      "Before creating an order, make sure the target account, link, quantity, and service limits are correct.",
    noticePriceTitle: "Price Information",
    noticePriceText:
      "All prices include VAT + taxes. The amount shown on the screen is the final payment amount.",
    noticeProfileTitle: "Profile Status",
    noticeProfileText:
      "The target profile, post, video, channel, or group must be public and accessible.",
    noticeStartTitle: "Start Time",
    noticeStartText:
      "Start time may vary depending on the selected service and current load. Orders usually start within 0-24 hours.",
    noticeSupportTitle: "Support",
    noticeSupportText:
      "After payment, you can send your receipt together with your order number via WhatsApp or Telegram.",

    checkoutTitle: "Contact and Payment Confirmation",
    checkoutDesc:
      "Fill in the information below completely to create your order and continue to the payment step.",
    close: "Close",
    phoneNumber: "Phone Number",
    contactTypeSelect: "Select Contact Type",
    contactValue: "Contact Information",
    contactWarning1:
      "Please enter reachable WhatsApp, Instagram, Telegram, or email information.",
    contactWarning2:
      "Telegram is the recommended contact method for faster support and payment review.",
    paymentMethod: "Payment Method",
    paymentMethodDesc:
      "Select the payment method you want to use before confirming your order.",
    turkeyBankTransfer: "Turkey Bank Transfer / EFT",
    turkeyBankTransferDesc:
      "Bank account details are displayed for payments within Turkey.",
    otherPaymentMethods: "Payment via Support",
    otherPaymentMethodsDesc:
      "Contact us via WhatsApp or Telegram for alternative payment options.",
    turkeyBankInfo: "Turkey Bank Details",
    receiverName: "Receiver Name",
    iban: "IBAN",
    paymentDescription: "Payment Description",
    digitalServiceOrderNo: "Leave the payment description field empty",
    receiptInfo:
      "Do not write anything in the payment description field. After payment, send your receipt together with your order number via Telegram or WhatsApp.",
    otherPaymentInfoText:
      "To receive alternative payment information, contact our support team via Telegram or WhatsApp. Leave the payment description field empty when making the payment.",
    servicesToConfirm: "Number of Services to Confirm",
    confirmPurchase: "Confirm Purchase",

    orderConfirmedTitle: "Your Order Has Been Created",
    orderConfirmedDesc:
      "Your order has been created successfully. You can follow the payment and support steps using the order number or numbers below.",
    yourOrderNumber: "Your Order Number",
    paymentStepTitle: "Payment and Processing Step",
    paymentStepDesc:
      "Leave the payment description field empty when making the payment. Contact us via Telegram or WhatsApp for payment notification and order tracking.",
    telegramPaymentInfo: "Get Payment Info on Telegram",
    whatsappPaymentInfo: "Get Payment Info on WhatsApp",
    ok: "OK",

    cartTotal: "Cart Total",
    cartTotalDesc:
      "All prices include VAT + taxes. Leave the payment description field empty when making the payment. After payment, you can receive support with your order number.",

    minQuantityText:
      "For this service, the minimum order quantity is {min} and the maximum is {max}.",
  },

  ru: {
    newOrder: "Новый заказ",
    newOrderDesc:
      "Выберите платформу, укажите детали услуги и безопасно оформите один или несколько заказов.",
    currency: "Валюта",
    selectPlatform: "Выберите платформу",
    category: "Категория",
    products: "Услуги",
    orderInfo: "Детали заказа",
    productDescription: "Описание услуги",
    quantity: "Количество",
    fullName: "Имя и фамилия",
    contact: "Контактная информация",
    totalSalePrice: "Итоговая сумма",
    createOrder: "Создать заказ",
    sending: "Отправка...",
    servicesLoading: "Загрузка услуг...",
    productsLoading: "Загрузка услуг...",
    noCategoryFound: "Для этой платформы пока не найдены категории.",
    noProductsFound: "Для выбранной категории подходящие услуги не найдены.",
    selectProductFirst: "Чтобы продолжить, сначала выберите услугу.",
    minMax: "Мин / Макс",
    speed: "Скорость",
    serviceNo: "Код услуги",
    per1000: "за 1000",
    up: "Вверх",
    down: "Вниз",
    successOrder: "Услуга добавлена в корзину.",
    addToCart: "Добавить в корзину",
    goToCart: "Перейти в корзину",
    cart: "Корзина",
    cartEmpty: "Корзина пока пуста.",
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
    batchCode: "Код пакетной операции",

    smmHeroBadge: "SMMTora — панель услуг для социальных сетей",
    smmHeroTitle: "Отдельные услуги для социальных сетей",
    smmHeroDesc:
      "Оформите заказ, выбрав платформу, категорию и услугу. Подписчики, лайки, просмотры, комментарии, сохранения и другие услуги поддержки социальных сетей доступны в этой панели.",
    smmTaxIncluded: "НДС + налоги включены",
    smmOrderTracking: "Отслеживание по номеру заказа",
    smmSupport: "Поддержка WhatsApp / Telegram",
    smmDataUse: "Данные используются только для обработки заказа",

    language: "Язык",
    platformSelection: "Выбор платформы",
    platformSelectionDesc:
      "Выберите социальную платформу, для которой хотите оформить заказ.",
    platformLoading: "Загрузка платформ...",
    noActivePlatform:
      "Сейчас нет активных платформ, доступных для оформления заказа.",
    singleServices: "Отдельные услуги",
    selected: "Выбрано",
    showMorePlatforms: "Показать все платформы",
    showLessPlatforms: "Показать меньше платформ",
    moreCount: "ещё",

    categorySelection: "Выбор категории",
    noActiveServiceForPlatform:
      "Для этой платформы сейчас нет активных услуг, доступных для заказа.",

    serviceListTitle: "Услуги",
    serviceListDesc:
      "Вы можете искать по названию услуги, коду услуги, panel ID или региону.",
    filter: "Фильтр",
    servicesShown: "услуг показано",
    searchPlaceholder:
      "Поиск по названию, коду услуги или panel ID... Например: 9059",
    searchResultText: "результатов найдено",
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
    priceAsc: "Цена: по возрастанию",
    priceDesc: "Цена: по убыванию",
    clearFilters: "Очистить фильтры",

    serviceInfo: "Информация об услуге",
    beforeOrder: "Перед заказом",
    importantNotes: "Важные примечания",
    serviceInfoP1:
      "Покупаемая услуга обрабатывается в соответствии с выбранной платформой и категорией. У каждой услуги есть минимальные и максимальные лимиты заказа.",
    serviceInfoP2:
      "Для услуг с гарантией поддержка предоставляется в течение указанного гарантийного срока. Услуги без гарантии не включают дополнительную защиту после выполнения.",
    serviceInfoP3:
      "Время запуска заказа может отличаться в зависимости от нагрузки; большинство заказов обычно запускается в течение 0-24 часов.",
    beforeOrderP1:
      "Внимательно укажите username, ссылку и количество. Неверные данные могут задержать заказ или помешать его запуску.",
    beforeOrderP2:
      "Для услуг, где требуется ссылка, необходимо указать правильную ссылку на профиль, пост, видео, канал или группу.",
    note1:
      "• После создания заказа рекомендуется не менять username или ссылку.",
    note2:
      "• Не рекомендуется одновременно оформлять несколько похожих заказов на одну и ту же цель.",
    note3:
      "• Профиль, пост, видео или канал должны быть открытыми и доступными.",
    note4:
      "• При обращении в поддержку указывайте номер заказа — это ускорит обработку.",

    orderBeforeBadge: "Информационная система MedyaTora",
    orderBeforeTitle: "Важная информация перед заказом",
    orderBeforeDesc:
      "Перед созданием заказа убедитесь, что аккаунт, ссылка, количество и лимиты услуги указаны правильно.",
    noticePriceTitle: "Информация о цене",
    noticePriceText:
      "Все цены включают НДС + налоги. Сумма, указанная на экране, является окончательной суммой оплаты.",
    noticeProfileTitle: "Статус профиля",
    noticeProfileText:
      "Целевой профиль, пост, видео, канал или группа должны быть открытыми и доступными.",
    noticeStartTitle: "Время запуска",
    noticeStartText:
      "Время запуска зависит от выбранной услуги и текущей нагрузки. Обычно заказы запускаются в течение 0-24 часов.",
    noticeSupportTitle: "Поддержка",
    noticeSupportText:
      "После оплаты вы можете отправить чек вместе с номером заказа через WhatsApp или Telegram.",

    checkoutTitle: "Контакты и подтверждение оплаты",
    checkoutDesc:
      "Заполните данные ниже, чтобы создать заказ и перейти к этапу оплаты.",
    close: "Закрыть",
    phoneNumber: "Номер телефона",
    contactTypeSelect: "Выберите способ связи",
    contactValue: "Контактные данные",
    contactWarning1:
      "Укажите доступный WhatsApp, Instagram, Telegram или e-mail.",
    contactWarning2:
      "Telegram — рекомендуемый способ связи для более быстрой поддержки и проверки оплаты.",
    paymentMethod: "Способ оплаты",
    paymentMethodDesc:
      "Выберите способ оплаты перед подтверждением заказа.",
    turkeyBankTransfer: "Банковский перевод / EFT в Турции",
    turkeyBankTransferDesc:
      "Для оплат внутри Турции отображаются банковские реквизиты.",
    otherPaymentMethods: "Оплата через поддержку",
    otherPaymentMethodsDesc:
      "Для альтернативных способов оплаты свяжитесь с нами через WhatsApp или Telegram.",
    turkeyBankInfo: "Банковские реквизиты в Турции",
    receiverName: "Получатель",
    iban: "IBAN",
    paymentDescription: "Комментарий к платежу",
    digitalServiceOrderNo: "Оставьте поле комментария к платежу пустым",
    receiptInfo:
      "Не пишите ничего в поле комментария к платежу. После оплаты отправьте чек вместе с номером заказа через Telegram или WhatsApp.",
    otherPaymentInfoText:
      "Чтобы получить альтернативную информацию об оплате, свяжитесь с нашей поддержкой через Telegram или WhatsApp. При оплате оставьте поле комментария пустым.",
    servicesToConfirm: "Количество услуг для подтверждения",
    confirmPurchase: "Подтвердить покупку",

    orderConfirmedTitle: "Ваш заказ создан",
    orderConfirmedDesc:
      "Ваш заказ успешно создан. Вы можете отслеживать оплату и поддержку по номеру или номерам заказа ниже.",
    yourOrderNumber: "Ваш номер заказа",
    paymentStepTitle: "Этап оплаты и обработки",
    paymentStepDesc:
      "При оплате оставьте поле комментария пустым. Для уведомления об оплате и отслеживания заказа свяжитесь с нами через Telegram или WhatsApp.",
    telegramPaymentInfo: "Получить информацию об оплате в Telegram",
    whatsappPaymentInfo: "Получить информацию об оплате в WhatsApp",
    ok: "ОК",

    cartTotal: "Итог корзины",
    cartTotalDesc:
      "Все цены включают НДС + налоги. При оплате оставьте поле комментария пустым. После оплаты вы можете получить поддержку по номеру заказа.",

    minQuantityText:
      "Для этой услуги минимальное количество — {min}, максимальное — {max}.",
  },
};

export function getDictionary(locale: Locale) {
  return dictionaries[locale] || dictionaries.tr;
}

export function normalizeLocale(value: unknown): Locale {
  const locale = String(value || "").trim().toLowerCase();

  if (locale === "tr" || locale === "en" || locale === "ru") {
    return locale;
  }

  return "tr";
}

export function detectBrowserLocale(): Locale {
  if (typeof window === "undefined") return "tr";

  const saved = window.localStorage.getItem("medyatora_locale");

  if (saved === "tr" || saved === "en" || saved === "ru") {
    return saved;
  }

  const browserLanguage = String(window.navigator.language || "").toLowerCase();

  if (browserLanguage.startsWith("tr")) return "tr";
  if (browserLanguage.startsWith("ru")) return "ru";

  return "en";
}

export function saveLocale(locale: Locale) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem("medyatora_locale", locale);

  document.cookie = `medyatora_locale=${locale}; path=/; max-age=31536000; samesite=lax`;
}