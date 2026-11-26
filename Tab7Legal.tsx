import { useStore } from '@/lib/store';
import type { LegalDocs, PriceProof } from '@/lib/types';
import { FileText, RotateCcw, Shield, HelpCircle, Save, Check, Megaphone, Camera, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

const PAGES: { key: keyof LegalDocs; label: string; icon: React.ReactNode }[] = [
  { key: 'terms', label: 'Algemene Voorwaarden', icon: <FileText className="w-4 h-4" /> },
  { key: 'returnPolicy', label: 'Retourbeleid', icon: <RotateCcw className="w-4 h-4" /> },
  { key: 'privacy', label: 'Privacyverklaring', icon: <Shield className="w-4 h-4" /> },
  { key: 'faq', label: 'FAQ', icon: <HelpCircle className="w-4 h-4" /> },
  { key: 'handbookAdmin', label: 'Beheerdershandboek', icon: <FileText className="w-4 h-4" /> },
  { key: 'handbookCustomer', label: 'Klantenhandleiding', icon: <FileText className="w-4 h-4" /> },
  { key: 'guide', label: 'Winkelgids', icon: <FileText className="w-4 h-4" /> },
];

export default function Tab7Legal() {
  const { legal, updateLegal, priceProofs, updatePriceProofs } = useStore();
  const [proofs, setProofs] = useState<PriceProof[]>(priceProofs);
  const [local, setLocal] = useState<LegalDocs>(legal);
  const [activePage, setActivePage] = useState<keyof LegalDocs>('terms');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateLegal(local);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Juridisch & Content Beheer</h1>
          <p className="text-sm text-slate-500">Bewerk juridische documenten en homepage banners.</p>
        </div>
        <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-semibold transition-colors">
          {saved ? <><Check className="w-4 h-4" /> Opgeslagen</> : <><Save className="w-4 h-4" /> Opslaan</>}
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6">
        <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
          <Megaphone className="w-4 h-4 text-orange-600" /> Homepage Marketing Banners
        </h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-slate-500 block mb-1">Hero Banner (hoofdpagina titel)</label>
            <textarea value={local.heroBanner} onChange={e => setLocal({ ...local, heroBanner: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none resize-none" />
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-1">Trust Bar (top bar tekst)</label>
            <textarea value={local.trustBar} onChange={e => setLocal({ ...local, trustBar: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none resize-none" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6">
        <div className="flex items-center justify-between gap-3 mb-3"><h3 className="text-sm font-bold text-slate-900 flex items-center gap-2"><Camera className="w-4 h-4 text-orange-600" /> Prijsbewijs Screenshots Beheren</h3><button onClick={() => setProofs([...proofs, { id: `proof-${Date.now()}`, title: `Praktijkvoorbeeld #${proofs.length + 1}`, imageUrl: '', sourceImageUrl: '', temuPrice: 0, euSurcharge: 6.05, sourceRmb: 0, sourceEur: 0, chinedPrice: 0, saving: 0, savingPct: 0, temuUrl: 'https://www.temu.com', sourceUrl: 'https://www.1688.com' }])} className="flex items-center gap-1 px-3 py-2 rounded-lg bg-orange-600 text-white text-xs font-semibold"><Plus className="w-3 h-3" /> Nieuw prijsbewijs toevoegen</button></div>
        <p className="text-xs text-slate-500 mb-4">Upload een screenshot; die wordt als base64 in lokale opslag bewaard. Bewerk de voorbeeldprijzen en sla daarna op.</p>
        <div className="space-y-4">{proofs.map((proof, index) => <ProofEditor key={proof.id} proof={proof} onChange={next => setProofs(proofs.map((item, itemIndex) => itemIndex === index ? next : item))} onDelete={() => setProofs(proofs.filter(item => item.id !== proof.id))} />)}</div>
        <button onClick={() => updatePriceProofs(proofs)} className="mt-4 px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold">Prijsbewijzen opslaan</button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {PAGES.map(p => (
          <button key={p.key} onClick={() => setActivePage(p.key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${activePage === p.key ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'}`}>
            {p.icon} {p.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="text-sm font-bold text-slate-900 mb-3">
          {PAGES.find(p => p.key === activePage)?.label}
        </h3>
        <textarea
          value={local[activePage]}
          onChange={e => setLocal({ ...local, [activePage]: e.target.value })}
          rows={24}
          className="w-full px-4 py-3 rounded-lg border border-slate-200 text-sm text-slate-700 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none resize-y font-mono leading-relaxed"
        />
        <p className="text-xs text-slate-400 mt-2">
          Wijzigingen worden direct opgeslagen in de lokale opslag en zijn zichtbaar in de winkel na het opslaan.
        </p>
      </div>
    </div>
  );
}

function ProofEditor({ proof, onChange, onDelete }: { proof: PriceProof; onChange: (proof: PriceProof) => void; onDelete: () => void }) {
  const isText = (key: keyof PriceProof) => key === 'title' || key === 'imageUrl' || key === 'sourceImageUrl' || key === 'temuUrl' || key === 'sourceUrl';
  const set = (key: keyof PriceProof, value: string) => onChange({ ...proof, [key]: isText(key) ? value : Number(value) });
  const upload = (target: 'imageUrl' | 'sourceImageUrl') => (event: React.ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => onChange({ ...proof, [target]: String(reader.result) }); reader.readAsDataURL(file); };
  return <div className="border border-slate-200 rounded-lg p-3"><div className="grid md:grid-cols-[1fr_auto] gap-3 items-start mb-3"><input value={proof.title} onChange={event => set('title', event.target.value)} placeholder="Titel" className="px-2 py-1.5 border rounded text-xs text-slate-900" /><button onClick={onDelete} className="p-2 text-red-500 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button></div><div className="grid grid-cols-2 gap-3 mb-3"><div><label className="block text-[10px] text-slate-500 mb-1">Temu screenshot</label>{proof.imageUrl ? <img src={proof.imageUrl} alt="Temu" className="w-full h-24 object-cover rounded" /> : <div className="w-full h-24 rounded bg-slate-100 flex items-center justify-center text-[10px] text-slate-400">Geen screenshot</div>}<label className="block mt-1 text-[10px] text-orange-700 cursor-pointer">Uploaden<input type="file" accept="image/*" onChange={upload('imageUrl')} className="hidden" /></label></div><div><label className="block text-[10px] text-slate-500 mb-1">1688 screenshot</label>{proof.sourceImageUrl ? <img src={proof.sourceImageUrl} alt="1688" className="w-full h-24 object-cover rounded" /> : <div className="w-full h-24 rounded bg-slate-100 flex items-center justify-center text-[10px] text-slate-400">Geen screenshot</div>}<label className="block mt-1 text-[10px] text-orange-700 cursor-pointer">Uploaden<input type="file" accept="image/*" onChange={upload('sourceImageUrl')} className="hidden" /></label></div></div><div className="grid grid-cols-2 sm:grid-cols-4 gap-2">{(['temuPrice','euSurcharge','sourceRmb','sourceEur','chinedPrice','saving','savingPct'] as const).map(key => <input key={key} type="number" step="0.01" value={proof[key]} onChange={event => set(key, event.target.value)} placeholder={key} className="px-2 py-1.5 border rounded text-xs text-slate-900" />)}</div></div>;
}
