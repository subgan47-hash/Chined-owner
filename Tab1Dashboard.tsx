import { useStore } from '@/lib/store';
import { formatEur } from '@/lib/pricing';
import { Euro, TrendingUp, Wallet, Package, PiggyBank, Calculator, Train } from 'lucide-react';
import { useState } from 'react';

export default function Tab1Dashboard() {
  const { orders, settings, returnFundEntries } = useStore();

  const totalRevenue = orders.reduce((s, o) => s + o.totalEur, 0);
  const totalProductCost = orders.reduce((s, o) => s + o.productCostEur, 0);
  const totalProductCostRmb = totalProductCost / settings.rmbToEurRate;
  const netMargin = orders.reduce((s, o) => s + (o.platformMarginEur + o.postnlCostEur * 0.2), 0);
  const postnlExtraProfit = orders.length * settings.postnlRebate;
  const poolInflow = returnFundEntries.filter(e => e.type === 'inflow').reduce((s, e) => s + e.amount, 0);
  const poolDepreciation = returnFundEntries.filter(e => e.type === 'depreciation').reduce((s, e) => s + e.amount, 0);
  const netPool = poolInflow - poolDepreciation;
  const customerSavings = orders.reduce((s, o) => s + o.savedEur, 0);

  const [sim, setSim] = useState({
    items: 6, rmb: 50, rate: 0.128, weight: 1.0, length: 30, width: 20, height: 15,
    divisor: 6000, qcFeePct: 6, payFeePct: 0.5, chinaShip: 1.2, rail: 2.5, dutyPct: 12,
    bundleShip: 4.5, hubFee: 0.5, returnBuffer: 0.5, handling: 0.75, localHub: true,
  });

  const productCostEur = sim.rmb * sim.rate;
  const volWeight = (sim.length * sim.width * sim.height) / sim.divisor;
  const chargeWeight = Math.max(sim.weight, volWeight);
  const qcFee = productCostEur * (sim.qcFeePct / 100);
  const payFee = productCostEur * (sim.payFeePct / 100);
  const freight = chargeWeight * sim.rail;
  const duty = (productCostEur + freight) * (sim.dutyPct / 100);
  const bundleShipPerItem = sim.bundleShip / sim.items;
  const hubPerItem = sim.localHub ? sim.hubFee : 0;
  const costPerItem = productCostEur + qcFee + payFee + sim.chinaShip + freight + duty + bundleShipPerItem + hubPerItem + sim.returnBuffer;
  const handlingPerItem = sim.handling;
  const handlingMinBundle = Math.max(sim.handling * sim.items, 4.5);
  const handlingPerItemBundle = handlingMinBundle / sim.items;
  const costExVatItem = costPerItem + handlingPerItem;
  const vatItem = (costExVatItem) * (settings.dutchVatPct / 100);
  const allInItem = costExVatItem + vatItem;
  const costExVatBundle = costPerItem * sim.items + handlingMinBundle;
  const vatBundle = costExVatBundle * (settings.dutchVatPct / 100);
  const allInBundle = costExVatBundle + vatBundle;
  const priceZone = allInItem <= 19.95 ? 'green' : allInItem > 25 ? 'amber' : 'neutral';

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-900 mb-1">Live Financieel & Operationeel Dashboard</h1>
      <p className="text-sm text-slate-500 mb-6">Real-time KPI's over alle ChiNed bestellingen.</p>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <KpiCard icon={<Euro className="w-5 h-5" />} title="Totale Omzet" value={formatEur(totalRevenue)} sub={`${orders.length} bestellingen`} color="text-orange-600 bg-orange-50" />
        <KpiCard icon={<TrendingUp className="w-5 h-5" />} title="Inkoopwaarde China" value={`¥ ${totalProductCostRmb.toFixed(0)}`} sub={formatEur(totalProductCost)} color="text-red-600 bg-red-50" />
        <KpiCard icon={<Wallet className="w-5 h-5" />} title="Netto Productmarge" value={formatEur(netMargin)} sub="incl. platform margin" color="text-emerald-600 bg-emerald-50" />
        <KpiCard icon={<Package className="w-5 h-5" />} title="Extra Winst PostNL" value={formatEur(postnlExtraProfit)} sub={`${formatEur(settings.postnlRebate)}/pakket korting`} color="text-blue-600 bg-blue-50" />
        <KpiCard icon={<Wallet className="w-5 h-5" />} title="Intern Retourpotje" value={formatEur(netPool)} sub={`Inleg: ${formatEur(poolInflow)} · Afschr: ${formatEur(poolDepreciation)}`} color="text-purple-600 bg-purple-50" />
        <KpiCard icon={<PiggyBank className="w-5 h-5" />} title="Klantenbesparing EU-heffing" value={formatEur(customerSavings)} sub="vergeleken met direct" color="text-green-600 bg-green-50" />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
          <Calculator className="w-4 h-4 text-orange-600" /> Interactieve Variabele Winst & Kosten Simulator
        </h2>
        <p className="text-xs text-slate-500 mb-4">Per-item & 6-item bundel calculator met volledige waterfall breakdown.</p>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <SimInput label="Aantal artikelen in bundel" value={sim.items} onChange={v => setSim({ ...sim, items: v })} min={1} max={12} />
            <div className="grid grid-cols-2 gap-2">
              <SimInput label="Inkoopprijs per item (¥ RMB)" value={sim.rmb} onChange={v => setSim({ ...sim, rmb: v })} suffix="¥" step={1} />
              <SimInput label="Wisselkoers (RMB→EUR)" value={sim.rate} onChange={v => setSim({ ...sim, rate: v })} step={0.001} />
            </div>
            <SimInput label="Gewicht per item (kg)" value={sim.weight} onChange={v => setSim({ ...sim, weight: v })} step={0.1} />
            <div className="grid grid-cols-3 gap-2">
              <SimInput label="L (cm)" value={sim.length} onChange={v => setSim({ ...sim, length: v })} />
              <SimInput label="B (cm)" value={sim.width} onChange={v => setSim({ ...sim, width: v })} />
              <SimInput label="H (cm)" value={sim.height} onChange={v => setSim({ ...sim, height: v })} />
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">Volumetrische deler</label>
              <div className="flex gap-1">
                <button onClick={() => setSim({ ...sim, divisor: 8000 })} className={`flex-1 py-2 rounded-lg text-xs font-medium ${sim.divisor === 8000 ? 'bg-slate-200 text-slate-700' : 'bg-slate-100 text-slate-500'}`}>/ 8000</button>
                <button onClick={() => setSim({ ...sim, divisor: 6000 })} className={`flex-1 py-2 rounded-lg text-xs font-medium ${sim.divisor === 6000 ? 'bg-slate-200 text-slate-700' : 'bg-slate-100 text-slate-500'}`}>/ 6000</button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-slate-500 block mb-1">Inkoop- & QC-fee (%)</label>
                <select value={sim.qcFeePct} onChange={e => setSim({ ...sim, qcFeePct: Number(e.target.value) })} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm">
                  <option value={0}>0%</option><option value={6}>6%</option><option value={8}>8%</option><option value={15}>15%</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1">Betaaltoeslag (%)</label>
                <select value={sim.payFeePct} onChange={e => setSim({ ...sim, payFeePct: Number(e.target.value) })} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm">
                  <option value={0.5}>0,5% Wise</option><option value={3.5}>3,5% Card</option><option value={4.5}>4,5% PayPal</option>
                </select>
              </div>
            </div>
            <SimInput label="Binnenlandse verzending China/item (€)" value={sim.chinaShip} onChange={v => setSim({ ...sim, chinaShip: v })} step={0.05} prefix="€" />
            <SimInput label="Treinvracht Rotterdam (€/kg)" value={sim.rail} onChange={v => setSim({ ...sim, rail: v })} step={0.05} prefix="€" />
            <SimInput label="B2B Douanerechten (%)" value={sim.dutyPct} onChange={v => setSim({ ...sim, dutyPct: v })} step={0.5} suffix="%" />
            <SimInput label="Nederlandse bundelbezorging (€)" value={sim.bundleShip} onChange={v => setSim({ ...sim, bundleShip: v })} step={0.05} prefix="€" />
            <div className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2.5">
              <span className="text-xs text-slate-600">Eigen Wijkdistributie Rotterdam (€ 0,50 hub/item)</span>
              <button onClick={() => setSim({ ...sim, localHub: !sim.localHub })} className={`relative w-10 h-5 rounded-full ${sim.localHub ? 'bg-emerald-500' : 'bg-slate-300'}`}><span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${sim.localHub ? 'translate-x-5' : 'translate-x-0.5'}`} /></button>
            </div>
            <SimInput label="Retour-Risicobuffer/item (€)" value={sim.returnBuffer} onChange={v => setSim({ ...sim, returnBuffer: v })} step={0.05} prefix="€" />
            <SimInput label="Scan-, Label- & Handlingfee/item (€)" value={sim.handling} onChange={v => setSim({ ...sim, handling: v })} step={0.05} prefix="€" />
            <p className="text-[10px] text-slate-400">Minimaal € 4,50 per bundelpakket van 6 items.</p>
          </div>

          <div className="space-y-4">
            <div className="bg-slate-50 rounded-xl p-4 space-y-2">
              <h3 className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5"><Train className="w-3.5 h-3.5" /> Waterfall — 1 Item</h3>
              <SimResult label="Inkoopprijs (€)" value={formatEur(productCostEur)} />
              <SimResult label="QC- & betaalfee" value={formatEur(qcFee + payFee)} />
              <SimResult label="China binnenlands" value={formatEur(sim.chinaShip)} />
              <SimResult label="Volumegewicht" value={`${chargeWeight.toFixed(2)} kg`} />
              <SimResult label="Treinvracht" value={formatEur(freight)} />
              <SimResult label="Douane 12%" value={formatEur(duty)} />
              <SimResult label="NL bezorging (€ 4,50 ÷ 6)" value={formatEur(bundleShipPerItem)} />
              {sim.localHub && <SimResult label="Hub-kosten wijkdistributie" value={formatEur(hubPerItem)} />}
              <SimResult label="Retour-Risicobuffer" value={formatEur(sim.returnBuffer)} />
              <div className="border-t border-slate-300 pt-2">
                <SimResult label="Totale Kostprijs excl. BTW" value={formatEur(costPerItem)} large />
                <SimResult label={`ChiNed Scan & Handling Fee (€ 0,75/item)`} value={formatEur(handlingPerItem)} />
                <SimResult label="Kostprijs + Handling excl. BTW" value={formatEur(costExVatItem)} />
                <SimResult label={`21% BTW-afdracht`} value={formatEur(vatItem)} />
                <SimResult label="All-in Consumentenprijs" value={formatEur(allInItem)} large />
              </div>
            </div>

            <div className="bg-orange-50 rounded-xl p-4 space-y-2">
              <h3 className="text-xs font-bold text-orange-800 mb-2">Waterfall — Volledige Bundel ({sim.items} Items)</h3>
              <SimResult label="Kostprijs excl. BTW" value={formatEur(costPerItem * sim.items)} />
              <SimResult label="ChiNed Scan & Handling (min € 4,50)" value={formatEur(handlingMinBundle)} />
              <SimResult label="Totale Kostprijs excl. BTW" value={formatEur(costExVatBundle)} large />
              <SimResult label="21% BTW-afdracht" value={formatEur(vatBundle)} />
              <SimResult label="All-in Consumentenprijs (bundel)" value={formatEur(allInBundle)} large />
            </div>

            <div className={`rounded-xl p-3 flex items-center justify-between ${priceZone === 'green' ? 'bg-emerald-100' : priceZone === 'amber' ? 'bg-amber-100' : 'bg-slate-100'}`}>
              <span className="text-xs font-semibold text-slate-700">Retour Damage-Control Indicator</span>
              <span className={`text-xs font-bold ${priceZone === 'green' ? 'text-emerald-700' : priceZone === 'amber' ? 'text-amber-700' : 'text-slate-600'}`}>
                {priceZone === 'green' ? '🟢 Optimale Bundel-Prijszone € 3,50 – € 19,95' : priceZone === 'amber' ? '🟠 Hoger prijspunt > € 25' : 'Neutrale zone € 20 – € 25'}
              </span>
            </div>
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
      <p className="text-xl font-bold text-slate-900">{value}</p>
      {sub && <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function SimInput({ label, value, onChange, suffix, step, min, max, prefix }: { label: string; value: number; onChange: (v: number) => void; suffix?: string; step?: number; min?: number; max?: number; prefix?: string }) {
  return (
    <div>
      <label className="text-xs text-slate-500 block mb-1">{label}</label>
      <div className="relative">
        {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">{prefix}</span>}
        <input type="number" value={value} step={step} min={min} max={max} onChange={e => onChange(parseFloat(e.target.value) || 0)}
          className={`w-full ${prefix ? 'pl-7' : 'pl-3'} ${suffix ? 'pr-8' : 'pr-3'} py-2 rounded-lg border border-slate-200 text-sm focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none`} />
        {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">{suffix}</span>}
      </div>
    </div>
  );
}

function SimResult({ label, value, highlight, large }: { label: string; value: string; highlight?: boolean; large?: boolean }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-slate-500">{label}</span>
      <span className={large ? 'text-sm font-bold text-orange-600' : highlight ? 'font-semibold text-blue-600' : 'font-medium text-slate-700'}>{value}</span>
    </div>
  );
}
