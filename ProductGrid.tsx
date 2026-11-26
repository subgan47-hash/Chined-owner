import { useStore } from '@/lib/store';
import type { Product, Merchant, Category } from '@/lib/types';
import { formatEur, checkRiskKeywords, checkParcelDimensions } from '@/lib/pricing';
import { calculateChinedPrice, type FreightMode } from '@/lib/bundleBuilder';
import { ShoppingBag, AlertTriangle, ExternalLink, ShieldCheck, Flame } from 'lucide-react';
import { useState } from 'react';

interface Props {
  filter: { query: string; merchant: Merchant | 'all' };
  onProductClick: (product: Product) => void;
}

const MERCHANT_BADGE: Record<Merchant, { label: string; class: string }> = {
  '1688': { label: '1688.com', class: 'bg-red-100 text-red-700' },
  'shein': { label: 'Shein', class: 'bg-pink-100 text-pink-700' },
  'temu': { label: 'Temu', class: 'bg-orange-100 text-orange-700' },
  'aliexpress': { label: 'AliExpress', class: 'bg-amber-100 text-amber-700' },
};

const CE_SAFE_CATEGORIES = ['Wonen', 'Opbergen', 'Keuken', 'Tech-accessoires', 'Auto & Fiets'];

type CategoryPill = 'all' | 'fillers' | Category;

const CATEGORY_PILLS: { key: CategoryPill; label: string }[] = [
  { key: 'all', label: 'Alles' },
  { key: 'fillers', label: 'Bundel-vullers < € 9,95' },
  { key: 'Wonen', label: 'Wonen & Interieur' },
  { key: 'Keuken', label: 'Keukengerei' },
  { key: 'Opbergen', label: 'Opbergen' },
  { key: 'Tech-accessoires', label: 'Tassen & Accessoires' },
  { key: 'Kleding', label: 'Mode & Accessoires' },
];

