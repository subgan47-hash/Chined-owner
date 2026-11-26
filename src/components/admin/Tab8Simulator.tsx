import { useStore } from '@/lib/store';
import { formatEur } from '@/lib/pricing';
import { TrendingUp, Package, Wallet, Leaf, Maximize2, X, Train, Users, Languages, Copy, Check, ChevronDown, Plane } from 'lucide-react';
import { useState } from 'react';

export default function Tab8Simulator() {
  const { settings } = useStore();
  const [params, setParams] = useState({
    monthlyVolume: 25000,
    avgCategories: 4,
    postnlDiscount: 1.0,
  });
  const [presentMode, setPresentMode] = useState(false);
  const [simFreightMode, setSimFreightMode] = useState<'air' | 'train'>('air');
  const [pilotOpen, setPilotOpen] = useState(true);
  const [thesisOpen, setThesisOpen] = useState(true);
  const [thesisLang, setThesisLang] = useState<'nl' | 'en'>('nl');
  const [thesisCopied, setThesisCopied] = useState(false);
  const thesisNl = `Strategische Marktanalyse: EU-Heffing (€ 5,00 excl. BTW sinds 1 nov 2026) & het 40-60% Marktverlies.

Sinds 1 november 2026 heft de EU een vast bedrag van € 5,00 (excl. BTW) per pakket op directe B2C-import uit China. Dit treft platforms als Temu, Shein en AliExpress direct in hun prijsvoordeel en leidt naar schatting tot 40-60% minder bestellingen voor goedkope artikelen onder de € 20-25. ChiNed loopt via een B2B2C-route via Rotterdam waardoor deze heffing per pakket niet van toepassing is, terwijl klanten wél dezelfde producten uit Chinese groothandels (1688, Taobao, Pinduoduo) betalen met 18-24 dagen treinvracht. Dit creëert een aanzienlijk concurrentievoordeel op het moment dat de markt juist krimpt door de nieuwe heffing. Het Rotterdamse pilot-model met lokale wijkdistributie maakt bovendien bijkomende besparingen mogelijk op PostNL-kosten en retourverwerking.`;
  const thesisEn = `Strategic Market Analysis: EU Levy (€5.00 excl. VAT since 1 Nov 2026) & the 40-60% Market Loss.

Since 1 November 2026 the EU applies a fixed €5.00 (excl. VAT) per parcel on direct B2C imports from China. This directly hits platforms like Temu, Shein and AliExpress in their price advantage and is estimated to reduce orders by 40-60% for low-cost items below €20-25. ChiNed uses a B2B2C route via Rotterdam so this per-parcel levy does not apply, while customers still pay the same products from Chinese wholesalers (1688, Taobao, Pinduoduo) with 18-24 day rail freight. This creates a significant competitive advantage at the very moment the market is contracting because of the new levy. The Rotterdam pilot model with local neighborhood distribution also enables additional savings on PostNL costs and return processing.`;
  const thesisText = thesisLang === 'nl' ? thesisNl : thesisEn;
  const [pilotVolume, setPilotVolume] = useState(300);
  const [partners, setPartners] = useState(2);
  const monthlyPilotVolume = pilotVolume * 30;
  const boxesPerDay = Math.ceil(pilotVolume / 12);
  const pilotNetProfit = (monthlyPilotVolume * (settings.platformMarginPerCategory + settings.postnlRate + 6.5)) - 18500;
  const profitPerPartner = pilotNetProfit / partners;

  const simFreightRate = simFreightMode === 'air' ? settings.airRatePerKg : settings.railRatePerKg;
  const simDeliveryDays = simFreightMode === 'air' ? '8\u201312 dagen' : '25\u201330 dagen';
  const adjustedVolume = Math.round(params.monthlyVolume * 0.85);
  const postnlExtraProfit = adjustedVolume * params.postnlDiscount;
  const avgRevenuePerParcel = (params.avgCategories * settings.platformMarginPerCategory) + settings.postnlRate + 5;
  const totalRevenue = adjustedVolume * avgRevenuePerParcel;
  const totalProductCost = adjustedVolume * (avgRevenuePerParcel * 0.55);
  const totalFreight = adjustedVolume * 3.5 * (simFreightRate / 2.50);
  const totalDuty = adjustedVolume * 1.2 * (simFreightRate / 2.50);
  const totalNetProfit = totalRevenue - totalProductCost - totalFreight - totalDuty + postnlExtraProfit;
  const consumerSavings = adjustedVolume * params.avgCategories * settings.euSurcharge;
  const returnFundInflow = adjustedVolume * 3.5;
  const returnFundSaved = returnFundInflow;

  const maxVol = 500000;
  const volPct = ((params.monthlyVolume - 25000) / (maxVol - 25000)) * 100;
  const catPct = ((params.avgCategories - 1) / 7) * 100;
  const discPct = ((params.postnlDiscount - 0.5) / 1.0) * 100;

  return (
    <div>
      <div className="flex items-center justify-between mb-6 print:hidden">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Talpa & PostNL Boardroom Pitch Simulator</h1>
          <p className="text-sm text-slate-500">Investor Mode — interactieve simulator voor boardroom meetings.</p>
        </div>
        <button onClick={() => setPresentMode(true)} className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-semibold">
          <Maximize2 className="w-4 h-4" /> Presentatiemodus
        </button>
      </div>

      <div className="bg-white rounded-xl border border-blue-200 p-5 mb-6">
        <button onClick={() => setThesisOpen(!thesisOpen)} className="w-full flex items-center justify-between text-left"><h2 className="text-base font-bold text-slate-900">Strategische Marktanalyse: EU-Heffing (€ 5,00 excl. BTW sinds 1 nov 2026) &amp; het 40–60% Marktverlies</h2><ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${thesisOpen ? 'rotate-180' : ''}`} /></button>
        {thesisOpen && <div className="mt-4"><div className="flex items-center gap-2 mb-3"><button onClick={() => setThesisLang('nl')} className={`px-3 py-1 rounded-lg text-xs font-semibold ${thesisLang === 'nl' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>NL</button><button onClick={() => setThesisLang('en')} className={`px-3 py-1 rounded-lg text-xs font-semibold ${thesisLang === 'en' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>EN</button><button onClick={() => { navigator.clipboard.writeText(thesisText); setThesisCopied(true); setTimeout(() => setThesisCopied(false), 2000); }} className="ml-auto flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200">{thesisCopied ? <><Check className="w-3.5 h-3.5 text-emerald-600" /> Gekopieerd</> : <><Copy className="w-3.5 h-3.5" /> Kopieer Tekst</>}</button></div><p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">{thesisText}</p></div>}
      </div>

      <div className="bg-white rounded-xl border border-emerald-200 p-5 mb-6">
        <button onClick={() => setPilotOpen(!pilotOpen)} className="w-full flex items-center justify-between text-left"><div><h2 className="text-base font-bold text-slate-900">Rotterdam Pilot & Team Calculator</h2><p className="text-xs text-slate-500">Bereken wijkdistributie met 2–3 partners naast de landelijke simulatie.</p></div><span className={`w-10 h-5 rounded-full relative ${pilotOpen ? 'bg-emerald-500' : 'bg-slate-300'}`}><span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${pilotOpen ? 'translate-x-5' : 'translate-x-0.5'}`} /></span></button>
        {pilotOpen && <div className="mt-5 grid lg:grid-cols-3 gap-5"><div><label className="text-xs font-semibold text-slate-600 flex justify-between"><span>Dagelijks Volume Rotterdam</span><b className="text-emerald-700">{pilotVolume} bundels/dag</b></label><input type="range" min="50" max="500" step="10" value={pilotVolume} onChange={event => setPilotVolume(Number(event.target.value))} className="w-full mt-3 accent-emerald-600" /><div className="flex justify-between text-[10px] text-slate-400"><span>50</span><span>500</span></div></div><div><label className="text-xs font-semibold text-slate-600 block mb-2">Aantal partners / teamleden</label><select value={partners} onChange={event => setPartners(Number(event.target.value))} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900"><option value="1">1 partner</option><option value="2">2 partners</option><option value="3">3 partners</option></select></div><div className="grid grid-cols-2 gap-2"><PilotKpi label="Per maand" value={monthlyPilotVolume.toLocaleString('nl-NL')} /><PilotKpi label="Omdozen/dag" value={boxesPerDay.toLocaleString('nl-NL')} /><PilotKpi label="Netto totaal/maand" value={formatEur(pilotNetProfit)} /><PilotKpi label="Per partner/maand" value={formatEur(profitPerPartner)} /></div></div>}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Simulator Parameters</h3>

            <Slider label="Maandelijks Pakketvolume" value={params.monthlyVolume} min={25000} max={500000} step={5000}
              onChange={v => setParams({ ...params, monthlyVolume: v })}
              display={`${params.monthlyVolume.toLocaleString('nl-NL')} pakketten/maand`} pct={volPct} />

            <Slider label="Gemiddeld aantal categorieën" value={params.avgCategories} min={1} max={8} step={1}
              onChange={v => setParams({ ...params, avgCategories: v })}
              display={`${params.avgCategories} categorieën/pakket`} pct={catPct} />

            <Slider label="PostNL Volumekorting" value={params.postnlDiscount} min={0.5} max={1.5} step={0.1}
              onChange={v => setParams({ ...params, postnlDiscount: v })}
              display={`${formatEur(params.postnlDiscount)}/pakket`} pct={discPct} />

            <div className="mt-4">
              <label className="text-xs font-semibold text-slate-600 block mb-2">Vrachtmodus (levertijd & tarief)</label>
              <div className="flex gap-2">
                <button onClick={() => setSimFreightMode('air')} className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${simFreightMode === 'air' ? 'bg-orange-600 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:border-orange-300'}`}><Plane className="w-3.5 h-3.5" /> Luchtvracht ({formatEur(settings.airRatePerKg)}/kg \u2022 8\u201312 dagen)</button>
                <button onClick={() => setSimFreightMode('train')} className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${simFreightMode === 'train' ? 'bg-emerald-600 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:border-emerald-300'}`}><Train className="w-3.5 h-3.5" /> Treinvracht ({formatEur(settings.railRatePerKg)}/kg \u2022 25\u201330 dagen)</button>
              </div>
              <p className="text-[10px] text-slate-400 mt-1.5">Huidige modus: <b className="text-slate-600">{simFreightMode === 'air' ? 'Luchtvracht' : 'Treinvracht'}</b> \u00b7 {formatEur(simFreightRate)}/kg \u00b7 {simDeliveryDays}</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-5 text-white">
            <h3 className="text-sm font-bold mb-3 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-orange-400" /> Kernpropositie</h3>
            <ul className="text-xs text-slate-300 space-y-2">
              <li className="flex items-start gap-2"><Leaf className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" /> 0% vervuilende zeevracht — 100% trein & lucht</li>
              <li className="flex items-start gap-2"><Wallet className="w-3.5 h-3.5 text-orange-400 mt-0.5 flex-shrink-0" /> 0% retourverlies door Community Fonds</li>
              <li className="flex items-start gap-2"><Package className="w-3.5 h-3.5 text-blue-400 mt-0.5 flex-shrink-0" /> B2B import via Rotterdam = geen EU-toeslagen</li>
              <li className="flex items-start gap-2"><Train className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" /> PostNL last-mile partner met volumekorting</li>
              <li className="flex items-start gap-2"><Users className="w-3.5 h-3.5 text-purple-400 mt-0.5 flex-shrink-0" /> Community-gedreven retourfonds = klantloyaliteit</li>
            </ul>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <BigKpi icon={<Package className="w-5 h-5" />} title="Hersteld Pakketvolume" value={adjustedVolume.toLocaleString('nl-NL')} sub="pakketten/maand voor PostNL" color="text-blue-600 bg-blue-50" />
            <BigKpi icon={<Wallet className="w-5 h-5" />} title="Extra Winst PostNL-korting" value={formatEur(postnlExtraProfit)} sub="per maand" color="text-orange-600 bg-orange-50" />
            <BigKpi icon={<TrendingUp className="w-5 h-5" />} title="ChiNed Nettowinst" value={formatEur(totalNetProfit)} sub="per maand (incl. PostNL korting)" color="text-emerald-600 bg-emerald-50" />
            <BigKpi icon={<Leaf className="w-5 h-5" />} title="Consumentenbesparing NL" value={formatEur(consumerSavings)} sub="per maand aan EU-heffingen" color="text-green-600 bg-green-50" />
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Live Charts</h3>

            <div className="space-y-4">
              <ChartBar label="Maandelijkse Nettowinst" value={totalNetProfit} max={totalNetProfit * 1.2} color="bg-emerald-500" formatV={formatEur} />
              <ChartBar label="Extra PostNL Winst" value={postnlExtraProfit} max={totalNetProfit} color="bg-orange-500" formatV={formatEur} />
              <ChartBar label="Community Fonds Bespaard" value={returnFundSaved} max={returnFundInflow * 1.2} color="bg-purple-500" formatV={formatEur} />
              <ChartBar label="Consumentenbesparing" value={consumerSavings} max={consumerSavings * 1.2} color="bg-blue-500" formatV={formatEur} />
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="bg-emerald-50 rounded-lg p-3 text-center">
                <p className="text-xs text-emerald-700 font-medium">0% Retourverlies</p>
                <p className="text-lg font-bold text-emerald-600">door Community Fonds</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <p className="text-xs text-blue-700 font-medium">Jaarlijkse Nettowinst</p>
                <p className="text-lg font-bold text-blue-600">{formatEur(totalNetProfit * 12)}</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 rounded-xl p-5 text-white">
            <h3 className="text-sm font-bold mb-3">Investor Pitch Highlights</h3>
            <div className="grid grid-cols-3 gap-3 text-center">
              <PitchStat value={`${formatEur(totalNetProfit * 12)}`} label="Jaaromzet potentieel" />
              <PitchStat value={`${(adjustedVolume * 12).toLocaleString('nl-NL')}`} label="Pakketten/jaar" />
              <PitchStat value={`${formatEur(consumerSavings * 12)}`} label="Jaarlijkse besparing NL" />
            </div>
          </div>
        </div>
      </div>

      {presentMode && (
        <div className="fixed inset-0 z-50 bg-slate-900 flex flex-col p-8">
          <button onClick={() => setPresentMode(false)} className="absolute top-4 right-4 text-white/60 hover:text-white">
            <X className="w-6 h-6" />
          </button>

          <div className="flex-1 flex flex-col items-center justify-center max-w-5xl mx-auto w-full">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center">
                <Package className="w-7 h-7 text-white" />
              </div>
              <span className="text-3xl font-bold text-white">ChiNed</span>
            </div>
            <p className="text-slate-400 text-sm mb-8">Winkel bij 1688, Shein, Temu & AliExpress — Slim gebundeld via Rotterdam</p>

            <div className="grid grid-cols-2 gap-6 w-full mb-8">
              <PresentStat label="Maandelijks volume" value={adjustedVolume.toLocaleString('nl-NL')} sub="pakketten" />
              <PresentStat label="Maandelijkse nettowinst" value={formatEur(totalNetProfit)} sub="incl. PostNL korting" />
              <PresentStat label="Consumentenbesparing/maand" value={formatEur(consumerSavings)} sub="EU-heffingen vermeden" />
              <PresentStat label="Extra PostNL winst/maand" value={formatEur(postnlExtraProfit)} sub={`@ ${formatEur(params.postnlDiscount)}/pakket`} />
            </div>

            <div className="flex gap-4 w-full">
              <div className="flex-1 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 text-center">
                <Leaf className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-emerald-400">0%</p>
                <p className="text-xs text-slate-300">Retourverlies door Community Fonds</p>
              </div>
              <div className="flex-1 bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 text-center">
                <TrendingUp className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-orange-400">{formatEur(totalNetProfit * 12)}</p>
                <p className="text-xs text-slate-300">Jaarlijkse nettowinst</p>
              </div>
              <div className="flex-1 bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 text-center">
                <Wallet className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-400">{formatEur(consumerSavings * 12)}</p>
                <p className="text-xs text-slate-300">Jaarlijkse besparing Nederland</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Slider({ label, value, min, max, step, onChange, display, pct }: {
  label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; display: string; pct: number;
}) {
  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs text-slate-500">{label}</label>
        <span className="text-xs font-bold text-orange-600">{display}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(parseFloat(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer bg-slate-200 accent-orange-600"
        style={{ background: `linear-gradient(to right, #ea580c ${pct}%, #e2e8f0 ${pct}%)` }} />
    </div>
  );
}

function BigKpi({ icon, title, value, sub, color }: { icon: React.ReactNode; title: string; value: string; sub: string; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-2 ${color}`}>{icon}</div>
      <p className="text-xs text-slate-500">{title}</p>
      <p className="text-xl font-bold text-slate-900">{value}</p>
      <p className="text-[10px] text-slate-400">{sub}</p>
    </div>
  );
}

function ChartBar({ label, value, max, color, formatV }: { label: string; value: number; max: number; color: string; formatV: (n: number) => string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-slate-500">{label}</span>
        <span className="text-xs font-bold text-slate-700">{formatV(value)}</span>
      </div>
      <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function PitchStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <p className="text-2xl font-bold text-orange-400">{value}</p>
      <p className="text-[10px] text-slate-400 mt-0.5">{label}</p>
    </div>
  );
}

function PilotKpi({ label, value }: { label: string; value: string }) { return <div className="rounded-lg bg-emerald-50 p-2"><p className="text-[10px] text-emerald-700">{label}</p><p className="text-sm font-bold text-slate-900">{value}</p></div>; }

function PresentStat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      <p className="text-3xl font-bold text-white">{value}</p>
      <p className="text-[10px] text-slate-500 mt-0.5">{sub}</p>
    </div>
  );
}
