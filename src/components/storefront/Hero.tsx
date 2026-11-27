import { ExternalLink, ShieldCheck, Leaf, Languages, Camera, X, ChevronDown, HelpCircle, Plus, Trash2, ShoppingBag, Bookmark, Check, Plane, Train, Volume2, VolumeX, ArrowLeft, Package, Search, Loader2, Truck, Eye, Clock } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { formatEur } from '@/lib/pricing';
import { detectWeightAndCategory, calculateChinedAllInEur, calculateChinedPrice, type FreightMode } from '@/lib/bundleBuilder';
import { search1688, get1688Item, extract1688ItemId } from '@/lib/onebound';
import type { Merchant, BundleBuilderItem, Product } from '@/lib/types';

interface Props {
  onSearch: (query: string, merchant: Merchant | 'all') => void;
}

const MERCHANT_SITES: Record<Merchant, { translatedUrl: string; siteLabel: string }> = {
  '1688': { translatedUrl: 'https://www.1688.com', siteLabel: '1688.com' },
  'shein': { translatedUrl: 'https://www.shein.com', siteLabel: 'Shein.com' },
  'temu': { translatedUrl: 'https://www.temu.com', siteLabel: 'Temu.com' },
  'aliexpress': { translatedUrl: 'https://www.aliexpress.com', siteLabel: 'AliExpress.com' },
};

const BULKY_KEYWORDS = ['koffer', 'trolley', 'suitcase', 'box', 'opberg', 'kussen', 'pillow', 'tas', 'rugzak', 'mand'];
const STANDARD_WEIGHT_KG = 0.35;

function isBulkyText(text: string): boolean {
  const lower = text.toLowerCase();
  return BULKY_KEYWORDS.some(kw => lower.includes(kw));
}

function parseYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

const TRUST_BADGES = [
  { icon: ShieldCheck, text: '100% Transparante Fabrieksprijs (Geen verborgen dropship-opslagen)', color: 'text-emerald-600' },
  { icon: Truck, text: 'Geconsolideerde B2B-import via Rotterdam (Geen € 6,05 losse EU-pakkettoeslagen)', color: 'text-blue-600' },
  { icon: Camera, text: 'Kwaliteitscontrole (QC) met foto in China vóór verzending', color: 'text-orange-600' },
  { icon: ShieldCheck, text: 'Veilig betalen (iDEAL / Klarna / Bancontact) & 14 dagen Nederlandse zichttermijn', color: 'text-purple-600' },
];

