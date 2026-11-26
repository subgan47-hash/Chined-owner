import type { Product, Category, Merchant } from './types';

export interface OneBoundItem {
  num_iid: string;
  title: string;
  title_nl?: string;
  title_zh?: string;
  title_original?: string;
  pic_url: string;
  price: string;
  priceRange?: string;
  detail_url: string;
  weight?: string;
  weightUnit?: string;
  size?: string;
  desc?: string;
}

export interface OneBoundSearchResult {
  items: OneBoundItem[];
  error?: string;
}

function mapCategory(title: string): Category {
  const t = title.toLowerCase();
  if (/dress|jurk|shirt|trui|sweater|broek|jeans|jas|coat|rok|skirt|kleding|fashion|blouse|polo|vest|cardigan|schoen|shoe|boot|sneaker/.test(t)) return 'Kleding';
  if (/lamp|licht|led|woon|interieur|decor|plant|pot|vaas|kussen|cushion|poef|furniture|meubel/.test(t)) return 'Wonen';
  if (/kitchen|keuken|pan|pot|silicon|cookware|utensil|baking|cutlery|bestek/.test(t)) return 'Keuken';
  if (/opberg|storage|box|koffer|organizer|mand|bag|tas|rugzak|backpack|suitcase/.test(t)) return 'Opbergen';
  if (/phone|telefoon|charger|lader|usb|earbud|headphone|koptelefoon|tech|cable|adapter|gan/.test(t)) return 'Tech-accessoires';
  if (/sport|fitness|yoga|bottle|fles|waterfles|thermos|jump|rope/.test(t)) return 'Sport';
  if (/auto|car|fiets|bike|phone holder|mount/.test(t)) return 'Auto & Fiets';
  return 'Wonen';
}

function cleanTitle(raw: string): { nl: string; orig: string } {
  const orig = raw.replace(/\s+/g, ' ').trim();
  // Simple cleanup: strip common noise tokens
  let cleaned = orig
    .replace(/【[^】]*】/g, '')
    .replace(/\[[^\]]*\]/g, '')
    .replace(/\([^)]*批发\)/g, '')
    .replace(/批发/g, '')
    .replace(/厂家直销/g, '')
    .replace(/现货/g, '')
    .replace(/代发/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  // If it's still mostly Chinese, keep as-is (the admin can edit later)
  return { nl: cleaned || orig, orig };
}

function parseWeight(weightStr?: string, sizeStr?: string): number {
  if (weightStr) {
    const w = parseFloat(weightStr);
    if (!isNaN(w) && w > 0) {
      // Assume grams if > 100, kg if < 50
      return w > 100 ? w / 1000 : w;
    }
  }
  // Fallback: try to extract from size string
  if (sizeStr) {
    const m = sizeStr.match(/([\d.]+)\s*(kg|g|克)/i);
    if (m) {
      const v = parseFloat(m[1]);
      return m[2].toLowerCase().startsWith('k') || m[2] === '克' && v < 50 ? v : v / 1000;
    }
  }
  return 0.5;
}

function parseDimensions(sizeStr?: string): { length: number; width: number; height: number } {
  if (sizeStr) {
    const m = sizeStr.match(/(\d+)\s*[x×*]\s*(\d+)\s*[x×*]\s*(\d+)/i);
    if (m) {
      return { length: parseInt(m[1]), width: parseInt(m[2]), height: parseInt(m[3]) };
    }
    const m2 = sizeStr.match(/(\d+)\s*[x×*]\s*(\d+)/i);
    if (m2) {
      return { length: parseInt(m2[1]), width: parseInt(m2[2]), height: 10 };
    }
  }
  return { length: 20, width: 15, height: 10 };
}

export function mapOneBoundItemToProduct(item: OneBoundItem): Product {
  const translatedNl = item.title_nl || '';
  const cleanedZh = item.title_zh || cleanTitle(item.title || 'Product').orig;
  const orig = item.title_original || item.title || cleanedZh;
  const nl = translatedNl || cleanTitle(item.title || 'Product').nl;
  const weight = parseWeight(item.weight, item.size);
  const dims = parseDimensions(item.size);
  const priceRmb = parseFloat(item.price) || 0;
  const imageUrl = item.pic_url
    ? (item.pic_url.startsWith('//') ? `https:${item.pic_url}` : item.pic_url)
    : '';

  return {
    id: `1688-${item.num_iid}`,
    merchant: '1688' as Merchant,
    title: orig,
    titleNl: nl || orig,
    category: mapCategory(`${orig} ${nl}`),
    priceRmb,
    weightKg: weight,
    lengthCm: dims.length,
    widthCm: dims.width,
    heightCm: dims.height,
    imageUrl,
    sizes: ['Standaard'],
    colors: ['Standaard'],
    originalUrl: item.detail_url || `https://detail.1688.com/offer/${item.num_iid}.html`,
    qcInstructionEn: 'QC: check product quality, quantity, and packaging before shipping.',
  };
}

export interface SearchResult {
  products: Product[];
  error: string;
  translatedQuery?: string;
}

export async function search1688(query: string): Promise<SearchResult> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) return { products: [], error: 'Supabase niet geconfigureerd.' };

  try {
    const apiUrl = `${supabaseUrl}/functions/v1/onebound-1688`;
    const resp = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${anonKey}`,
      },
      body: JSON.stringify({ q: query, action: 'search' }),
    });

    if (!resp.ok) {
      let errMsg = `Server fout (${resp.status})`;
      try {
        const errData = await resp.json();
        if (errData?.error) errMsg = errData.error;
      } catch {}
      return { products: [], error: errMsg };
    }

    const data = await resp.json();

    if (data?.error) {
      return { products: [], error: data.error };
    }

    const items: OneBoundItem[] = data?.items?.item || data?.items || [];
    if (!Array.isArray(items) || items.length === 0) {
      return { products: [], error: '', translatedQuery: data?._translation?.translatedQuery };
    }
    const products = items.slice(0, 20).map(mapOneBoundItemToProduct);
    return { products, error: '', translatedQuery: data?._translation?.translatedQuery };
  } catch (err) {
    return { products: [], error: err instanceof Error ? err.message : 'Netwerkfout bij zoeken op 1688.' };
  }
}

export interface GetItemResult {
  product: Product | null;
  error: string;
}

export async function get1688Item(itemId: string): Promise<GetItemResult> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) return { product: null, error: 'Supabase niet geconfigureerd.' };

  try {
    const apiUrl = `${supabaseUrl}/functions/v1/onebound-1688`;
    const resp = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${anonKey}`,
      },
      body: JSON.stringify({ item_id: itemId, action: 'get' }),
    });

    if (!resp.ok) {
      let errMsg = `Server fout (${resp.status})`;
      try {
        const errData = await resp.json();
        if (errData?.error) errMsg = errData.error;
      } catch {}
      return { product: null, error: errMsg };
    }

    const data = await resp.json();

    if (data?.error) {
      return { product: null, error: data.error };
    }

    const item: OneBoundItem = data?.item || data?.items?.item?.[0];
    if (!item) return { product: null, error: 'Product niet gevonden op 1688.' };
    return { product: mapOneBoundItemToProduct(item), error: '' };
  } catch (err) {
    return { product: null, error: err instanceof Error ? err.message : 'Netwerkfout bij ophalen 1688 product.' };
  }
}

export function extract1688ItemId(url: string): string | null {
  const m = url.match(/detail\.1688\.com\/offer\/(\d+)\.html/);
  if (m) return m[1];
  const m2 = url.match(/(\d{6,})/);
  return m2 ? m2[1] : null;
}
