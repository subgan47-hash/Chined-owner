import { useStore } from '@/lib/store';
import { formatEur } from '@/lib/pricing';
import type { Order } from '@/lib/types';
import { cityForPostcode, pickupPointsForCity, CITY_RANGES } from '@/lib/locations';
import { ScanLine, Package, CheckCircle2, Printer, Train, Plane, MapPin, User, Mail, Phone, Search, Gift, RotateCcw } from 'lucide-react';
import { useState, useRef } from 'react';

export default function Tab5HubScanner() {
  const { orders, settings, updateOrderStatus, returnFundEntries, logReturnDepreciation } = useStore();
  const [scanInput, setScanInput] = useState('');
  const [scannedOrder, setScannedOrder] = useState<Order | null>(null);
  const [labelGenerated, setLabelGenerated] = useState(false);
  const [routeSorted, setRouteSorted] = useState(false);
  const [outletRecovered, setOutletRecovered] = useState(0);
  const [boxSold, setBoxSold] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleScan = () => {
    const order = orders.find(o => o.internalBarcode.toLowerCase() === scanInput.toLowerCase());
    if (order) {
      setScannedOrder(order);
      setLabelGenerated(false);
      if (order.status === 'Aangekomen in Rotterdam' || order.status === 'In Bulkdoos naar Rotterdam') {
        updateOrderStatus(order.id, 'PostNL Label Gemaakt');
      }
    } else {
      setScannedOrder(null);
    }
  };

  const handleGenerateLabel = () => {
    if (scannedOrder) {
      setLabelGenerated(true);
      updateOrderStatus(scannedOrder.id, 'PostNL Label Gemaakt');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-900 mb-1">Rotterdam Hub Scanner & PostNL Label Generator</h1>
      <p className="text-sm text-slate-500 mb-6">Scan interne CN-RTM barcodes om customer bundles te matchen en PostNL labels te genereren.</p>

      <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6">
        <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2"><RotateCcw className="w-4 h-4 text-orange-600" /> Rekenvoorbeeld: Wat gebeurt er bij een retour &amp; hoe is dit afgedekt?</h2>
        <div className="space-y-2 text-xs text-slate-700">
          <div className="flex justify-between bg-slate-50 rounded-lg p-2.5"><span>1. Werkelijke kosten ChiNed (excl. BTW): inkoop+fee+China+trein+12% douane (€ 8,50) + NL heen-bezorging (€ 4,50 ÷ 6 = € 0,75)</span><span className="font-bold">€ 9,25</span></div>
          <div className="flex justify-between bg-emerald-50 rounded-lg p-2.5"><span>2. Dekking Laag 1 (€ 6,00 retourbijdrage klant): € 4,96 excl. BTW − € 2,00 bezorger = netto in Retourpotje</span><span className="font-bold text-emerald-700">€ 2,96</span></div>
          <div className="flex justify-between bg-blue-50 rounded-lg p-2.5"><span>3. Dekking Laag 2 (Lokale herverkoop Rotterdam)</span><span className="font-bold text-blue-700">€ 6,00</span></div>
          <div className="flex justify-between bg-amber-50 rounded-lg p-2.5"><span>4. Eindresultaat: € 2,96 + € 6,00 = € 8,96 terugverdiend op € 9,25 kosten — verschil € 0,29 opgevangen door vaste buffer € 0,50/item (€ 3,00/bundel)</span><span className="font-bold text-amber-700">€ 0,29</span></div>
        </div>
        <p className="text-[10px] text-slate-400 mt-2">Vaste retourpickup € {settings.returnPickupFee.toFixed(2)} (incl. BTW) bij niet-defecte retouren. Gratis bij beschadigd/verkeerd item. Bij retour van volledige 6-item bundel wordt originele heen-verzendkost € 4,50 terugbetaald conform EU-regelgeving.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6">
        <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2"><Gift className="w-4 h-4 text-emerald-600" /> Lokale Retour-Herverkoop (Rotterdam Outlet)</h2>
        <p className="text-xs text-slate-600 mb-3">Bundel 6 geïnspecteerde retour-items tot een Verrassingsbox of verkoop als Tweede Kans. Opbrengst wordt gecrediteerd aan het interne Retourpotje.</p>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => { setBoxSold(boxSold + 1); logReturnDepreciation('outlet', 14.95, 'ChiNed Rotterdam Verrassingsbox (€ 14,95)', false); setOutletRecovered(outletRecovered + 14.95); }} className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold"><Gift className="w-4 h-4" /> ChiNed Rotterdam Verrassingsbox (€ 14,95)</button>
          <button onClick={() => { logReturnDepreciation('outlet', 6.0, 'Tweede Kans herverkoop (€ 6,00)', false); setOutletRecovered(outletRecovered + 6.0); }} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold"><RotateCcw className="w-4 h-4" /> Markeer als Tweede Kans (€ 6,00)</button>
        </div>
        {outletRecovered > 0 && <p className="text-xs text-emerald-700 font-semibold mt-3">Totaal terugverdiend via outlet: {formatEur(outletRecovered)}</p>}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <ScanLine className="w-6 h-6 text-orange-600" />
          <div>
            <h2 className="text-sm font-bold text-slate-900">Barcode Scanner</h2>
            <p className="text-xs text-slate-500">Scan of typ een CN-RTM-XXXX barcode</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              ref={inputRef}
              type="text"
              value={scanInput}
              onChange={e => setScanInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleScan()}
              placeholder="bijv. CN-RTM-1234"
              className="w-full pl-11 pr-4 py-3 rounded-lg border-2 border-slate-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none text-sm font-mono"
            />
          </div>
          <button onClick={handleScan} className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold text-sm">
            Scannen
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <span className="text-xs text-slate-400">Snelzoek:</span>
          {orders.slice(0, 3).map(o => (
            <button key={o.id} onClick={() => { setScanInput(o.internalBarcode); setScannedOrder(o); setLabelGenerated(false); }}
              className="text-xs px-2 py-1 rounded-full bg-slate-100 hover:bg-orange-50 text-slate-600 hover:text-orange-600 transition-colors font-mono">
              {o.internalBarcode}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><h2 className="text-sm font-bold text-slate-900">Gereed voor wijkroute</h2><p className="text-xs text-slate-500">Sorteer alle orders op stad, postcode en wijkpunt.</p></div>
          <button onClick={() => setRouteSorted(true)} className="px-4 py-2.5 rounded-lg bg-slate-900 hover:bg-orange-600 text-white text-sm font-semibold">Sorteer Lijst op Stad, Postcode & Wijkpunt</button>
        </div>
        {routeSorted && <div className="mt-4 space-y-3 print:block">{Object.entries(orders.filter(order => order.status !== 'Bezorgd').reduce<Record<string, Order[]>>((groups, order) => { const city = cityForPostcode(order.postalCode); const cityLabel = city ? CITY_RANGES[city].label : 'Overig'; const point = order.pickupPoint || (city ? pickupPointsForCity(city, order.postalCode)[0]?.name : 'Thuisbezorging') || 'Thuisbezorging'; const key = `${cityLabel} — ${order.postalCode.slice(0, 4)} — ${point}`; (groups[key] ||= []).push(order); return groups; }, {})).sort(([a], [b]) => a.localeCompare(b, 'nl')).map(([group, groupedOrders]) => <div key={group} className="rounded-lg border border-slate-200 p-3"><p className="text-xs font-bold text-orange-700">{group}</p><p className="text-xs text-slate-500 mt-1">{groupedOrders.length} pakket{groupedOrders.length === 1 ? '' : 'ten'}</p><div className="mt-2 space-y-1">{groupedOrders.sort((a, b) => a.postalCode.localeCompare(b.postalCode)).map(order => <div key={order.id} className="flex justify-between text-xs text-slate-700"><span className="font-mono">{order.postalCode}</span><span>{order.customerName} · {order.internalBarcode}</span></div>)}</div></div>)}</div>}
      </div>

      {scannedOrder && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">{scannedOrder.orderNumber}</h3>
                <p className="text-xs text-slate-500 font-mono">{scannedOrder.internalBarcode}</p>
              </div>
              <span className={`text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 ${scannedOrder.transportMode === 'train' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                {scannedOrder.transportMode === 'train' ? <><Train className="w-4 h-4" /> Treinvracht</> : <><Plane className="w-4 h-4" /> Luchtvracht</>}
              </span>
            </div>

            <div className="space-y-3 mb-4">
              <InfoRow icon={<User className="w-4 h-4" />} label="Klant" value={scannedOrder.customerName} />
              <InfoRow icon={<Mail className="w-4 h-4" />} label="E-mail" value={scannedOrder.customerEmail} />
              <InfoRow icon={<Phone className="w-4 h-4" />} label="Telefoon" value={scannedOrder.customerPhone} />
              <InfoRow icon={<MapPin className="w-4 h-4" />} label="Adres" value={`${scannedOrder.address}, ${scannedOrder.postalCode} ${scannedOrder.city}`} />
            </div>

            <div className="bg-slate-50 rounded-lg p-3 mb-4">
              <p className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                <Package className="w-4 h-4" /> Bundle inhoud ({scannedOrder.items.length} items)
              </p>
              <div className="grid grid-cols-2 gap-2">
                {scannedOrder.items.map(item => (
                  <div key={item.id} className="flex items-center gap-2 bg-white rounded-lg p-2">
                    <img src={item.product.imageUrl} alt="" className="w-10 h-10 rounded object-cover bg-slate-50" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-700 truncate">{item.product.titleNl}</p>
                      <p className="text-[10px] text-slate-400">{item.size} · {item.color} · {item.quantity}x</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {scannedOrder.qcPhotos.length > 0 && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 mb-4">
                <p className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> QC Foto's bevestigd ({scannedOrder.qcPhotos.length} foto's)
                </p>
              </div>
            )}

            <button
              onClick={handleGenerateLabel}
              disabled={labelGenerated}
              className={`w-full py-3 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2 ${
                labelGenerated ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-900 hover:bg-slate-800 text-white'
              }`}
            >
              {labelGenerated ? <><CheckCircle2 className="w-5 h-5" /> PostNL Label Gemaakt</> : <>PostNL API Shipment Call Simuleren</>}
            </button>
          </div>

          {labelGenerated && (
            <div className="bg-white rounded-xl border-2 border-slate-300 p-5 print:shadow-none print:border-slate-400" id="postnl-label">
              <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded bg-orange-600 flex items-center justify-center">
                    <Package className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-bold text-slate-900">ChiNed</span>
                </div>
                <span className="text-[10px] text-slate-400">PostNL Label · 10x15cm</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between"><span className="text-slate-400">PostNL Customer Code:</span><span className="font-mono text-slate-700">{settings.postnlRate > 0 ? 'HH-CHD-001' : 'Niet geconfigureerd'}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Barcode:</span><span className="font-mono font-bold text-slate-900">3S{scannedOrder.internalBarcode.replace(/[^0-9]/g, '')}NL</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Gewicht:</span><span className="text-slate-700">{scannedOrder.items.reduce((s, i) => s + i.product.weightKg * i.quantity, 0).toFixed(2)} kg</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Service:</span><span className="text-slate-700">{scannedOrder.deliveryType === 'home' ? 'Pakket Thuis' : 'Pakketautomaat'}</span></div>
              </div>

              <div className="mt-4 pt-3 border-t-2 border-slate-200">
                <p className="text-[10px] text-slate-400 mb-1">AFZENDER:</p>
                <p className="text-xs font-medium text-slate-700">ChiNed Rotterdam Hub</p>
                <p className="text-xs text-slate-600">Waalhaven O.z. 81, 3088 BM Rotterdam</p>
              </div>

              <div className="mt-3 pt-3 border-t-2 border-slate-200">
                <p className="text-[10px] text-slate-400 mb-1">BESTEMMING:</p>
                <p className="text-sm font-bold text-slate-900">{scannedOrder.customerName}</p>
                <p className="text-sm text-slate-700">{scannedOrder.address}</p>
                <p className="text-sm font-bold text-slate-900">{scannedOrder.postalCode} {scannedOrder.city}</p>
                <p className="text-xs text-slate-500 mt-0.5">Nederland</p>
              </div>

              <div className="mt-4 pt-3 border-t-2 border-slate-200 flex items-end justify-between">
                <div className="text-[8px] text-slate-300 leading-tight">
                  ChiNed · PostNL · B2B Import Rotterdam<br />
                  CN-RTM-{scannedOrder.internalBarcode.replace(/[^0-9]/g, '')}
                </div>
                <div className="h-12 w-32 bg-slate-900 flex items-center justify-center text-white text-[8px] font-mono tracking-widest">
                  ||| || |||||
                </div>
              </div>

              <button
                onClick={handlePrint}
                className="hidden print:hidden mt-4 w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" /> Label Afdrukken (10x15cm)
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 flex-shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-[10px] text-slate-400">{label}</p>
        <p className="text-sm text-slate-700">{value}</p>
      </div>
    </div>
  );
}
