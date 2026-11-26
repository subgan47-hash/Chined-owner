export interface DetectedCategory {
  weightKg: number;
  category: string;
  label: string;
}

const KEYWORDS: { keywords: string[]; weight: number; category: string; label: string }[] = [
  { keywords: ['schoen', 'boot', 'sneaker', 'laars', 'hiel', 'pump', 'shoe', 'boot'], weight: 1.2, category: 'Kleding', label: 'Schoenen/laarzen' },
  { keywords: ['jas', 'jasjes', 'coat', 'jacket', 'winterjas'], weight: 1.0, category: 'Kleding', label: 'Jas' },
  { keywords: ['trui', 'sweater', 'pullover', 'vest', 'cardigan'], weight: 0.6, category: 'Kleding', label: 'Trui/vest' },
  { keywords: ['jurk', 'dress', 'rok', 'skirt'], weight: 0.4, category: 'Kleding', label: 'Jurk/rok' },
  { keywords: ['t-shirt', 'tshirt', 'shirt', 'top', 'blouse', 'polo'], weight: 0.3, category: 'Kleding', label: 'T-shirt/blouse' },
  { keywords: ['broek', 'jeans', 'pant', 'trouser', 'legging'], weight: 0.5, category: 'Kleding', label: 'Broek' },
  { keywords: ['tas', 'bag', 'rugzak', 'backpack', 'handtas', 'schoudertas'], weight: 0.5, category: 'Tech-accessoires', label: 'Tas/rugzak' },
  { keywords: ['poef', 'opbergoef', 'kussen', 'kussen', 'cushion'], weight: 1.5, category: 'Opbergen', label: 'Poef/kussen' },
  { keywords: ['plant', 'pot', 'vaas', 'ceramic'], weight: 1.2, category: 'Wonen', label: 'Plantenpot/vaas' },
  { keywords: ['lamp', 'licht', 'led-strip', 'bureaulamp', 'lamp'], weight: 0.6, category: 'Wonen', label: 'Lamp/verlichting' },
  { keywords: ['opbergbox', 'opvouwbare', 'storage', 'opberg', 'box', 'koffer'], weight: 0.8, category: 'Opbergen', label: 'Opbergbox' },
  { keywords: ['keuken', 'keukengerei', 'pan', 'siliconen', 'cookware', 'utensil'], weight: 0.5, category: 'Keuken', label: 'Keukengerei' },
  { keywords: ['fles', 'bottle', 'waterfles', 'thermos'], weight: 0.35, category: 'Sport', label: 'Waterfles/thermos' },
  { keywords: ['lader', 'charger', 'oplader', 'gan', 'usb-c', 'adapter'], weight: 0.2, category: 'Tech-accessoires', label: 'Lader/adapter' },
  { keywords: ['oordopje', 'earbud', 'headphone', 'koptelefoon', 'earphone'], weight: 0.15, category: 'Tech-accessoires', label: 'Oordopjes/koptelefoon' },
  { keywords: ['telefoon', 'phone', 'ringhouder', 'houder', 'stand'], weight: 0.2, category: 'Tech-accessoires', label: 'Telefoon-accessoire' },
  { keywords: ['springtouw', 'jump rope', 'yoga', 'fitness', 'sport'], weight: 0.3, category: 'Sport', label: 'Sport/fitness' },
];

export function detectWeightAndCategory(text: string): DetectedCategory {
  const lower = text.toLowerCase();
  for (const rule of KEYWORDS) {
    if (rule.keywords.some(kw => lower.includes(kw))) {
      return { weightKg: rule.weight, category: rule.category, label: rule.label };
    }
  }
  return { weightKg: 0.5, category: 'Wonen', label: 'Algemeen accessoire' };
}

export type FreightMode = 'air' | 'train';

export interface ChinedPriceRates {
  airRatePerKg: number;
  railRatePerKg: number;
  b2bDutyPct: number;
  dutchVatPct: number;
}

