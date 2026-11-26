import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://supabase.co';
const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_bNEfTdIyypEGdFNSnftbbQ_8lp5j-k3';

let client: SupabaseClient | null = null;
let warnLogged = false;

export function getSupabase(): SupabaseClient | null {
  if (client) return client;
  try {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
    client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false },
    });
    return client;
  } catch (err) {
    if (!warnLogged) {
      warnLogged = true;
      console.warn('[ChiNed] Supabase client niet beschikbaar — localStorage fallback actief.', err);
    }
    return null;
  }
}

const TABLES = {
  settings: 'app_settings',
  proofs: 'price_proofs',
  orders: 'orders',
  products: 'products',
} as const;

export async function upsertSettings(settings: Record<string, unknown>, legal: Record<string, unknown>): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  try {
    await sb.from(TABLES.settings).upsert({ id: 'default', settings, legal, updated_at: new Date().toISOString() });
  } catch (err) {
    console.warn('[ChiNed] Sync instellingen mislukt (localStorage blijft actief).', err);
  }
}

export async function upsertProofs(proofs: Record<string, unknown>[]): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  try {
    const rows = proofs.map((proof) => ({ id: String(proof.id ?? `proof-${Date.now()}`), proof, updated_at: new Date().toISOString() }));
    if (rows.length === 0) return;
    await sb.from(TABLES.proofs).upsert(rows);
  } catch (err) {
    console.warn('[ChiNed] Sync prijsbewijzen mislukt (localStorage blijft actief).', err);
  }
}

export async function insertOrder(order: Record<string, unknown>): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  try {
    await sb.from(TABLES.orders).upsert({ id: String(order.id ?? `order-${Date.now()}`), order_data: order, updated_at: new Date().toISOString() });
  } catch (err) {
    console.warn('[ChiNed] Sync bestelling mislukt (localStorage blijft actief).', err);
  }
}

export async function fetchRemoteSettings(): Promise<{ settings?: Record<string, unknown>; legal?: Record<string, unknown> } | null> {
  const sb = getSupabase();
  if (!sb) return null;
  try {
    const { data, error } = await sb.from(TABLES.settings).select('settings, legal').eq('id', 'default').maybeSingle();
    if (error || !data) return null;
    return { settings: data.settings as Record<string, unknown>, legal: data.legal as Record<string, unknown> };
  } catch {
    return null;
  }
}

export async function fetchRemoteProofs(): Promise<Record<string, unknown>[] | null> {
  const sb = getSupabase();
  if (!sb) return null;
  try {
    const { data, error } = await sb.from(TABLES.proofs).select('proof');
    if (error || !data) return null;
    return data.map((row) => row.proof as Record<string, unknown>);
  } catch {
    return null;
  }
}

export async function fetchRemoteProducts(): Promise<Record<string, unknown>[] | null> {
  const sb = getSupabase();
  if (!sb) return null;
  try {
    const { data, error } = await sb.from(TABLES.products).select('product_data');
    if (error || !data) return null;
    return data.map((row) => row.product_data as Record<string, unknown>);
  } catch {
    return null;
  }
}

export async function upsertProduct(product: Record<string, unknown>): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  try {
    await sb.from(TABLES.products).upsert({
      id: String(product.id ?? `prod-${Date.now()}`),
      product_data: product,
      updated_at: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('[ChiNed] Sync product mislukt (localStorage blijft actief).', err);
  }
}

export async function deleteRemoteProduct(id: string): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  try {
    await sb.from(TABLES.products).delete().eq('id', id);
  } catch (err) {
    console.warn('[ChiNed] Verwijder product mislukt (localStorage blijft actief).', err);
  }
}

export async function deleteAllRemoteProducts(): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  try {
    await sb.from(TABLES.products).delete().neq('id', '00000000-0000-0000-0000-000000000000');
  } catch (err) {
    console.warn('[ChiNed] Verwijder alle producten mislukt (localStorage blijft actief).', err);
  }
}