export default function ProductGrid({ filter, onProductClick }: Props) {
  const { products, settings, addToCart, cart, transportMode } = useStore();
  const [categoryPill, setCategoryPill] = useState<CategoryPill>('all');

  let filtered = products;
  if (filter.merchant !== 'all') {
    filtered = filtered.filter(p => p.merchant === filter.merchant);
  }
  if (filter.query) {
    const q = filter.query.toLowerCase();
    filtered = filtered.filter(p =>
      p.titleNl.toLowerCase().includes(q) ||
      p.title.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.originalUrl.includes(filter.query)
    );
  }
  if (categoryPill === 'fillers') {
    filtered = filtered.filter(p => {
      const price = calculateChinedPrice(p.priceRmb, settings.rmbToEurRate, p.weightKg, p.lengthCm, p.widthCm, p.heightCm, transportMode as FreightMode, {
        airRatePerKg: settings.airRatePerKg, railRatePerKg: settings.railRatePerKg, b2bDutyPct: settings.b2bDutyPct, dutchVatPct: settings.dutchVatPct,
      });
      return price.allIn < 9.95;
    });
  } else if (categoryPill !== 'all') {
    filtered = filtered.filter(p => p.category === categoryPill);
  }

  const ceSafe = (p: Product) => CE_SAFE_CATEGORIES.includes(p.category);
  filtered = [...filtered].sort((a, b) => {
    const aSafe = ceSafe(a) ? 0 : 1;
    const bSafe = ceSafe(b) ? 0 : 1;
    return aSafe - bSafe;
  });

  // Bundle progress bar
  const itemCount = cart.reduce((sum, ci) => sum + ci.quantity, 0);
  const minItems = settings.minBundleItems;
  const progress = Math.min(100, (itemCount / minItems) * 100);
  const remaining = Math.max(0, minItems - itemCount);

  if (filtered.length === 0) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CategoryPills active={categoryPill} onChange={setCategoryPill} />
        <BundleProgressBar itemCount={itemCount} minItems={minItems} progress={progress} remaining={remaining} />
        <div className="py-20 text-center">
          <p className="text-slate-400 text-lg">Geen producten gevonden. Probeer een andere zoekterm of categorie.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <CategoryPills active={categoryPill} onChange={setCategoryPill} />
      <BundleProgressBar itemCount={itemCount} minItems={minItems} progress={progress} remaining={remaining} />

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-900">
          {filter.merchant === 'all' ? 'Alle Producten' : MERCHANT_BADGE[filter.merchant].label + ' Producten'}
          <span className="text-slate-400 font-normal text-sm ml-2">({filtered.length})</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map(product => {
          const price = calculateChinedPrice(product.priceRmb, settings.rmbToEurRate, product.weightKg, product.lengthCm, product.widthCm, product.heightCm, transportMode as FreightMode, {
            airRatePerKg: settings.airRatePerKg, railRatePerKg: settings.railRatePerKg, b2bDutyPct: settings.b2bDutyPct, dutchVatPct: settings.dutchVatPct,
          });
          const chinedPrice = price.allIn;
          const etalageprijs = price.etalageprijs;
          const risk = checkRiskKeywords(product, settings);
          const dimBlock = checkParcelDimensions(product, settings);
          const isBlocked = risk.blocked || dimBlock.blocked;

          return (
            <div
              key={product.id}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg hover:border-slate-300 transition-all cursor-pointer group flex flex-col"
              onClick={() => onProductClick(product)}
            >
              <div className="relative aspect-square overflow-hidden bg-slate-50">
                <img src={product.imageUrl} alt={product.titleNl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                <div className="absolute top-2 left-2 flex gap-1.5">
                  <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${MERCHANT_BADGE[product.merchant].class}`}>
                    {MERCHANT_BADGE[product.merchant].label}
                  </span>
                </div>
                <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
                  <span className="text-[10px] font-medium px-2 py-1 rounded-full bg-white/90 text-slate-600 backdrop-blur">
                    {product.category}
                  </span>
                  {CE_SAFE_CATEGORIES.includes(product.category) && (
                    <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 flex items-center gap-0.5"><ShieldCheck className="w-2.5 h-2.5" /> EU-Veilig &amp; Bundel-Topper</span>
                  )}
                </div>
              </div>

              <div className="p-3 flex flex-col flex-1">
                <h3 className="text-sm font-medium text-slate-900 line-clamp-2 mb-2 min-h-[2.5rem]">{product.titleNl}</h3>

                {isBlocked ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-2 mb-2">
                    <p className="text-xs text-red-600 flex items-center gap-1 font-medium">
                      <AlertTriangle className="w-3 h-3 flex-shrink-0" /> Geblokkeerd
                    </p>
                    <p className="text-[10px] text-red-500 mt-0.5">{risk.reason || dimBlock.reason}</p>
                  </div>
                ) : (
                  <div className="mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">Etalageprijs: <span className="line-through">{formatEur(etalageprijs)}</span></span>
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-lg font-bold text-orange-600">{formatEur(chinedPrice)}</span>
                      <span className="text-[10px] text-emerald-600 font-medium">ChiNed sourcingprijs</span>
                    </div>
                  </div>
                )}

                <button
                  disabled={isBlocked}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (product.sizes.length > 0 || product.colors.length > 0) {
                      onProductClick(product);
                    } else {
                      addToCart(product, 'Standaard', product.colors[0] || 'Standaard', 1);
                    }
                  }}
                  className={`mt-auto w-full py-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                    isBlocked ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-slate-900 hover:bg-orange-600 text-white'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" /> {isBlocked ? 'Niet beschikbaar' : 'Voeg toe aan Bundel'}
                </button>

                <a
                  href={product.merchant === '1688' ? `https://translate.google.com/translate?sl=zh-CN&tl=nl&u=${encodeURIComponent(product.originalUrl)}` : product.originalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="mt-1.5 w-full py-1.5 rounded-lg text-[10px] font-medium text-slate-400 hover:text-orange-600 hover:bg-orange-50 border border-transparent hover:border-orange-100 transition-colors flex items-center justify-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" /> Bekijk op {MERCHANT_BADGE[product.merchant].label}
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function CategoryPills({ active, onChange }: { active: CategoryPill; onChange: (pill: CategoryPill) => void }) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {CATEGORY_PILLS.map(pill => (
        <button
          key={pill.key}
          onClick={() => onChange(pill.key)}
          className={`px-3 py-2 rounded-full text-xs font-semibold transition-all ${
            active === pill.key
              ? 'bg-orange-600 text-white shadow-md'
              : 'bg-white border border-slate-200 text-slate-600 hover:border-orange-300 hover:bg-orange-50'
          }`}
        >
          {pill.key === 'fillers' && <Flame className="w-3 h-3 inline mr-1" />}
          {pill.label}
        </button>
      ))}
    </div>
  );
}

function BundleProgressBar({ itemCount, minItems, progress, remaining }: { itemCount: number; minItems: number; progress: number; remaining: number }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-3 mb-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-slate-700">ChiNed Bundel Voortgang</span>
        <span className="text-xs font-bold text-orange-600">{itemCount}/{minItems} items</span>
      </div>
      <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${remaining === 0 ? 'bg-emerald-500' : 'bg-orange-500'}`}
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-xs text-slate-500 mt-2">
        {remaining > 0 ? (
          <>Nog <span className="font-bold text-orange-600">{remaining}</span> artikelen tot je volle {minItems}-bundel!</>
        ) : (
          <span className="text-emerald-600 font-medium flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Je bundel is compleet! Klaar om af te rekenen.</span>
        )}
      </p>
    </div>
  );
}