export default function Hero({ onSearch }: Props) {
  const { legal, settings, addToCart, products, addProcurementRequest, customerUser, setCartOpen } = useStore();
  const [photoName, setPhotoName] = useState('');
  const [photoPreview, setPhotoPreview] = useState('');
  const [photoMatchOpen, setPhotoMatchOpen] = useState(false);
  const [targetPrice, setTargetPrice] = useState('');
  const [helpOpen, setHelpOpen] = useState(false);

  const [calcUrl, setCalcUrl] = useState('');
  const [calcPrice, setCalcPrice] = useState('');
  const [calcCurrency, setCalcCurrency] = useState<'EUR' | 'RMB'>('EUR');
  const [calcPhoto, setCalcPhoto] = useState('');
  const [calcPhotoName, setCalcPhotoName] = useState('');
  const [calcTemuPrice, setCalcTemuPrice] = useState('');
  const [freightMode, setFreightMode] = useState<FreightMode>('air');
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [bundleItems, setBundleItems] = useState<BundleBuilderItem[]>([]);
  const [showBundleShowdown, setShowBundleShowdown] = useState(false);
  const [bookmarkCopied, setBookmarkCopied] = useState(false);



  // Live 1688 search state
  const [liveSearchQuery, setLiveSearchQuery] = useState('');
  const [liveResults, setLiveResults] = useState<Product[]>([]);
  const [liveSearching, setLiveSearching] = useState(false);
  const [liveError, setLiveError] = useState('');
  const [liveSearchDone, setLiveSearchDone] = useState(false);

  const [videoMuted, setVideoMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleUnmute = () => {
    setVideoMuted(false);
    if (videoRef.current) {
      videoRef.current.muted = false;
      videoRef.current.volume = 0.8;
      videoRef.current.play().catch(() => {});
    }
  };
  const handleMute = () => {
    setVideoMuted(true);
    if (videoRef.current) videoRef.current.muted = true;
  };

  const bookmarkletCode = `javascript:(function(){var u=document.location.href;var t=document.title;var p=prompt('Kopieer de 1688-prijs (in ¥ of €):','');if(p!==null){window.open('https://chined.nl/?url='+encodeURIComponent(u)+'&price='+encodeURIComponent(p)+'&title='+encodeURIComponent(t),'_blank');}})();`;

  const handleCopyBookmark = () => {
    navigator.clipboard.writeText(bookmarkletCode);
    setBookmarkCopied(true);
    setTimeout(() => setBookmarkCopied(false), 2500);
  };

  const detected = detectWeightAndCategory(`${calcUrl} ${calcPhotoName}`);
  const calcPriceNum = parseFloat(calcPrice) || 0;
  const factoryPriceEur = calcCurrency === 'RMB' ? calcPriceNum * settings.rmbToEurRate : calcPriceNum;

  const chargeableWeight = Math.max(0.05, detected.weightKg || STANDARD_WEIGHT_KG);

  const bulkyDetected = isBulkyText(`${calcUrl} ${calcPhotoName} ${detected.label}`);

  const breakdown = calculateChinedAllInEur(factoryPriceEur, chargeableWeight, freightMode, {
    airRatePerKg: settings.airRatePerKg,
    railRatePerKg: settings.railRatePerKg,
    b2bDutyPct: settings.b2bDutyPct,
    dutchVatPct: settings.dutchVatPct,
  });
  const temuPriceNum = parseFloat(calcTemuPrice) || 0;
  const canAddToBundle = calcUrl && calcPriceNum > 0;
  const freightRateLabel = freightMode === 'air' ? `${formatEur(settings.airRatePerKg)}/kg luchtvracht` : `${formatEur(settings.railRatePerKg)}/kg treinvracht`;
  const deliveryLabel = freightMode === 'air' ? '8-12 dagen' : '25-30 dagen';

  // Auto-fetch when a 1688 link is pasted
  useEffect(() => {
    const itemId = extract1688ItemId(calcUrl);
    if (!itemId || calcPriceNum > 0) return;
    let cancelled = false;
    (async () => {
      const result = await get1688Item(itemId);
      if (cancelled || !result.product) return;
      const product = result.product;
      if (product.priceRmb > 0) {
        setCalcPrice(String(product.priceRmb));
        setCalcCurrency('RMB');
      }
    })();
    return () => { cancelled = true; };
  }, [calcUrl]);

  const handleLiveSearch = async () => {
    if (!liveSearchQuery.trim()) return;
    setLiveSearching(true);
    setLiveError('');
    setLiveResults([]);
    setLiveSearchDone(false);

    const itemId = extract1688ItemId(liveSearchQuery);
    if (itemId) {
      const result = await get1688Item(itemId);
      if (result.product) {
        setLiveResults([result.product]);
      } else {
        setLiveError(result.error || 'Kon dit 1688-product niet ophalen. Controleer de link of probeer een zoekwoord.');
      }
    } else {
      const result = await search1688(liveSearchQuery);
      if (result.products.length > 0) {
        setLiveResults(result.products);
      } else {
        setLiveError(result.error || 'Geen resultaten gevonden. Probeer een ander zoekwoord (bijv. "siliconen keukengerei").');
      }
    }
    setLiveSearching(false);
    setLiveSearchDone(true);
  };

  const handleAddLiveToBundle = (product: Product) => {
    addProcurementRequest({
      id: `req-${Date.now()}`,
      createdAt: new Date().toISOString(),
      customerName: customerUser?.name,
      customerEmail: customerUser?.email,
      items: [{ id: `bbi-${Date.now()}`, url: product.originalUrl, priceEur: 0, currency: 'RMB', photoDataUrl: '', detectedWeightKg: product.weightKg, detectedCategory: product.category, chinedAllInEur: 0, source: 'lookup-request' }],
      status: 'Nieuw',
    });
  };

  const handleAddToBundle = () => {
    if (!canAddToBundle) return;
    const item: BundleBuilderItem = {
      id: `bbi-${Date.now()}`,
      url: calcUrl,
      priceEur: factoryPriceEur,
      currency: calcCurrency,
      photoDataUrl: calcPhoto,
      temuPriceEur: temuPriceNum || undefined,
      detectedWeightKg: chargeableWeight,
      detectedCategory: detected.category,
      chinedAllInEur: breakdown.allIn,
      source: 'direct',
    };
    setBundleItems([...bundleItems, item]);
    setCalcUrl(''); setCalcPrice(''); setCalcPhoto(''); setCalcPhotoName(''); setCalcTemuPrice(''); setShowBreakdown(false);
    setShowBundleShowdown(true);
  };

  const handleLookupRequest = () => {
    if (!calcPhoto) return;
    const item: BundleBuilderItem = {
      id: `bbi-${Date.now()}`,
      url: calcUrl || '(geen link — alleen foto)',
      priceEur: temuPriceNum || 0,
      currency: 'EUR',
      photoDataUrl: calcPhoto,
      temuPriceEur: temuPriceNum || undefined,
      detectedWeightKg: chargeableWeight,
      detectedCategory: detected.category,
      chinedAllInEur: 0,
      source: 'lookup-request',
    };
    setBundleItems([...bundleItems, item]);
    setCalcUrl(''); setCalcPrice(''); setCalcPhoto(''); setCalcPhotoName(''); setCalcTemuPrice('');
    setShowBundleShowdown(true);
  };

  const handleSendBundle = () => {
    const req = {
      id: `req-${Date.now()}`,
      createdAt: new Date().toISOString(),
      customerName: customerUser?.name,
      customerEmail: customerUser?.email,
      items: bundleItems,
      status: 'Nieuw' as const,
    };
    addProcurementRequest(req);
    setBundleItems([]);
    setShowBundleShowdown(false);
  };

  const bundleTemuTotal = bundleItems.reduce((s, i) => s + (i.temuPriceEur || 0), 0);
  const bundleChinedTotal = bundleItems.reduce((s, i) => s + i.chinedAllInEur, 0);
  const bundleSavings = bundleTemuTotal - bundleChinedTotal;
  const euLevies = bundleItems.length * 6.05;

  const ytId = settings.explainerVideoUrl ? parseYouTubeId(settings.explainerVideoUrl) : null;
  const isMp4 = settings.explainerVideoUrl.toLowerCase().endsWith('.mp4');

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white">
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `radial-gradient(circle at 1px 1px, #0f172a 1px, transparent 0)`, backgroundSize: '32px 32px' }} />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <div className="text-center max-w-3xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full text-xs font-semibold mb-4"><Leaf className="w-4 h-4" /> B2B2C sourcing vanuit China</div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight mb-4">{legal.heroBanner}</h1>
          <p className="text-slate-600 text-base sm:text-lg">Shein, AliExpress en Temu zijn jouw etalage. Wij zoeken hetzelfde of vergelijkbare product goedkoper in China via 1688 en andere sourcing-sites.</p>
        </div>

        {/* Trust & Comfort Badges */}
        <div className="max-w-5xl mx-auto mb-6 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {TRUST_BADGES.map((badge, i) => (
            <div key={i} className="flex items-center gap-2.5 bg-white rounded-xl border border-slate-200 px-3 py-2.5">
              <badge.icon className={`w-5 h-5 ${badge.color} flex-shrink-0`} />
              <p className="text-xs font-medium text-slate-700 leading-tight">{badge.text}</p>
            </div>
          ))}
        </div>

        <div className="max-w-4xl mx-auto">
          {/* 2-Column Hero Grid: 3-step guide + explainer video side-by-side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start mb-6">
            {/* 3-step guide */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5">
              <h2 className="text-sm font-bold text-slate-900 mb-3">Zo werkt ChiNed in 3 stappen</h2>
              <ol className="space-y-3">
                <li className="flex gap-2.5">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-600 text-white text-xs font-bold flex items-center justify-center">1</span>
                  <p className="text-xs text-slate-700 leading-relaxed"><b className="text-slate-900">Heb je een leuk product gezien op Temu, Shein of AliExpress?</b> Maak er een foto of screenshot van, plak de link in de ChiNed zoekbalk hieronder, en wij zoeken direct de fabrieksprijs op 1688.com.</p>
                </li>
                <li className="flex gap-2.5">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">2</span>
                  <p className="text-xs text-slate-700 leading-relaxed"><b className="text-slate-900">Vul hieronder de 1688-prijs in</b> en zet jouw Temu/Shein-prijs ernaast. Gewicht is standaard 0,35 kg — aangepast op productcategorie.</p>
                </li>
                <li className="flex gap-2.5">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">3</span>
                  <p className="text-xs text-slate-700 leading-relaxed"><b className="text-slate-900">Zie direct jouw all-in eindprijs</b> (inclusief btw en verzending) en voeg <b className="text-emerald-600">6 items</b> toe om tot 50% te besparen zonder € 6,05 EU-pakkettoeslagen.</p>
                </li>
              </ol>
            </div>

            {/* Explainer video box — always visible, w-full overflow-hidden */}
            <div className="w-full overflow-hidden">
              <div className="relative rounded-2xl overflow-hidden shadow-lg border border-slate-200 bg-slate-900 aspect-video min-h-[180px] flex items-center justify-center">
                {ytId ? (
                  <iframe
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&loop=1&playlist=${ytId}&controls=0&modestbranding=1&playsinline=1&rel=0`}
                    title="ChiNed uitleg-video"
                    allow="autoplay; encrypted-media; picture-in-picture"
                    allowFullScreen
                  />
                ) : isMp4 ? (
                  <video
                    ref={videoRef}
                    src={settings.explainerVideoUrl}
                    autoPlay
                    muted={videoMuted}
                    loop
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-center p-6">
                    <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center mb-3"><Volume2 className="w-7 h-7 text-white/70" /></div>
                    <p className="text-sm font-bold text-white mb-1">Uitleg-video (25 sec): Zo werkt ChiNed</p>
                    <p className="text-xs text-white/50">Plak videolink in Admin Tab 2</p>
                  </div>
                )}
                {(ytId || isMp4) && (
                  <button
                    onClick={videoMuted ? handleUnmute : handleMute}
                    className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-white/90 hover:bg-white text-slate-900 shadow-md backdrop-blur transition-all"
                  >
                    {videoMuted ? <><VolumeX className="w-4 h-4" /> Geluid aanzetten</> : <><Volume2 className="w-4 h-4" /> Geluid uit</>}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Etalage links (inspiratie) */}
          <div className="bg-white rounded-xl border border-slate-200 p-3 mb-6">
            <p className="text-xs font-bold text-slate-900 mb-2">1. Kies een Etalage <span className="font-normal text-slate-400">(Inspiratie & Prijsvergelijking)</span></p>
            <div className="flex flex-wrap gap-2">
              {(['temu', 'shein', 'aliexpress'] as Merchant[]).map(m => {
                const site = MERCHANT_SITES[m];
                return (
                  <a key={m} href={site.translatedUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-600 transition-all">
                    <ExternalLink className="w-3.5 h-3.5" /> {site.siteLabel}
                  </a>
                );
              })}
            </div>
          </div>

          {/* Live 1688 Search Bar */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-4 sm:p-5 mb-4">
            <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2"><Search className="w-4 h-4 text-orange-600" /> Zoek live op 1688.com — directe fabrieksprijs</h2>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={liveSearchQuery}
                  onChange={e => setLiveSearchQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLiveSearch()}
                  placeholder="Zoekwoord (bijv. 'siliconen keukengerei') of plak 1688 link..."
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none"
                />
              </div>
              <button
                onClick={handleLiveSearch}
                disabled={!liveSearchQuery.trim() || liveSearching}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold ${liveSearchQuery.trim() && !liveSearching ? 'bg-orange-600 hover:bg-orange-700 text-white' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
              >
                {liveSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                {liveSearching ? 'Zoeken...' : 'Zoek'}
              </button>
            </div>
            {liveError && <p className="text-xs text-red-500 mt-2">{liveError}</p>}
            {liveSearchDone && !liveError && liveResults.length === 0 && (
              <p className="text-xs text-slate-400 mt-2">Geen resultaten gevonden.</p>
            )}

            {/* Live 1688 Search Results */}
            {liveResults.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-xs font-semibold text-slate-700 flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600" /> {liveResults.length} producten gevonden op 1688.com</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto">
                  {liveResults.map(product => {
                    const price = calculateChinedPrice(product.priceRmb, settings.rmbToEurRate, product.weightKg, product.lengthCm, product.widthCm, product.heightCm, freightMode, {
                      airRatePerKg: settings.airRatePerKg, railRatePerKg: settings.railRatePerKg, b2bDutyPct: settings.b2bDutyPct, dutchVatPct: settings.dutchVatPct,
                    });
                    return (
                      <div key={product.id} className="flex gap-3 bg-slate-50 rounded-xl p-3 border border-slate-200">
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt="" className="w-16 h-16 rounded-lg object-cover bg-white flex-shrink-0" />
                        ) : (
                          <div className="w-16 h-16 rounded-lg bg-slate-200 flex items-center justify-center flex-shrink-0"><Package className="w-6 h-6 text-slate-400" /></div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-slate-900 line-clamp-2">{product.titleNl}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">¥{product.priceRmb.toFixed(2)} · {product.weightKg.toFixed(2)} kg</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm font-bold text-orange-600">{formatEur(price.allIn)}</span>
                            <span className="text-[9px] text-slate-400 line-through">{formatEur(price.etalageprijs)}</span>
                          </div>
                          <button
                            onClick={() => handleAddLiveToBundle(product)}
                            className="mt-1.5 w-full py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-semibold flex items-center justify-center gap-1"
                          >
                            <Clock className="w-3 h-3" /> Vraag aan voor Rotterdam-drop (vrijblijvend)
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 1688 Direct Calculator */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-4 sm:p-5 mb-4">
            <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2"><Calculator /> 1688 Direct Calculator — Jouw eerlijke all-in eindprijs</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-600 block mb-1">1688 Productlink (URL)</label>
                <input type="text" value={calcUrl} onChange={e => setCalcUrl(e.target.value)} placeholder="https://detail.1688.com/offer/..." className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none" />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">1688 Fabrieksprijs</label>
                <div className="flex gap-1">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">{calcCurrency === 'EUR' ? '€' : '¥'}</span>
                    <input type="number" value={calcPrice} onChange={e => setCalcPrice(e.target.value)} placeholder="bijv. 15,00" className="w-full pl-7 pr-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-orange-400 outline-none" />
                  </div>
                  <button onClick={() => setCalcCurrency(calcCurrency === 'EUR' ? 'RMB' : 'EUR')} className="px-3 py-2.5 rounded-lg bg-slate-100 text-xs font-semibold text-slate-700 hover:bg-slate-200">{calcCurrency === 'EUR' ? '€ EUR' : '¥ RMB'}</button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Productfoto / Screenshot upload</label>
                <label className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-dashed border-orange-300 bg-orange-50 text-orange-700 text-sm font-semibold cursor-pointer hover:bg-orange-100">
                  <Camera className="w-4 h-4" /> {calcPhotoName || 'Upload foto'}
                  <input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) { const r = new FileReader(); r.onload = () => { setCalcPhoto(String(r.result)); }; r.readAsDataURL(f); setCalcPhotoName(f.name); } }} />
                </label>
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-600 block mb-1">Optioneel: Jouw Temu/Shein Prijs (€) — voor live side-by-side vergelijking</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">€</span>
                  <input type="number" value={calcTemuPrice} onChange={e => setCalcTemuPrice(e.target.value)} placeholder="bijv. 19,95" className="w-full pl-7 pr-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-orange-400 outline-none" />
                </div>
              </div>
            </div>

            {/* Auto-detected weight + result */}
            {calcPriceNum > 0 && (
              <div className="mt-4 bg-slate-50 rounded-xl p-4">
                <div className="flex flex-wrap gap-2 mb-3">
                  <button onClick={() => setFreightMode('air')} className={`flex-1 min-w-[160px] flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${freightMode === 'air' ? 'bg-orange-600 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:border-orange-300'}`}><Plane className="w-3.5 h-3.5" /> Luchtvracht ({formatEur(settings.airRatePerKg)}/kg • 8-12 dagen)</button>
                  <button onClick={() => setFreightMode('train')} className={`flex-1 min-w-[160px] flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${freightMode === 'train' ? 'bg-emerald-600 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:border-emerald-300'}`}><Train className="w-3.5 h-3.5" /> Duurzame Treinvracht ({formatEur(settings.railRatePerKg)}/kg • 25-30 dagen)</button>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-500">Berekend gewicht: <b className="text-slate-700">{detected.label}</b> • {chargeableWeight.toFixed(2)} kg • <span className="text-orange-600 font-semibold">{freightMode === 'air' ? 'Luchtvracht' : 'Treinvracht'} • {deliveryLabel}</span></span>
                  <span className="text-xs text-slate-400">(gebaseerd op invoer + foto/naam)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-900">All-in ChiNed Eindprijs (incl. {settings.dutchVatPct}% BTW)</span>
                  <span className="text-xl font-bold text-orange-600">{formatEur(breakdown.allIn)}</span>
                </div>
                {temuPriceNum > 0 && (
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-slate-500">Jouw Temu-prijs + € 6,05 EU-toeslag</span>
                    <span className="text-xs font-semibold text-slate-600 line-through">{formatEur(temuPriceNum + 6.05)}</span>
                  </div>
                )}
                {temuPriceNum > 0 && (
                  <div className="flex items-center justify-between mt-1 bg-emerald-50 rounded-lg px-2 py-1">
                    <span className="text-xs text-emerald-700 font-medium">Jouw besparing</span>
                    <span className="text-sm font-bold text-emerald-600">{formatEur(temuPriceNum + 6.05 - breakdown.allIn)}</span>
                  </div>
                )}
                <button onClick={() => setShowBreakdown(!showBreakdown)} className="mt-3 flex items-center gap-1 text-xs font-semibold text-orange-700 hover:text-orange-800"><ChevronDown className={`w-3.5 h-3.5 transition-transform ${showBreakdown ? 'rotate-180' : ''}`} /> Bekijk opbouw eindprijs</button>
                {showBreakdown && (
                  <div className="mt-2 space-y-1 text-xs text-slate-600 pl-2 border-l-2 border-orange-200">
                    <BreakRow label="1688 fabrieksprijs" value={formatEur(factoryPriceEur)} />
                    <BreakRow label="6% inkoop- & QC-fee" value={formatEur(breakdown.fee)} />
                    <BreakRow label="€ 1,20 China binnenlands" value={formatEur(breakdown.chinaShip)} />
                    <BreakRow label={`${freightRateLabel} (${chargeableWeight.toFixed(2)} kg)`} value={formatEur(breakdown.freight)} />
                    <BreakRow label={`${settings.b2bDutyPct}% B2B douane`} value={formatEur(breakdown.duty)} />
                    <BreakRow label="€ 0,75 Rotterdam sorteerhub & bezorging" value={formatEur(breakdown.hub)} />
                    <BreakRow label="€ 0,50 retour buffer" value={formatEur(breakdown.returnBuffer)} />
                    <BreakRow label="€ 0,75 ChiNed scan fee" value={formatEur(breakdown.scanFee)} />
                    <BreakRow label="Subtotaal excl. BTW" value={formatEur(breakdown.costExVat)} bold />
                    <BreakRow label={`${settings.dutchVatPct}% BTW`} value={formatEur(breakdown.vat)} />
                    <BreakRow label="All-in eindprijs" value={formatEur(breakdown.allIn)} bold large />
                  </div>
                )}
                <div className="flex gap-2 mt-4">
                  <button onClick={handleAddToBundle} disabled={!canAddToBundle} className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-semibold ${canAddToBundle ? 'bg-orange-600 hover:bg-orange-700 text-white' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}><Plus className="w-4 h-4" /> Voeg toe aan 6-Bundel ({bundleItems.length}/6)</button>
                  <button onClick={handleLookupRequest} disabled={!calcPhoto} className={`flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold ${calcPhoto ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}>Vraag ChiNed om dit op 1688 te zoeken</button>
                </div>
              </div>
            )}
          </div>

          {/* 6-Item Bundle Showdown */}
          {showBundleShowdown && bundleItems.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg border-2 border-emerald-300 p-4 sm:p-5 mb-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2"><ShoppingBag className="w-4 h-4 text-emerald-600" /> Jouw 6-Bundel ({bundleItems.length}/6)</h2>
                <button onClick={() => setShowBundleShowdown(false)} className="p-1 rounded-lg hover:bg-slate-100"><X className="w-4 h-4 text-slate-400" /></button>
              </div>
              <div className="space-y-2 mb-3">
                {bundleItems.map((item, i) => (
                  <div key={item.id} className="flex items-center gap-2 bg-slate-50 rounded-lg p-2">
                    {item.photoDataUrl ? <img src={item.photoDataUrl} alt="" className="w-10 h-10 rounded object-cover bg-white flex-shrink-0" /> : <div className="w-10 h-10 rounded bg-slate-200 flex items-center justify-center text-[10px] text-slate-400">#{i + 1}</div>}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-700 truncate">{item.url.length > 40 ? item.url.slice(0, 40) + '…' : item.url}</p>
                      <p className="text-[10px] text-slate-400">{item.source === 'lookup-request' ? 'Opzoekverzoek (admin zoekt 1688-prijs)' : `${formatEur(item.chinedAllInEur)} all-in • ${item.detectedWeightKg} kg`}</p>
                    </div>
                    <button onClick={() => setBundleItems(bundleItems.filter(b => b.id !== item.id))} className="p-1 text-slate-300 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                ))}
              </div>
              {bundleItems.length >= 6 && (
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <ShowdownStat label="Jouw Temu totaal + EU-heffingen" value={formatEur(bundleTemuTotal + euLevies)} color="text-slate-600" />
                  <ShowdownStat label="ChiNed 6-Bundel all-in (incl. BTW)" value={formatEur(bundleChinedTotal)} color="text-orange-600" />
                  <ShowdownStat label="Jouw totale besparing" value={formatEur(bundleTemuTotal + euLevies - bundleChinedTotal)} color="text-emerald-600" />
                </div>
              )}
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-slate-500">EU-pakketheffingen vermeden (6 × € 6,05)</span>
                <span className="text-xs font-bold text-emerald-600">{formatEur(euLevies)}</span>
              </div>
              <button onClick={handleSendBundle} disabled={bundleItems.length < settings.minBundleItems} className={`w-full py-3 rounded-xl font-semibold text-sm ${bundleItems.length >= settings.minBundleItems ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}>
                {bundleItems.length >= settings.minBundleItems ? 'Bestel deze 6-Bundel direct via ChiNed' : `Nog ${settings.minBundleItems - bundleItems.length} items nodig voor je 6-bundel`}
              </button>
              {bundleItems.length < settings.minBundleItems && (
                <p className="text-[10px] text-slate-400 text-center mt-2">Vul je bundel met extra 1688-links of upload meer Temu-screenshots.</p>
              )}
            </div>
          )}


        </div>
      </div>

      {photoMatchOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4" onClick={() => setPhotoMatchOpen(false)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-5" onClick={event => event.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <button onClick={() => setPhotoMatchOpen(false)} className="md:hidden flex items-center gap-1 text-sm font-semibold text-slate-600"><ArrowLeft className="w-4 h-4" /> Terug</button>
                <div><p className="text-xs uppercase tracking-wider text-orange-600 font-bold">Visuele match</p><h2 className="text-lg font-bold text-slate-900">ChiNed Fabrieksprijs-offerte</h2></div>
              </div>
              <button onClick={() => setPhotoMatchOpen(false)} className="hidden md:block p-2 rounded-lg hover:bg-slate-100"><X className="w-5 h-5" /></button>
            </div>
            <div className="grid sm:grid-cols-[160px_1fr] gap-4">
              <img src={photoPreview} alt="Geüploade productfoto" className="w-full h-36 object-cover rounded-xl bg-slate-100" />
              <div>
                <p className="text-sm text-slate-600">We hebben je foto ontvangen. Kies een vergelijkbaar catalogusproduct of vraag een exacte 1688-prijs op.</p>
                <label className="block text-xs font-semibold text-slate-600 mt-4">Je Temu-doelprijs (optioneel)<input value={targetPrice} onChange={event => setTargetPrice(event.target.value)} placeholder="bijv. 19,95" className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900" /></label>
              </div>
            </div>
            <div className="grid sm:grid-cols-3 gap-3 mt-5">
              {products.slice(0, 3).map(product => (
                <button key={product.id} onClick={() => { onSearch(product.titleNl, product.merchant); setPhotoMatchOpen(false); }} className="text-left rounded-xl border border-slate-200 p-2 hover:border-orange-400">
                  <img src={product.imageUrl} alt={product.titleNl} className="w-full h-20 object-cover rounded-lg" />
                  <p className="text-xs font-semibold text-slate-800 mt-2 line-clamp-2">{product.titleNl}</p>
                  <p className="text-[10px] text-orange-700 mt-1">Bekijk fabrieksprijs</p>
                </button>
              ))}
            </div>
            <button onClick={() => { onSearch(`Offerte voor ${photoName}${targetPrice ? `, doelprijs € ${targetPrice}` : ''}`, 'all'); setPhotoMatchOpen(false); }} className="w-full mt-5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white py-3 text-sm font-semibold">Stuur foto voor exacte ChiNed Fabrieksprijs-offerte</button>
          </div>
        </div>
      )}
    </section>
  );
}

function Calculator() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" x2="16" y1="6" y2="6"/><line x1="16" x2="16" y1="14" y2="18"/><path d="M16 10h.01"/><path d="M12 10h.01"/><path d="M8 10h.01"/><path d="M12 14h.01"/><path d="M8 14h.01"/><path d="M12 18h.01"/><path d="M8 18h.01"/></svg>;
}

function BreakRow({ label, value, bold, large }: { label: string; value: string; bold?: boolean; large?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-500">{label}</span>
      <span className={large ? 'text-sm font-bold text-orange-600' : bold ? 'font-bold text-slate-700' : 'text-slate-600'}>{value}</span>
    </div>
  );
}

function ShowdownStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-slate-50 rounded-lg p-2 text-center">
      <p className="text-[10px] text-slate-500 leading-tight">{label}</p>
      <p className={`text-sm font-bold ${color}`}>{value}</p>
    </div>
  );
}

function FeatureBadge({ icon, title, desc, color }: { icon: React.ReactNode; title: string; desc: string; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-3 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>{icon}</div>
      <div><p className="text-sm font-semibold text-slate-900">{title}</p><p className="text-xs text-slate-500">{desc}</p></div>
    </div>
  );
}
