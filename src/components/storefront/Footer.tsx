import { Package, Mail, Phone, MapPin } from 'lucide-react';
import { useStore } from '@/lib/store';

interface Props {
  onNavigate: (page: string) => void;
}

export default function Footer({ onNavigate }: Props) {
  const { legal } = useStore();

  return (
    <footer className="bg-slate-900 text-slate-300 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-white">ChiNed</span>
                <p className="text-[10px] text-slate-400">B2B2C sourcing vanuit Nederland</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Bekijk producten bij Temu, Shein en AliExpress; ChiNed zoekt een voordeliger alternatief bij Chinese sourcing-sites.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-3">Klantenservice</h3>
            <ul className="space-y-2 text-xs">
              <li><button onClick={() => onNavigate('guide')} className="hover:text-orange-400 transition-colors">Hoe werkt het? (Handleiding)</button></li>
              <li><button onClick={() => onNavigate('faq')} className="hover:text-orange-400 transition-colors">FAQ</button></li>
              <li><button onClick={() => onNavigate('track')} className="hover:text-orange-400 transition-colors">Bestelling volgen</button></li>
              <li><button onClick={() => onNavigate('account')} className="hover:text-orange-400 transition-colors">Mijn Account</button></li>
              <li><button onClick={() => onNavigate('terms')} className="hover:text-orange-400 transition-colors">Algemene Voorwaarden</button></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-3">Juridisch</h3>
            <ul className="space-y-2 text-xs">
              <li><button onClick={() => onNavigate('returns')} className="hover:text-orange-400 transition-colors">Retourbeleid</button></li>
              <li><button onClick={() => onNavigate('privacy')} className="hover:text-orange-400 transition-colors">Privacybeleid (AVG)</button></li>
              <li><button onClick={() => onNavigate('terms')} className="hover:text-orange-400 transition-colors">Algemene Voorwaarden</button></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-3">Contact</h3>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-2"><Mail className="w-4 h-4" /> info@chined.nl</li>
              <li className="flex items-center gap-2"><Phone className="w-4 h-4" /> 010-123 45 67</li>
              <li className="flex items-center gap-2"><MapPin className="w-4 h-4" /> Rotterdam, NL</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500">© 2026 ChiNed. Alle rechten voorbehouden.</p>
          <button onClick={() => onNavigate('admin')} className="text-xs text-slate-500 hover:text-orange-400 transition-colors">
            ChiNed Beheer, Hub & Pitch
          </button>
        </div>
      </div>
    </footer>
  );
}
