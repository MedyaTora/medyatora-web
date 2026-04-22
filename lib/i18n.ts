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
  },
  en: {
    newOrder: "New Order",
    newOrderDesc: "Choose a platform, enter item details, and create single or bulk orders.",
    currency: "Currency",
    selectPlatform: "Select Platform",
    category: "Category",
    products: "Products",
    orderInfo: "Order Details",
    productDescription: "Product Description",
    quantity: "Quantity",
    fullName: "Full Name",
    contact: "Contact info",
    totalSalePrice: "Total Sale Price",
    createOrder: "Create Order",
    sending: "Sending...",
    servicesLoading: "Loading services...",
    productsLoading: "Loading products...",
    noCategoryFound: "No category found for this platform yet.",
    noProductsFound: "No products found for this category yet.",
    selectProductFirst: "Select a product first.",
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
    cartEmpty: "Cart is empty.",
    remove: "Remove",
    edit: "Edit",
    buyNow: "Buy Now",
    bulkBuy: "Checkout Cart",
    targetUsername: "Target username",
    targetLink: "Target link",
    orderNote: "Order note",
    cartSaleTotal: "Cart Sale Total",
    cartCostTotal: "Cart Cost Total",
    orderNumber: "Order No",
    batchCode: "Batch Code",
  },
  ru: {
    newOrder: "Новый заказ",
    newOrderDesc: "Выберите платформу, введите данные услуги и оформите один или несколько заказов.",
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
    orderNote: "Примечание",
    cartSaleTotal: "Итог продажи",
    cartCostTotal: "Себестоимость корзины",
    orderNumber: "№ заказа",
    batchCode: "Batch код",
  },
};

export function getDictionary(locale: Locale) {
  return dictionaries[locale] || dictionaries.tr;
}