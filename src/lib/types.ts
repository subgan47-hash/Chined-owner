export type Merchant = '1688' | 'shein' | 'temu' | 'aliexpress';
export type Category = 'Wonen' | 'Kleding' | 'Tech-accessoires' | 'Keuken' | 'Opbergen' | 'Sport' | 'Auto & Fiets';
export type TransportMode = 'train' | 'air';

export interface Product {
  id: string;
  merchant: Merchant;
  title: string;
  titleNl: string;
  category: Category;
  priceRmb: number;
  weightKg: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  imageUrl: string;
  sizes: string[];
  colors: string[];
  originalUrl: string;
  qcInstructionEn: string;
  inStock: boolean;
}

export interface CustomerUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  postalCode: string;
  password: string;
  createdAt: string;
}

export interface PriceProof {
  id: string;
  title: string;
  imageUrl: string;
  sourceImageUrl: string;
  temuPrice: number;
  euSurcharge: number;
  sourceRmb: number;
  sourceEur: number;
  chinedPrice: number;
  saving: number;
  savingPct: number;
  temuUrl: string;
  sourceUrl: string;
}

export interface CartItem {
  id: string;
  product: Product;
  size: string;
  color: string;
  quantity: number;
}

export type OrderStatus =
  | 'Nieuw'
  | 'Besteld bij Bron/1688'
  | 'QC Foto\'s Goedgekeurd'
  | 'In Bulkdoos naar Rotterdam'
  | 'Aangekomen in Rotterdam'
  | 'PostNL Label Gemaakt'
  | 'Onderweg naar Klant'
  | 'Bezorgd';

export interface Milestone {
  status: OrderStatus;
  date: string;
  done: boolean;
  note?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerUserId?: string;
  customerPhone: string;
  address: string;
  postalCode: string;
  city: string;
  deliveryType: 'home' | 'locker';
  pickupPoint?: string;
  paymentMethod: string;
  items: CartItem[];
  transportMode: TransportMode;
  status: OrderStatus;
  milestones: Milestone[];
  productCostEur: number;
  chinaHandlingEur: number;
  freightEur: number;
  dutyEur: number;
  postnlCostEur: number;
  platformMarginEur: number;
  communityFundDeposit: number;
  totalEur: number;
  savedEur: number;
  personalDeposit: number;
  hasReturned: boolean;
  createdAt: string;
  qcPhotos: QcPhoto[];
  internalBarcode: string;
}

export interface QcPhoto {
  id: string;
  url: string;
  caption: string;
}

export interface ReturnFundEntry {
  id: string;
  orderId: string;
  type: 'inflow' | 'depreciation';
  amount: number;
  description: string;
  date: string;
  isClothing: boolean;
}

export interface Settings {
  rmbToEurRate: number;
  currencyBufferPct: number;
  merchantTo1688Ratio: number;
  cnCargoFeePct: number;
  domesticChinaShippingEur: number;
  railRatePerKg: number;
  airRatePerKg: number;
  airFreightEnabled: boolean;
  volumeWeightDivisor: number;
  b2bDutyPct: number;
  postnlRate: number;
  postnlRebate: number;
  platformMarginPerCategory: number;
  dutchVatPct: number;
  minBundleItems: number;
  returnShippingSingle: number;
  returnShippingMultiple: number;
  communityFundStandard: number;
  communityFundClothing: number;
  shopCreditBonusPct: number;
  blockedKeywords: string[];
  euSurcharge: number;
  maxParcelLength: number;
  maxParcelWidth: number;
  maxParcelHeight: number;
  maxParcelWeight: number;
  launchCities: LaunchCitySettings;
  firstOrderMaxPriceCap: number;
  firstOrderMaxPriceCapEnabled: boolean;
  returnPickupFee: number;
  qcInstructionEn: string;
  explainerVideoUrl: string;
  oneboundKey: string;
  oneboundSecret: string;
}

export interface LaunchCitySettings {
  rotterdam: boolean;
  denHaag: boolean;
  amsterdam: boolean;
  utrecht: boolean;
}

export interface ApiKeyConfig {
  merchant1688Key: string;
  merchant1688Endpoint: string;
  sheinKey: string;
  sheinEndpoint: string;
  temuKey: string;
  temuEndpoint: string;
  aliexpressKey: string;
  aliexpressEndpoint: string;
  pspProvider: string;
  pspLiveKey: string;
  pspMerchantId: string;
  pspWebhookSecret: string;
  pspIdeal: boolean;
  pspCreditcard: boolean;
  pspKlarna: boolean;
  pspBancontact: boolean;
  chinaPayoutProvider: string;
  chinaPayoutKey: string;
  postnlApiKey: string;
  postnlCustomerCode: string;
  postnlBlcContract: string;
  eoriNumber: string;
  oneboundKey: string;
  oneboundSecret: string;
}

export interface LegalDocs {
  terms: string;
  returnPolicy: string;
  privacy: string;
  faq: string;
  heroBanner: string;
  trustBar: string;
  handbookAdmin: string;
  handbookCustomer: string;
  guide: string;
}

export interface BundleBuilderItem {
  id: string;
  url: string;
  priceEur: number;
  currency: 'EUR' | 'RMB';
  photoDataUrl: string;
  temuPriceEur?: number;
  detectedWeightKg: number;
  detectedCategory: string;
  chinedAllInEur: number;
  source: 'direct' | 'lookup-request';
}

export interface ProcurementRequest {
  id: string;
  createdAt: string;
  customerName?: string;
  customerEmail?: string;
  items: BundleBuilderItem[];
  status: 'Nieuw' | 'In Review' | 'Op Inkooplijst' | 'Op Voorraad in Rotterdam';
  admin1688PriceEur?: number;
  adminWeightKg?: number;
}

export interface SimulatorParams {
  monthlyVolume: number;
  avgCategories: number;
  postnlDiscount: number;
}
