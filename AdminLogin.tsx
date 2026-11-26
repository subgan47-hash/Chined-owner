import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Package, Lock, ArrowLeft } from 'lucide-react';

interface Props {
  onBack: () => void;
}

export default function AdminLogin({ onBack }: Props) {
  const { loginAdmin } = useStore();
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginAdmin(password)) {
      setError(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <button onClick={onBack} className="text-slate-400 hover:text-white text-xs flex items-center gap-1 mb-6">
          <ArrowLeft className="w-4 h-4" /> Terug naar winkel
        </button>

        <div className="bg-slate-800 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center mx-auto mb-3">
              <Package className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">ChiNed Beheer</h1>
            <p className="text-xs text-slate-400 mt-1">Hub & Pitch Portal</p>
          </div>

          <form onSubmit={handleSubmit}>
            <label className="text-xs font-medium text-slate-300 block mb-2">Wachtwoord</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(false); }}
                autoFocus
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-slate-700 border border-slate-600 text-white text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none"
                placeholder="Voer beheerderswachtwoord in"
              />
            </div>
            {error && (
              <p className="text-xs text-red-400 mt-2">Onjuist wachtwoord. Probeer opnieuw.</p>
            )}
            <button type="submit" className="w-full mt-4 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold text-sm transition-colors">
              Inloggen
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
