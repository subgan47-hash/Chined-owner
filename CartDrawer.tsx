import { useStore } from '@/lib/store';
import { calculateOrderPricing, formatEur, getUniqueCategories } from '@/lib/pricing';
import { calculateChinedPrice, type FreightMode } from '@/lib/bundleBuilder';
import { X, Trash2, Plus, Minus, ShoppingBag, ShieldCheck, Info, Train, Plane, Flame, Truck, Camera } from 'lucide-react';

interface Props {
  onCheckout: () => void;
}

export default function CartDrawer({ onCheckout }: Props) {
  const { cart, cartOpen, setCartOpen, removeFromCart, updateCartQuantity, transportMode, setTransportMode, settings, products, addToCart } = useStore();

  if (!cartOpen) return null;

  const itemCount = cart.reduce((sum, ci) => sum + ci.quantity, 0);
  const pricing = calculateOrderPricing(cart, transportMode, settings);
  const uniqueCats = getUniqueCategories(cart);
  const minItems = settings.minBundleItems;
  const progress = Math.min(100, (itemCount / minItems) * 100);
  const remaining = Math.max(0, minItems - itemCount);
  const canCheckout = itemCount >= minItems;

  const MERCHANT_BADGE: Record<string, string> = {
    '1688': 'bg-red-100 text-red-700',
    'shein': 'bg-pink-100 text-pink-700',
    'temu': 'bg-orange-100 text-orange-700',
    'aliexpress': 'bg-amber-100 text-amber-700',
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => setCartOpen(false)} />
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col animate-slide-in">
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-orange-600" /> ChiNed Bundel
          </h2>
          <button onClick={() => setCartOpen(false)} className="p-2 rounded-lg hover:bg-slate-100">
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">Je bundel is nog leeg.</p>
              <p className="text-slate-400 text-xs mt-1">Voeg minimaal {minItems} items toe om te besparen op EU-toeslagen.</p>
            </div>
          ) : (
            <>
              <div className="bg-slate-50 rounded-xl p-3 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-700">ChiNed Bundel-status</span>
                  <span className="text-xs font-bold text-orange-600">{itemCount}/{minItems} items</span>
                </div>
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-500 ${canCheckout ? 'bg-emerald-500' : 'bg-orange-500'}`} style={{ width: `${progress}%` }} />
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  {canCheckout ? (
                    <span className="text-emerald-600 font-medium flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Minimum bereikt! Je bundel kan via de B2B-route worden verwerkt.</span>
                  ) : (
                    <>Voeg nog <span className="font-bold text-orange-600">{remaining}</span> items toe voor de minimale B2B-bundel.</>
                  )}
                </p>
              </div>

              <div className="space-y-3">
                {cart.map(item => (
                  <div key={item.id} className="flex gap-3 bg-white border border-slate-200 rounded-xl p-2.5">
                    <img src={item.product.imageUrl} alt={item.product.titleNl} className="w-16 h-16 rounded-lg object-cover bg-slate-50 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">{item.product.titleNl}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${MERCHANT_BADGE[item.product.merchant]}`}>
                              {item.product.merchant}
                            </span>
                            <span className="text-[10px] text-slate-400">{item.size} · {item.color}</span>
                          </div>
                        </div>
                        <button onClick={() => removeFromCart(item.id)} className="p-1 text-slate-300 hover:text-red-500 flex-shrink-0">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1">
                          <button onClick={() => updateCartQuantity(item.id, item.quantity - 1)} className="w-6 h-6 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center justify-center"><Minus className="w-3 h-3" /></button>
                          <span className="w-8 text-center text-xs font-semibold">{item.quantity}</span>
                          <button onClick={() => updateCartQuantity(item.id, item.quantity + 1)} className="w-6 h-6 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center justify-center"><Plus className="w-3 h-3" /></button>
                        </div>
                        <span className="text-sm font-bold text-slate-900">{formatEur(getProductPrice(item, settings, transportMode as FreightMode))}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-3 bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                <p className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5 mb-1">
                  <Info className="w-3.5 h-3.5" /> Retourbeleid
                </p>
                <p className="text-xs text-slate-600">Niet-defecte retour? Vaste € {settings.returnPickupFee.toFixed(2)} ophaalbijdrage (incl. BTW). Wordt bij je opgehaald in Rotterdam zodra onze bezorger in jouw wijk is — je ontvangt vooraf een bericht met het ophaalmoment. Gratis bij beschadigd of verkeerd item.</p>
              </div>

              {itemCount > 0 && itemCount < minItems && (() => {
                const fillers = products.filter(p => {
                  const price = calculateChinedPrice(p.priceRmb, settings.rmbToEurRate, p.weightKg, p.lengthCm, p.widthCm, p.heightCm, transportMode as FreightMode, {
                    airRatePerKg: settings.airRatePerKg, railRatePerKg: settings.railRatePerKg, b2bDutyPct: settings.b2bDutyPct, dutchVatPct: settings.dutchVatPct,
                  });
                  return price.allIn < 9.95;
                }).slice(0, 4);
                if (fillers.length === 0) return null;
                return (
                  <div className="mt-3 bg-orange-50 border border-orange-200 rounded-xl p-3">
                    <p className="text-xs font-semibold text-orange-700 flex items-center gap-1.5 mb-2"><Flame className="w-3.5 h-3.5" /> Bundel-vullers onder de € 9,95 — nog {remaining} items nodig</p>
                    <div className="grid grid-cols-2 gap-2">
                      {fillers.map(p => (
                        <button key={p.id} onClick={() => addToCart(p, 'Standaard', p.colors[0] || 'Standaard', 1)} className="flex items-center gap-2 bg-white rounded-lg p-2 border border-orange-100 hover:border-orange-300 text-left">
                          <img src={p.imageUrl} alt="" className="w-8 h-8 rounded object-cover bg-slate-50 flex-shrink-0" />
                          <p className="text-[10px] font-medium text-slate-700 line-clamp-2">{p.titleNl}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })()}

              <div className="mt-3 bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                <p className="text-xs font-semibold text-emerald-800 flex items-center gap-1.5 mb-2"><Train className="w-3.5 h-3.5" /> 100% Duurzame Treinvracht</p>
                <p className="text-xs text-emerald-700">0% vliegtuig · 0% vervuilende zeevracht · 18–24 dagen · lokale wijkbezorging in Rotterdam</p>
                {settings.airFreightEnabled && <div className="grid grid-cols-2 gap-2 mt-3"><button onClick={() => setTransportMode('train')} className={`p-2 rounded-lg border text-xs font-semibold ${transportMode === 'train' ? 'border-emerald-500 bg-white text-emerald-700' : 'border-emerald-100 text-slate-500'}`}><Train className="inline w-3.5 h-3.5 mr-1" /> Trein</button><button onClick={() => setTransportMode('air')} className={`p-2 rounded-lg border text-xs font-semibold ${transportMode === 'air' ? 'border-orange-500 bg-white text-orange-700' : 'border-emerald-100 text-slate-500'}`}><Plane className="inline w-3.5 h-3.5 mr-1" /> Luchtvracht</button></div>}
              </div>

              <div className="mt-3 bg-slate-50 border border-slate-200 rounded-xl p-3">
                <p className="text-xs font-semibold text-slate-700 mb-1">Interne retourverwerking</p>
                <p className="text-xs text-slate-600">Retouren worden lokaal geïnspecteerd en herverkocht via Rotterdam Outlet (Verrassingsbox / Tweede Kans). Bij volledige 6-item bundel-retour wordt originele heen-verzendkost terugbetaald conform EU-regelgeving.</p>
              </div>
            </>
          )}
        </div>

        {cart.length > 0 && (
          <div className="border-t border-slate-200 p-4 space-y-3">
            <div className="bg-emerald-50 rounded-lg p-2.5 mb-1">
              <div className="grid grid-cols-2 gap-1.5">
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-700"><ShieldCheck className="w-3 h-3 flex-shrink-0" /> Transparante fabrieksprijs</div>
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-700"><Truck className="w-3 h-3 flex-shrink-0" /> B2B via Rotterdam</div>
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-700"><Camera className="w-3 h-3 flex-shrink-0" /> QC met foto in China</div>
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-700"><ShieldCheck className="w-3 h-3 flex-shrink-0" /> 14 dagen zichttermijn</div>
              </div>
            </div>
            <div className="space-y-1">
              <Row label={`Producten (${itemCount})`} value={formatEur(pricing.productCostEur + pricing.chinaHandlingEur)} />
              <Row label="B2B-import en vracht" value={formatEur(pricing.freightEur)} />
              <Row label="B2B Invoerrechten" value={formatEur(pricing.dutyEur)} />
              <Row label="Binnenlandse bezorging" value={formatEur(pricing.postnlCostEur)} />
              <Row label="Platform Margin" value={formatEur(pricing.platformMarginEur)} />
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-sm font-bold text-slate-900">Totaal</span>
              <span className="text-xl font-bold text-orange-600">{formatEur(pricing.totalEur)}</span>
            </div>
            <button
              disabled={!canCheckout}
              onClick={onCheckout}
              className={`w-full py-3 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2 ${
                canCheckout ? 'bg-orange-600 hover:bg-orange-700 text-white shadow-md' : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              {canCheckout ? 'Afrekenen' : `Nog ${remaining} items nodig`}
            </button>
          </div>
        )}
      </div>
    </>
  );
}

function getProductPrice(item: { product: { priceRmb: number; weightKg: number; lengthCm: number; widthCm: number; heightCm: number }; quantity: number }, settings: { rmbToEurRate: number; airRatePerKg: number; railRatePerKg: number; b2bDutyPct: number; dutchVatPct: number }, transportMode: FreightMode) {
  const price = calculateChinedPrice(item.product.priceRmb, settings.rmbToEurRate, item.product.weightKg, item.product.lengthCm, item.product.widthCm, item.product.heightCm, transportMode, {
    airRatePerKg: settings.airRatePerKg, railRatePerKg: settings.railRatePerKg, b2bDutyPct: settings.b2bDutyPct, dutchVatPct: settings.dutchVatPct,
  });
  return price.allIn * item.quantity;
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-slate-500">{label}</span>
      <span className={highlight ? 'font-semibold text-blue-600' : 'text-slate-700'}>{value}</span>
    </div>
  );
}
