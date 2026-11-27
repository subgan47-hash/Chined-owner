import { useStore } from '@/lib/store';
import { formatEur } from '@/lib/pricing';
import { Wallet, TrendingDown, TrendingUp, Percent, Award, LogOut } from 'lucide-react';
import { useState } from 'react';

export default function Tab3ReturnFund() {
  const { orders, returnFundEntries, logReturnDepreciation } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ orderId: '', amount: 2.5, description: '', isClothing: false });

  const inflow = returnFundEntries.filter(e => e.type === 'inflow');
  const depreciation = returnFundEntries.filter(e => e.type === 'depreciation');
  const inflowStandard = inflow.filter(e => !e.isClothing).reduce((s, e) => s + e.amount, 0);
  const inflowClothing = inflow.filter(e => e.isClothing).reduce((s, e) => s + e.amount, 0);
  const totalInflow = inflowStandard + inflowClothing;
  const totalDepreciation = depreciation.reduce((s, e) => s + e.amount, 0);
  const netBalance = totalInflow - totalDepreciation;
  const claimRatio = totalInflow > 0 ? (totalDepreciation / totalInflow) * 100 : 0;

  const customersNoReturns = orders.filter(o => !o.hasReturned);
  const customersWithReturns = orders.filter(o => o.hasReturned);
  const totalNoReturnDeposit = customersNoReturns.reduce((s, o) => s + o.personalDeposit, 0);
  const totalWithReturnDeposit = customersWithReturns.reduce((s, o) => s + o.personalDeposit, 0);
  const shopCreditPayout = totalNoReturnDeposit * 1.1;
  const cashPayout = totalNoReturnDeposit;
  const proRataPool = Math.max(0, netBalance - totalNoReturnDeposit);
  const proRataPerCustomer = customersWithReturns.length > 0 ? proRataPool / customersWithReturns.length : 0;

  const handleLog = () => {
    if (!form.orderId || !form.description) return;
    logReturnDepreciation(form.orderId, form.amount, form.description, form.isClothing);
    setForm({ orderId: '', amount: 2.5, description: '', isClothing: false });
    setShowForm(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">ChiNed Retour-Spaarpot Beheer</h1>
          <p className="text-sm text-slate-500">Live ledger van de collectieve spaarpot.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-semibold">
          Retour afschrijving loggen
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6">
          <h3 className="text-sm font-bold text-slate-900 mb-3">Nieuwe retour afschrijving</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-500 block mb-1">Order</label>
              <select value={form.orderId} onChange={e => setForm({ ...form, orderId: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-orange-400 outline-none">
                <option value="">Selecteer order...</option>
                {orders.map(o => <option key={o.id} value={o.id}>{o.orderNumber} - {o.customerName}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">Bedrag (EUR)</label>
              <input type="number" step={0.1} value={form.amount} onChange={e => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-orange-400 outline-none" />
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">Type</label>
              <select value={form.isClothing ? 'clothing' : 'standard'} onChange={e => setForm({ ...form, isClothing: e.target.value === 'clothing' })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-orange-400 outline-none">
                <option value="standard">Standaard item</option>
                <option value="clothing">Kleding item</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">Beschrijving</label>
              <input type="text" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="bijv. inspectie & herverpakking"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-orange-400 outline-none" />
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm">Annuleren</button>
            <button onClick={handleLog} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold">Afschrijving bevestigen</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard icon={<TrendingUp className="w-5 h-5" />} title="Totale Inflow" value={formatEur(totalInflow)} sub={`Standaard: ${formatEur(inflowStandard)} · Kleding: ${formatEur(inflowClothing)}`} color="text-emerald-600 bg-emerald-50" />
        <KpiCard icon={<TrendingDown className="w-5 h-5" />} title="Afschrijvingen" value={formatEur(totalDepreciation)} sub={`${depreciation.length} retouren`} color="text-red-600 bg-red-50" />
        <KpiCard icon={<Wallet className="w-5 h-5" />} title="Netto Spaarpot Balans" value={formatEur(netBalance)} sub="beschikbaar voor uitkering" color="text-blue-600 bg-blue-50" />
        <KpiCard icon={<Percent className="w-5 h-5" />} title="Claim Ratio" value={`${claimRatio.toFixed(1)}%`} sub="van totale inleg" color="text-orange-600 bg-orange-50" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2"><Award className="w-4 h-4 text-emerald-600" /> Jaarlijkse Uitkering Simulatie (12 maanden)</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-xs bg-emerald-50 rounded-lg p-2.5">
              <span className="text-emerald-700">Schadevrije klanten ({customersNoReturns.length})</span>
              <span className="font-bold text-emerald-600">{formatEur(totalNoReturnDeposit)}</span>
            </div>
            <div className="flex justify-between text-xs p-2.5 pl-5">
              <span className="text-slate-600">→ Shoptegoed + 10% bonus</span>
              <span className="font-semibold text-blue-600">{formatEur(shopCreditPayout)}</span>
            </div>
            <div className="flex justify-between text-xs p-2.5 pl-5">
              <span className="text-slate-600">→ Cash uitbetaling (100%)</span>
              <span className="font-semibold text-slate-700">{formatEur(cashPayout)}</span>
            </div>
            <div className="flex justify-between text-xs bg-amber-50 rounded-lg p-2.5 mt-2">
              <span className="text-amber-700">Klanten met retouren ({customersWithReturns.length})</span>
              <span className="font-bold text-amber-600">{formatEur(totalWithReturnDeposit)}</span>
            </div>
            <div className="flex justify-between text-xs p-2.5 pl-5">
              <span className="text-slate-600">→ Pro-rata uitkering per klant</span>
              <span className="font-semibold text-slate-700">{formatEur(proRataPerCustomer)}</span>
            </div>
            <div className="flex justify-between text-xs p-2.5 pl-5">
              <span className="text-slate-600">→ Resterend fonds pro-rata</span>
              <span className="font-semibold text-slate-700">{formatEur(proRataPool)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2"><LogOut className="w-4 h-4 text-blue-600" /> Spaarpot Ledger (Recente mutaties)</h3>
          <div className="space-y-1.5 max-h-80 overflow-y-auto">
            {returnFundEntries.slice(0, 15).map(entry => (
              <div key={entry.id} className={`flex items-center justify-between text-xs p-2.5 rounded-lg ${entry.type === 'inflow' ? 'bg-emerald-50' : 'bg-red-50'}`}>
                <div className="min-w-0">
                  <p className={`font-medium truncate ${entry.type === 'inflow' ? 'text-emerald-700' : 'text-red-700'}`}>
                    {entry.type === 'inflow' ? '+' : '-'} {formatEur(entry.amount)}
                  </p>
                  <p className="text-slate-400 text-[10px] truncate">{entry.description}</p>
                </div>
                <span className="text-[10px] text-slate-400 flex-shrink-0">{new Date(entry.date).toLocaleDateString('nl-NL')}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ icon, title, value, sub, color }: { icon: React.ReactNode; title: string; value: string; sub?: string; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-2 ${color}`}>{icon}</div>
      <p className="text-xs text-slate-500">{title}</p>
      <p className="text-lg font-bold text-slate-900">{value}</p>
      {sub && <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>}
    </div>
  );
}
