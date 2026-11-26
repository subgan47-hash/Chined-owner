import { useState } from 'react';
import type { Product } from '@/lib/types';
import { useStore } from '@/lib/store';
import { formatEur, checkRiskKeywords, checkParcelDimensions, checkParcelWeight } from '@/lib/pricing';
import { calculateChinedPrice, type FreightMode } from '@/lib/bundleBuilder';
import { X, ShoppingBag, AlertTriangle, ExternalLink, Ruler, Palette, Languages } from 'lucide-react';

interface Props {
  product: Product | null;
  onClose: () => void;
}

const MERCHANT_BADGE: Record<string, { label: string; class: string }> = {
  '1688': { label: 'Bron: 1688.com', class: 'bg-red-100 text-red-700' },
  'shein': { label: 'Bron: Shein', class: 'bg-pink-100 text-pink-700' },
  'temu': { label: 'Bron: Temu', class: 'bg-orange-100 text-orange-700' },
  'aliexpress': { label: 'Bron: AliExpress', class: 'bg-amber-100 text-amber-700' },
};

export default function ProductModal({ product, onClose }: Props) {
  const { settings, addToCart, transportMode } = useStore();
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const risk = checkRiskKeywords(product, settings);
  const dimBlock = checkParcelDimensions(product, settings);
  const weightBlock = checkParcelWeight(product, settings);
  const isBlocked = risk.blocked || dimBlock.blocked || weightBlock.blocked;

  const price = calculateChinedPrice(product.priceRmb, settings.rmbToEurRate, product.weightKg, product.lengthCm, product.widthCm, product.heightCm, transportMode as FreightMode, {
    airRatePerKg: settings.airRatePerKg, railRatePerKg: settings.railRatePerKg, b2bDutyPct: settings.b2bDutyPct, dutchVatPct: settings.dutchVatPct,
  });
  const chinedPrice = price.allIn;
  const etalageprijs = price.etalageprijs;
  const savings = etalageprijs - chinedPrice;

  const handleAdd = () => {
    if (isBlocked) return;
    addToCart(product, size || product.sizes[0] || 'Standaard', color || product.colors[0] || 'Standaard', quantity);
    onClose();
  };

  const factoryUrl = product.originalUrl || 'https://www.1688.com';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="relative">
          <button onClick={onClose} className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/90 hover:bg-white shadow-md flex items-center justify-center">
            <X className="w-5 h-5 text-slate-600" />
          </button>

          <div className="grid md:grid-cols-2 gap-0">
            <div className="relative aspect-square bg-slate-50 overflow-hidden rounded-l-2xl">
              <img src={product.imageUrl} alt={product.titleNl} className="w-full h-full object-cover" />
              <div className="absolute top-3 left-3 flex gap-2">
                <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${MERCHANT_BADGE[product.merchant].class}`}>
                  {MERCHANT_BADGE[product.merchant].label}
                </span>
                <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-white/90 text-slate-600 backdrop-blur">
                  {product.category}
                </span>
              </div>
            </div>

            <div className="p-6 flex flex-col">
              <h2 className="text-xl font-bold text-slate-900 mb-1">{product.titleNl}</h2>
              <p className="text-sm text-slate-400 mb-4">{product.title}</p>

              {isBlocked ? (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                  <p className="text-sm text-red-700 flex items-center gap-2 font-semibold">
                    <AlertTriangle className="w-5 h-5" /> Risico-artikel gedetecteerd
                  </p>
                  <p className="text-xs text-red-600 mt-1">
                    {risk.reason || dimBlock.reason || weightBlock.reason} Dit product kan niet geïmporteerd worden in verband met EU-veiligheids- en nalevingsregels.
                  </p>
                </div>
              ) : (
                <>
                  <div className="bg-slate-50 rounded-xl p-4 mb-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center">
                        <p className="text-xs text-slate-500 mb-1">Etalageprijs (Temu/Shein/Ali)</p>
                        <p className="text-sm text-slate-400 line-through">{formatEur(etalageprijs)}</p>
                        <p className="text-[10px] text-slate-400">Inclusief EU-pakkettoeslagen</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-orange-600 mb-1 font-medium">ChiNed sourcingprijs</p>
                        <p className="text-xl font-bold text-orange-600">{formatEur(chinedPrice)}</p>
                        <p className="text-[10px] text-emerald-600 font-semibold">Je bespaart {formatEur(savings)}</p>
                      </div>
                    </div>
                  </div>

                  {product.sizes.length > 0 && (
                    <div className="mb-3">
                      <label className="text-xs font-semibold text-slate-700 flex items-center gap-1 mb-1.5"><Ruler className="w-3.5 h-3.5" /> Maat</label>
                      <div className="flex flex-wrap gap-2">
                        {product.sizes.map(s => (
                          <button key={s} onClick={() => setSize(s)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${size === s ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                            {s}
                          </button>
                        ))}
                      </div>
                      {product.category === 'Kleding' && (
                        <p className="text-[10px] text-amber-600 mt-1.5 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Let op: Chinese maten vallen 1 tot 2 maten kleiner. Bestel een maat groter dan normaal.
                        </p>
                      )}
                    </div>
                  )}

                  {product.colors.length > 0 && (
                    <div className="mb-3">
                      <label className="text-xs font-semibold text-slate-700 flex items-center gap-1 mb-1.5"><Palette className="w-3.5 h-3.5" /> Kleur</label>
                      <div className="flex flex-wrap gap-2">
                        {product.colors.map(c => (
                          <button key={c} onClick={() => setColor(c)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${color === c ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                            {c}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mb-4">
                    <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Aantal</label>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-8 h-8 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold">-</button>
                      <span className="w-12 text-center text-sm font-semibold">{quantity}</span>
                      <button onClick={() => setQuantity(quantity + 1)} className="w-8 h-8 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold">+</button>
                    </div>
                  </div>
                </>
              )}

              <button
                disabled={isBlocked}
                onClick={handleAdd}
                className={`w-full py-3 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2 ${
                  isBlocked ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700 text-white shadow-md'
                }`}
              >
                <ShoppingBag className="w-5 h-5" /> {isBlocked ? 'Niet beschikbaar' : 'Voeg toe aan mijn ChiNed Bundel'}
              </button>

              <a
                href={product.merchant === '1688' ? `https://translate.google.com/translate?sl=zh-CN&tl=nl&u=${encodeURIComponent(factoryUrl)}` : factoryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors"
              >
                {product.merchant === '1688' ? <><Languages className="w-3.5 h-3.5" /> Bekijk op 1688.com (NL vertaald)</> : <><ExternalLink className="w-3.5 h-3.5" /> Bekijk op originele website</>}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
