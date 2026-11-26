import type { Product, CartItem, Settings, TransportMode } from './types';

export function checkRiskKeywords(product: Product, settings: Settings): { blocked: boolean; reason: string } {
  const text = `${product.title} ${product.titleNl} ${product.category}`.toLowerCase();
  for (const kw of settings.blockedKeywords) {
    if (text.includes(kw.toLowerCase())) {
      return { blocked: true, reason: `Risico-artikel gedetecteerd: "${kw}". Dit product kan niet geïmporteerd worden in verband met EU-veiligheids- en nalevingsregels.` };
    }
  }
  return { blocked: false, reason: '' };
}

export function checkParcelDimensions(product: Product, settings: Settings): { blocked: boolean; reason: string } {
  if (product.lengthCm > settings.maxParcelLength || product.widthCm > settings.maxParcelWidth || product.heightCm > settings.maxParcelHeight) {
    return { blocked: true, reason: `Pakketafmetingen overschreden (max ${settings.maxParcelLength}x${settings.maxParcelWidth}x${settings.maxParcelHeight} cm).` };
  }
  return { blocked: false, reason: '' };
}

export function checkParcelWeight(product: Product, settings: Settings): { blocked: boolean; reason: string } {
  if (product.weightKg > settings.maxParcelWeight) {
    return { blocked: true, reason: `Gewicht overschreden (max ${settings.maxParcelWeight} kg).` };
  }
  return { blocked: false, reason: '' };
}

export function getProductCostEur(priceRmb: number, settings: Settings): number {
  return priceRmb * settings.rmbToEurRate * (1 + settings.currencyBufferPct / 100);
}

export function getChargeableWeightKg(weightKg: number, lengthCm: number, widthCm: number, heightCm: number, settings: Settings): number {
  const volumeWeight = (lengthCm * widthCm * heightCm) / settings.volumeWeightDivisor;
  return Math.max(weightKg, volumeWeight);
}

export function getChinaHandlingEur(productCostEur: number, settings: Settings): number {
  return productCostEur * (settings.cnCargoFeePct / 100) + settings.domesticChinaShippingEur;
}

export function getFreightEur(chargeableWeightKg: number, mode: TransportMode, settings: Settings): number {
  const rate = mode === 'train' ? settings.railRatePerKg : settings.airRatePerKg;
  return chargeableWeightKg * rate;
}

export function getB2bDutyEur(productCostEur: number, freightEur: number, settings: Settings): number {
  return (productCostEur + freightEur) * (settings.b2bDutyPct / 100);
}

export function isClothingItem(item: CartItem): boolean {
  return item.product.category === 'Kleding' || item.product.merchant === 'shein';
}

export function getCommunityFundDeposit(items: CartItem[], settings: Settings): number {
  return items.reduce((sum, item) => {
    const perItem = isClothingItem(item) ? settings.communityFundClothing : settings.communityFundStandard;
    return sum + perItem * item.quantity;
  }, 0);
}

export function getUniqueCategories(items: CartItem[]): number {
  const cats = new Set(items.map(i => i.product.category));
  return cats.size;
}

export function getPlatformMarginEur(items: CartItem[], settings: Settings): number {
  const cats = getUniqueCategories(items);
  return cats * settings.platformMarginPerCategory;
}

export function getDirectPriceEur(product: Product, settings: Settings): number {
  const productCost = getProductCostEur(product.priceRmb, settings);
  const merchantRatio = product.merchant === '1688' ? 1 : 1 / (settings.merchantTo1688Ratio / 100);
  const directPrice = productCost * merchantRatio;
  const directProductCost = directPrice + settings.euSurcharge;
  return directProductCost;
}

export interface PriceBreakdown {
  productCostEur: number;
  chinaHandlingEur: number;
  chargeableWeightKg: number;
  freightEur: number;
  dutyEur: number;
  postnlCostEur: number;
  platformMarginEur: number;
  communityFundDeposit: number;
  totalEur: number;
  directCostEur: number;
  savedEur: number;
  personalDeposit: number;
}

export function calculateOrderPricing(items: CartItem[], mode: TransportMode, settings: Settings): PriceBreakdown {
  const productCostEur = items.reduce((sum, item) => {
    const baseCost = getProductCostEur(item.product.priceRmb, settings);
    const ratio = item.product.merchant === '1688' ? 1 : 1 / (settings.merchantTo1688Ratio / 100);
    return sum + baseCost * ratio * item.quantity;
  }, 0);

  const totalWeight = items.reduce((sum, item) => {
    const cw = getChargeableWeightKg(item.product.weightKg, item.product.lengthCm, item.product.widthCm, item.product.heightCm, settings);
    return sum + cw * item.quantity;
  }, 0);

  const chinaHandlingEur = items.reduce((sum, item) => {
    const baseCost = getProductCostEur(item.product.priceRmb, settings);
    const ratio = item.product.merchant === '1688' ? 1 : 1 / (settings.merchantTo1688Ratio / 100);
    const productCost = baseCost * ratio;
    return sum + (getChinaHandlingEur(productCost, settings) * item.quantity);
  }, 0);

  const freightEur = getFreightEur(totalWeight, mode, settings);
  const dutyEur = getB2bDutyEur(productCostEur, freightEur, settings);
  const postnlCostEur = settings.postnlRate;
  const platformMarginEur = getPlatformMarginEur(items, settings);
  const communityFundDeposit = getCommunityFundDeposit(items, settings);

  const totalEur = productCostEur + chinaHandlingEur + freightEur + dutyEur + postnlCostEur + platformMarginEur + communityFundDeposit;

  const directCostEur = items.reduce((sum, item) => sum + getDirectPriceEur(item.product, settings) * item.quantity, 0) + 6.95;

  const savedEur = directCostEur - totalEur;
  const personalDeposit = communityFundDeposit;

  return {
    productCostEur,
    chinaHandlingEur,
    chargeableWeightKg: totalWeight,
    freightEur,
    dutyEur,
    postnlCostEur,
    platformMarginEur,
    communityFundDeposit,
    totalEur,
    directCostEur,
    savedEur,
    personalDeposit,
  };
}

export function formatEur(amount: number): string {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(amount);
}

export function formatRmb(amount: number): string {
  return `¥ ${amount.toFixed(2)}`;
}

export function generateBarcode(prefix: string = 'CN-RTM'): string {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${num}`;
}

export function generateOrderNumber(): string {
  const date = new Date();
  const ymd = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `CHINED-${ymd}-${rand}`;
}