export interface ChinedPriceBreakdown {
  factoryPriceEur: number;
  fee: number;
  chinaShip: number;
  chargeableWeightKg: number;
  freight: number;
  freightRate: number;
  duty: number;
  hub: number;
  returnBuffer: number;
  scanFee: number;
  costExVat: number;
  vat: number;
  allIn: number;
  etalageprijs: number;
}

export const QC_FEE_PCT = 6;
export const CHINA_DOMESTIC_EUR = 1.20;
export const ROTTERDAM_HUB_EUR = 0.75;
export const RETURN_BUFFER_EUR = 0.50;
export const CHINED_FEE_EUR = 0.75;
export const VOLUME_WEIGHT_DIVISOR = 8000;
export const EU_PARCEL_SURCHARGE = 6.05;
export const ETALAGEPRIJS_MULTIPLIER = 1.45;

export function getChargeableWeight(actualWeightKg: number, lengthCm: number, widthCm: number, heightCm: number): number {
  const volWeight = (lengthCm * widthCm * heightCm) / VOLUME_WEIGHT_DIVISOR;
  return Math.max(actualWeightKg, volWeight);
}

export function calculateChinedPrice(
  rmbPrice: number,
  rmbToEurRate: number,
  weightKg: number,
  lengthCm: number,
  widthCm: number,
  heightCm: number,
  mode: FreightMode,
  rates: ChinedPriceRates,
): ChinedPriceBreakdown {
  const factoryPriceEur = rmbPrice * rmbToEurRate;
  const chargeableWeightKg = getChargeableWeight(weightKg, lengthCm, widthCm, heightCm);
  const freightRate = mode === 'air' ? rates.airRatePerKg : rates.railRatePerKg;
  const fee = factoryPriceEur * (QC_FEE_PCT / 100);
  const chinaShip = CHINA_DOMESTIC_EUR;
  const freight = chargeableWeightKg * freightRate;
  const duty = (factoryPriceEur + freight) * (rates.b2bDutyPct / 100);
  const hub = ROTTERDAM_HUB_EUR;
  const returnBuffer = RETURN_BUFFER_EUR;
  const scanFee = CHINED_FEE_EUR;
  const costExVat = factoryPriceEur + fee + chinaShip + freight + duty + hub + returnBuffer + scanFee;
  const vat = costExVat * (rates.dutchVatPct / 100);
  const allIn = costExVat + vat;
  const etalageprijs = allIn * ETALAGEPRIJS_MULTIPLIER + EU_PARCEL_SURCHARGE;
  return { factoryPriceEur, fee, chinaShip, chargeableWeightKg, freight, freightRate, duty, hub, returnBuffer, scanFee, costExVat, vat, allIn, etalageprijs };
}

export function calculateChinedAllInEur(
  factoryPriceEur: number,
  weightKg: number,
  mode: FreightMode = 'air',
  rates: ChinedPriceRates = { airRatePerKg: 4.95, railRatePerKg: 2.50, b2bDutyPct: 12, dutchVatPct: 21 },
): {
  fee: number; chinaShip: number; freight: number; freightRate: number; duty: number; hub: number; returnBuffer: number; scanFee: number;
  costExVat: number; vat: number; allIn: number;
} {
  const freightRate = mode === 'air' ? rates.airRatePerKg : rates.railRatePerKg;
  const fee = factoryPriceEur * (QC_FEE_PCT / 100);
  const chinaShip = CHINA_DOMESTIC_EUR;
  const freight = weightKg * freightRate;
  const duty = (factoryPriceEur + freight) * (rates.b2bDutyPct / 100);
  const hub = ROTTERDAM_HUB_EUR;
  const returnBuffer = RETURN_BUFFER_EUR;
  const scanFee = CHINED_FEE_EUR;
  const costExVat = factoryPriceEur + fee + chinaShip + freight + duty + hub + returnBuffer + scanFee;
  const vat = costExVat * (rates.dutchVatPct / 100);
  const allIn = costExVat + vat;
  return { fee, chinaShip, freight, freightRate, duty, hub, returnBuffer, scanFee, costExVat, vat, allIn };
}
