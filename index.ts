import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const DEFAULT_KEY = "t_31647448998";
const DEFAULT_SECRET = "89988a49";
const API_BASE = "https://api-gw.onebound.cn/1688";

// --- Translation helpers (MyMemory free API, no key required) ---

async function translateText(
  text: string,
  sourceLang: string,
  targetLang: string,
): Promise<string> {
  if (!text || text.trim().length === 0) return text;
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}&de=chined@chined.nl`;
    const resp = await fetch(url, { headers: { Accept: "application/json" } });
    if (!resp.ok) return text;
    const data = await resp.json();
    const translated = data?.responseData?.translatedText;
    if (translated && translated !== text) return translated;
    return text;
  } catch {
    return text;
  }
}

// Detect if text is mostly Chinese characters
function isChinese(text: string): boolean {
  const chineseChars = (text.match(/[\u4e00-\u9fff]/g) || []).length;
  return chineseChars > text.length * 0.3;
}

// Detect if text is mostly Latin/Dutch/English
function isLatin(text: string): boolean {
  const latinChars = (text.match(/[a-zA-Z]/g) || []).length;
  return latinChars > text.length * 0.3;
}

// Translate a search query from Dutch/English to Simplified Chinese
async function translateQueryToChinese(query: string): Promise<{ original: string; translated: string }> {
  if (isChinese(query)) return { original: query, translated: query };
  // Try Dutch -> Chinese first, fall back to English -> Chinese
  const zh = await translateText(query, "nl", "zh-CN");
  if (zh && zh !== query && isChinese(zh)) {
    return { original: query, translated: zh };
  }
  // Try English source
  const zh2 = await translateText(query, "en", "zh-CN");
  if (zh2 && zh2 !== query && isChinese(zh2)) {
    return { original: query, translated: zh2 };
  }
  return { original: query, translated: query };
}

// Translate a Chinese product title back to Dutch
async function translateTitleToDutch(title: string): Promise<string> {
  if (!isChinese(title)) return title;
  const nl = await translateText(title, "zh-CN", "nl");
  if (nl && nl !== title) return nl;
  // Fallback: zh -> English
  const en = await translateText(title, "zh-CN", "en");
  return en && en !== title ? en : title;
}

// Clean up Chinese marketplace noise from titles
function cleanChineseTitle(raw: string): string {
  return raw
    .replace(/【[^】]*】/g, "")
    .replace(/\[[^\]]*\]/g, "")
    .replace(/\([^)]*批发\)/g, "")
    .replace(/批发/g, "")
    .replace(/厂家直销/g, "")
    .replace(/现货/g, "")
    .replace(/代发/g, "")
    .replace(/一件代发/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const queryParam = String(body.q || url.searchParams.get("q") || "").trim();
    const itemId = String(body.item_id || url.searchParams.get("item_id") || "").trim();
    const action = String(body.action || url.searchParams.get("action") || "search");

    let apiKey = DEFAULT_KEY;
    let apiSecret = DEFAULT_SECRET;

    // Load keys from Supabase settings if available
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || Deno.env.get("VITE_SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (supabaseUrl && serviceKey) {
      try {
        const sb = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
        const { data } = await sb
          .from("app_settings")
          .select("settings")
          .eq("id", "default")
          .maybeSingle();
        if (data?.settings) {
          const s = data.settings as Record<string, unknown>;
          if (s.oneboundKey) apiKey = String(s.oneboundKey);
          if (s.oneboundSecret) apiSecret = String(s.oneboundSecret);
        }
      } catch {
        // fall back to defaults
      }
    }

    // --- Action: item_get (single product by ID) ---
    if (action === "get" && itemId) {
      const apiUrl = `${API_BASE}/item_get/?key=${encodeURIComponent(apiKey)}&secret=${encodeURIComponent(apiSecret)}&num_iid=${encodeURIComponent(itemId)}&lang=nl`;
      const resp = await fetch(apiUrl, { headers: { Accept: "application/json" } });
      const json = await resp.json();

      // Surface OneBound API errors
      if (json.error) {
        return new Response(
          JSON.stringify({ error: `OneBound item_get fout: ${json.error}` }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      if (json.code && json.code !== "200" && json.msg) {
        return new Response(
          JSON.stringify({ error: `OneBound item_get fout (${json.code}): ${json.msg}` }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      // Translate the item title back to Dutch
      const rawItem = json?.item || json?.items?.item?.[0];
      if (rawItem?.title) {
        const cleaned = cleanChineseTitle(rawItem.title);
        rawItem.title_original = rawItem.title;
        rawItem.title_zh = cleaned;
        rawItem.title_nl = await translateTitleToDutch(cleaned);
      }

      return new Response(JSON.stringify(json), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- Action: item_search (keyword search) ---
    if (!queryParam) {
      return new Response(
        JSON.stringify({ error: "Geen zoekwoord opgegeven." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Translate the query to Chinese before searching OneBound
    const { original, translated } = await translateQueryToChinese(queryParam);
    const searchQuery = translated || queryParam;

    const apiUrl = `${API_BASE}/item_search/?key=${encodeURIComponent(apiKey)}&secret=${encodeURIComponent(apiSecret)}&q=${encodeURIComponent(searchQuery)}&page_size=20&sort=_sale&page=1`;
    const resp = await fetch(apiUrl, { headers: { Accept: "application/json" } });
    const json = await resp.json();

    // Surface OneBound API errors
    if (json.error) {
      return new Response(
        JSON.stringify({ error: `OneBound item_search fout: ${json.error}` }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (json.code && json.code !== "200" && json.msg) {
      return new Response(
        JSON.stringify({ error: `OneBound item_search fout (${json.code}): ${json.msg}` }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Translate all result titles back to Dutch
    const items = json?.items?.item || json?.items || [];
    if (Array.isArray(items) && items.length > 0) {
      const translatedItems = await Promise.all(
        items.slice(0, 20).map(async (item: Record<string, unknown>) => {
          const rawTitle = String(item.title || "");
          const cleaned = cleanChineseTitle(rawTitle);
          item.title_original = rawTitle;
          item.title_zh = cleaned;
          item.title_nl = await translateTitleToDutch(cleaned);
          return item;
        }),
      );
      if (json?.items?.item) {
        json.items.item = translatedItems;
      } else if (json?.items) {
        json.items = translatedItems;
      }
    }

    // Include translation metadata
    json._translation = {
      originalQuery: original,
      translatedQuery: searchQuery,
      wasTranslated: searchQuery !== original,
    };

    return new Response(JSON.stringify(json), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
