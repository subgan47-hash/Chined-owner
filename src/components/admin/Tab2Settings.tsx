import { useStore } from '@/lib/store';
import { formatEur } from '@/lib/pricing';
import { Save, AlertTriangle, Check } from 'lucide-react';
import { useState } from 'react';
import type { Settings } from '@/lib/types';

export default function Tab2Settings() {
  const { settings, updateSettings } = useStore();
  const [local, setLocal] = useState<Settings>(settings);
  const [saved, setSaved] = useState(false);
  const [newKeyword, setNewKeyword] = useState('');

  const handleSave = () => {
    updateSettings(local);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const update = (key: keyof Settings, value: any) => setLocal({ ...local, [key]: value });

  const addKeyword = () => {
    if (newKeyword && !local.blockedKeywords.includes(newKeyword.toLowerCase())) {
      update('blockedKeywords', [...local.blockedKeywords, newKeyword.toLowerCase()]);
      setNewKeyword('');
    }
  };

  const removeKeyword = (kw: string) => {
    update('blockedKeywords', local.blockedKeywords.filter(k => k !== kw));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Tarieven, Wisselkoers & Risico-instellingen</h1>
          <p className="text-sm text-slate-500">Beheer alle prijzen, tarieven en risicoregels van ChiNed.</p>
        </div>
        <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-semibold transition-colors">
          {saved ? <><Check className="w-4 h-4" /> Opgeslagen</> : <><Save className="w-4 h-4" /> Opslaan</>}
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Section title="Wisselkoers & Valuta">
          <NumInput label="RMB → EUR wisselkoers" value={local.rmbToEurRate} onChange={v => update('rmbToEurRate', v)} step={0.001} />
          <NumInput label="Valuta buffer (%)" value={local.currencyBufferPct} onChange={v => update('currencyBufferPct', v)} step={0.5} suffix="%" />
          <NumInput label="Merchant → 1688 wholesale ratio (%)" value={local.merchantTo1688Ratio} onChange={v => update('merchantTo1688Ratio', v)} step={1} suffix="%" />
        </Section>

        <Section title="CN Cargo & China Handling">
          <NumInput label="CN Cargo fee (%)" value={local.cnCargoFeePct} onChange={v => update('cnCargoFeePct', v)} step={0.5} suffix="%" />
          <NumInput label="Domestic China shipping (EUR)" value={local.domesticChinaShippingEur} onChange={v => update('domesticChinaShippingEur', v)} step={0.1} prefix="€" />
        </Section>

        <Section title="Vracht & Logistiek">
          <NumInput label="Luchtvracht Tarief (€/kg)" value={local.airRatePerKg} onChange={v => update('airRatePerKg', v)} step={0.05} prefix="€" />
          <NumInput label="Treinvracht Tarief (€/kg)" value={local.railRatePerKg} onChange={v => update('railRatePerKg', v)} step={0.05} prefix="€" />
          <CityToggle label="Luchtvracht Optie Beschikbaar Maken" value={local.airFreightEnabled} onChange={value => update('airFreightEnabled', value)} />
          <NumInput label="Volume weight divisor" value={local.volumeWeightDivisor} onChange={v => update('volumeWeightDivisor', v)} step={100} />
        </Section>

        <Section title="Storefront Uitleg-video">
          <div>
            <label className="text-xs text-slate-500 block mb-1">Uitleg-video URL (YouTube of MP4 link)</label>
            <input type="text" value={local.explainerVideoUrl} onChange={e => update('explainerVideoUrl', e.target.value)} placeholder="https://www.youtube.com/watch?v=... of https://...mp4" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none" />
            <p className="text-[10px] text-slate-400 mt-1">Plak hier de link naar de uitleg-video die op de landingspagina automatisch wordt afgespeeld (gesynchroniseerd, geluidloos).</p>
          </div>
        </Section>

        <Section title="OneBound 1688 API Sleutels">
          <div>
            <label className="text-xs text-slate-500 block mb-1">OneBound API Key</label>
            <input type="text" value={local.oneboundKey || ''} onChange={e => update('oneboundKey' as keyof Settings, e.target.value)} placeholder="t_31647448998" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none" />
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-1">OneBound API Secret</label>
            <input type="text" value={local.oneboundSecret || ''} onChange={e => update('oneboundSecret' as keyof Settings, e.target.value)} placeholder="89988a49" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none" />
          </div>
          <p className="text-[10px] text-slate-400">Deze sleutels worden gebruikt door de 1688-live-zoekfunctie en de 1-klik import in Admin Tab 3.</p>
        </Section>

        <Section title="Douane & BTW">
          <NumInput label="B2B invoerrechten (%)" value={local.b2bDutyPct} onChange={v => update('b2bDutyPct', v)} step={0.5} suffix="%" />
          <NumInput label="Nederlandse BTW (%)" value={local.dutchVatPct} onChange={v => update('dutchVatPct', v)} step={1} suffix="%" />
          <NumInput label="EU small-parcel surcharge" value={local.euSurcharge} onChange={v => update('euSurcharge', v)} step={0.05} prefix="€" />
        </Section>

        <Section title="PostNL & Platform Margin">
          <NumInput label="PostNL standaard tarief" value={local.postnlRate} onChange={v => update('postnlRate', v)} step={0.1} prefix="€" />
          <NumInput label="PostNL volumekorting (rebate)" value={local.postnlRebate} onChange={v => update('postnlRebate', v)} step={0.1} prefix="€" />
          <NumInput label="Platform margin per categorie (incl. BTW)" value={local.platformMarginPerCategory} onChange={v => update('platformMarginPerCategory', v)} step={0.1} prefix="€" />
        </Section>

        <Section title="Steden & Launch"> 
          <p className="text-xs text-slate-500">Bepaal per stad waar checkout actief is. Rotterdam staat klaar voor de pilot.</p>
          <CityToggle label="Rotterdam (3000 - 3099)" value={local.launchCities.rotterdam} onChange={value => update('launchCities', { ...local.launchCities, rotterdam: value })} />
          <CityToggle label="Den Haag (2500 - 2599)" value={local.launchCities.denHaag} onChange={value => update('launchCities', { ...local.launchCities, denHaag: value })} />
          <CityToggle label="Amsterdam (1000 - 1109)" value={local.launchCities.amsterdam} onChange={value => update('launchCities', { ...local.launchCities, amsterdam: value })} />
          <CityToggle label="Utrecht (3500 - 3585)" value={local.launchCities.utrecht} onChange={value => update('launchCities', { ...local.launchCities, utrecht: value })} />
        </Section>

        <Section title="Bundel & Retour">
          <NumInput label="Minimum items per bundel" value={local.minBundleItems} onChange={v => update('minBundleItems', v)} step={1} />
          <NumInput label="Retourpickup vergoeding (incl. BTW)" value={local.returnPickupFee} onChange={v => update('returnPickupFee', v)} step={0.05} prefix="€" />
          <CityToggle label="Max. Artikelprijs voor Eerste Bestelling (€ 30,00)" value={local.firstOrderMaxPriceCapEnabled} onChange={value => update('firstOrderMaxPriceCapEnabled', value)} />
          {local.firstOrderMaxPriceCapEnabled && <NumInput label="Max. Artikelprijs voor Eerste Bestelling (€)" value={local.firstOrderMaxPriceCap} onChange={v => update('firstOrderMaxPriceCap', v)} step={1} prefix="€" />}
        </Section>

        <Section title="ChiNed Retour-Spaarpot">
          <NumInput label="Inleg per standaard item" value={local.communityFundStandard} onChange={v => update('communityFundStandard', v)} step={0.05} prefix="€" />
          <NumInput label="Inleg per kleding item" value={local.communityFundClothing} onChange={v => update('communityFundClothing', v)} step={0.05} prefix="€" />
          <NumInput label="Shopcredit bonus (%)" value={local.shopCreditBonusPct} onChange={v => update('shopCreditBonusPct', v)} step={1} suffix="%" />
        </Section>

        <Section title="Risico & Naleving">
          <div>
            <label className="text-xs text-slate-500 block mb-1">Maximale pakketafmetingen (L x B x H cm)</label>
            <div className="grid grid-cols-3 gap-2">
              <NumInput label="" value={local.maxParcelLength} onChange={v => update('maxParcelLength', v)} />
              <NumInput label="" value={local.maxParcelWidth} onChange={v => update('maxParcelWidth', v)} />
              <NumInput label="" value={local.maxParcelHeight} onChange={v => update('maxParcelHeight', v)} />
            </div>
          </div>
          <NumInput label="Maximaal gewicht (kg)" value={local.maxParcelWeight} onChange={v => update('maxParcelWeight', v)} step={1} />

          <div>
            <label className="text-xs text-slate-500 block mb-1.5">Geblokkeerde risicokenmerken</label>
            <div className="flex gap-2 mb-2">
              <input type="text" value={newKeyword} onChange={e => setNewKeyword(e.target.value)} onKeyDown={e => e.key === 'Enter' && addKeyword()}
                placeholder="Toevoegen..." className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-orange-400 outline-none" />
              <button onClick={addKeyword} className="px-3 py-2 bg-slate-900 text-white rounded-lg text-sm">+</button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {local.blockedKeywords.map(kw => (
                <span key={kw} className="flex items-center gap-1 text-xs bg-red-50 text-red-700 px-2 py-1 rounded-full">
                  <AlertTriangle className="w-3 h-3" /> {kw}
                  <button onClick={() => removeKeyword(kw)} className="hover:text-red-900 font-bold">×</button>
                </span>
              ))}
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
      <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">{title}</h3>
      {children}
    </div>
  );
}

function CityToggle({ label, value, onChange }: { label: string; value: boolean; onChange: (value: boolean) => void }) {
  return <button type="button" onClick={() => onChange(!value)} className="w-full flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2.5 text-left hover:border-orange-300 transition-colors"><span className="text-sm text-slate-700">{label}</span><span className={`relative w-10 h-5 rounded-full transition-colors ${value ? 'bg-emerald-500' : 'bg-slate-300'}`}><span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${value ? 'translate-x-5' : 'translate-x-0.5'}`} /></span></button>;
}

function NumInput({ label, value, onChange, step, prefix, suffix }: { label: string; value: number; onChange: (v: number) => void; step?: number; prefix?: string; suffix?: string }) {
  return (
    <div>
      {label && <label className="text-xs text-slate-500 block mb-1">{label}</label>}
      <div className="relative">
        {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">{prefix}</span>}
        <input type="number" value={value} step={step} onChange={e => onChange(parseFloat(e.target.value) || 0)}
          className={`w-full ${prefix ? 'pl-7' : 'pl-3'} ${suffix ? 'pr-8' : 'pr-3'} py-2 rounded-lg border border-slate-200 text-sm focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none`} />
        {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">{suffix}</span>}
      </div>
    </div>
  );
}
