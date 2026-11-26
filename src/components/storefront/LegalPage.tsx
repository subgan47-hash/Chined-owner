import { useStore } from '@/lib/store';
import { FileText, RotateCcw, Shield, HelpCircle } from 'lucide-react';

interface Props {
  page: 'terms' | 'returns' | 'privacy' | 'faq' | 'guide';
  onNavigate: (page: string) => void;
}

const PAGE_CONFIG = {
  terms: { icon: <FileText className="w-5 h-5" />, title: 'Algemene Voorwaarden van ChiNed', key: 'terms' as const },
  returns: { icon: <RotateCcw className="w-5 h-5" />, title: 'Retourbeleid', key: 'returnPolicy' as const },
  privacy: { icon: <Shield className="w-5 h-5" />, title: 'Privacybeleid (AVG)', key: 'privacy' as const },
  faq: { icon: <HelpCircle className="w-5 h-5" />, title: 'Veelgestelde Vragen', key: 'faq' as const },
  guide: { icon: <HelpCircle className="w-5 h-5" />, title: 'Hoe werkt ChiNed?', key: 'guide' as const },
};

export default function LegalPage({ page, onNavigate }: Props) {
  const { legal } = useStore();
  const config = PAGE_CONFIG[page];
  const content = legal[config.key];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button onClick={() => onNavigate('home')} className="text-xs text-slate-500 hover:text-orange-600 mb-4">← Terug naar winkel</button>
        <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">{config.icon}</div>
            <h1 className="text-xl font-bold text-slate-900">{config.title}</h1>
          </div>
          <div className="prose prose-slate max-w-none text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
            {content}
          </div>
        </div>
      </div>
    </div>
  );
}
