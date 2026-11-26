import { useState } from 'react';
import { useStore } from '@/lib/store';
import { formatEur } from '@/lib/pricing';
import { Search, Package, Train, Plane, Camera, MapPin, CheckCircle2, Clock, Truck, Home } from 'lucide-react';

export default function TrackOrder() {
  const { orders } = useStore();
  const [query, setQuery] = useState('');
  const [foundOrder, setFoundOrder] = useState<typeof orders[0] | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = () => {
    setSearched(true);
    const order = orders.find(o =>
      o.orderNumber.toLowerCase() === query.toLowerCase() ||
      o.internalBarcode.toLowerCase() === query.toLowerCase() ||
      o.customerEmail.toLowerCase() === query.toLowerCase()
    );
    setFoundOrder(order || null);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Bestelling volgen</h1>
        <p className="text-sm text-slate-500 mb-6">Voer je ordernummer, barcode of e-mailadres in om je bestelling te volgen.</p>

        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="bijv. CHINED-20261113-1234 of CN-RTM-1234"
                className="w-full pl-11 pr-4 py-3 rounded-lg border border-slate-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none text-sm"
              />
            </div>
            <button onClick={handleSearch} className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold text-sm">
              Zoeken
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="text-xs text-slate-400">Probeer:</span>
            {orders.slice(0, 2).map(o => (
              <button key={o.id} onClick={() => { setQuery(o.orderNumber); setFoundOrder(o); setSearched(true); }}
                className="text-xs px-2 py-1 rounded-full bg-slate-100 hover:bg-orange-50 text-slate-600 hover:text-orange-600 transition-colors">
                {o.orderNumber}
              </button>
            ))}
          </div>
        </div>

        {searched && !foundOrder && (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">Geen bestelling gevonden. Controleer je ordernummer.</p>
          </div>
        )}

        {foundOrder && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{foundOrder.orderNumber}</h2>
                  <p className="text-xs text-slate-500">Barcode: {foundOrder.internalBarcode} · {new Date(foundOrder.createdAt).toLocaleDateString('nl-NL')}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 ${foundOrder.transportMode === 'train' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                    {foundOrder.transportMode === 'train' ? <><Train className="w-4 h-4" /> Treinvracht · 18-24 dagen</> : <><Plane className="w-4 h-4" /> Luchtvracht · 6-9 dagen</>}
                  </span>
                  <span className="text-lg font-bold text-slate-900">{formatEur(foundOrder.totalEur)}</span>
                </div>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-2">
                {foundOrder.items.map(item => (
                  <div key={item.id} className="flex-shrink-0 text-center">
                    <img src={item.product.imageUrl} alt="" className="w-14 h-14 rounded-lg object-cover bg-slate-50" />
                    <p className="text-[10px] text-slate-500 mt-1 max-w-[60px] truncate">{item.product.titleNl}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Truck className="w-4 h-4 text-orange-600" /> Track & Trace
              </h3>
              <div className="space-y-0">
                {foundOrder.milestones.map((m, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${m.done ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-300'}`}>
                        {m.done ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-4 h-4" />}
                      </div>
                      {i < foundOrder.milestones.length - 1 && (
                        <div className={`w-0.5 h-12 ${m.done ? 'bg-emerald-300' : 'bg-slate-100'}`} />
                      )}
                    </div>
                    <div className="pt-1.5 pb-8">
                      <p className={`text-sm font-medium ${m.done ? 'text-slate-900' : 'text-slate-400'}`}>{m.status}</p>
                      <p className="text-xs text-slate-400">{new Date(m.date).toLocaleDateString('nl-NL')}</p>
                      {m.note && <p className="text-xs text-slate-500 mt-1">{m.note}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {foundOrder.qcPhotos.length > 0 && (
              <div className="bg-white rounded-xl border-2 border-emerald-300 p-5">
                <h3 className="text-sm font-bold text-emerald-700 mb-4 flex items-center gap-2">
                  <Camera className="w-4 h-4" /> 📸 Jouw QC-foto's uit China zijn binnen!
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {foundOrder.qcPhotos.map(photo => (
                    <div key={photo.id} className="group">
                      <div className="aspect-square rounded-lg overflow-hidden bg-slate-50">
                        <img src={photo.url} alt={photo.caption} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      </div>
                      <p className="text-xs text-slate-500 mt-1.5">{photo.caption}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Home className="w-4 h-4 text-orange-600" /> Bezorgadres
              </h3>
              <div className="text-sm text-slate-600 space-y-0.5">
                <p>{foundOrder.customerName}</p>
                <p>{foundOrder.address}</p>
                <p>{foundOrder.postalCode} {foundOrder.city}</p>
                <p className="text-xs text-slate-400 mt-1">{foundOrder.deliveryType === 'home' ? 'PostNL Thuisbezorging' : 'PostNL Pakketautomaat'}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
