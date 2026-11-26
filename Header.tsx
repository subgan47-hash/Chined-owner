import { ShoppingCart, Package, Menu, X, LogIn, LogOut, BookOpen } from 'lucide-react';
import { useStore } from '@/lib/store';
import { useState } from 'react';

interface Props {
  onNavigate: (page: string) => void;
  currentPage: string;
  onLogin: () => void;
  customerUser: { name: string } | null;
  onLogout: () => void;
}

export default function Header({ onNavigate, currentPage, onLogin, customerUser, onLogout }: Props) {
  const { cart, setCartOpen, legal } = useStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const itemCount = cart.reduce((sum, ci) => sum + ci.quantity, 0);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
      <div className="bg-orange-600 text-white text-center text-xs py-1.5 px-4 font-medium truncate">
        {legal.trustBar}
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button onClick={() => onNavigate('home')} className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center shadow-md">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <span className="text-xl font-bold text-slate-900 tracking-tight">ChiNed</span>
              <span className="block text-[10px] text-slate-500 -mt-1">Vind het goedkoper in China</span>
            </div>
          </button>

          <nav className="hidden md:flex items-center gap-1">
            <NavBtn active={currentPage === 'home'} onClick={() => onNavigate('home')}>Winkel</NavBtn>
            <NavBtn active={currentPage === 'track'} onClick={() => onNavigate('track')}>Volg Bestelling</NavBtn>
            <NavBtn active={currentPage === 'account'} onClick={() => onNavigate('account')}>Mijn Account</NavBtn>
            <NavBtn active={currentPage === 'faq'} onClick={() => onNavigate('faq')}>FAQ</NavBtn>
            <NavBtn active={currentPage === 'guide'} onClick={() => onNavigate('guide')}><BookOpen className="inline w-4 h-4 mr-1" /> Hoe werkt het?</NavBtn>
          </nav>

          <div className="flex items-center gap-2">
            {customerUser ? <button onClick={onLogout} className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-orange-600"><LogOut className="w-4 h-4" /> {customerUser.name}</button> : <button onClick={onLogin} className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-orange-600"><LogIn className="w-4 h-4" /> Inloggen</button>}
            <button
              onClick={() => setCartOpen(true)}
              className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Winkelmandje"
            >
              <ShoppingCart className="w-6 h-6 text-slate-700" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-lg hover:bg-slate-100">
              {mobileOpen ? <X className="w-6 h-6 text-slate-700" /> : <Menu className="w-6 h-6 text-slate-700" />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1">
          <MobileNavBtn active={currentPage === 'home'} onClick={() => { onNavigate('home'); setMobileOpen(false); }}>Winkel</MobileNavBtn>
          <MobileNavBtn active={currentPage === 'track'} onClick={() => { onNavigate('track'); setMobileOpen(false); }}>Volg Bestelling</MobileNavBtn>
          <MobileNavBtn active={currentPage === 'account'} onClick={() => { onNavigate('account'); setMobileOpen(false); }}>Mijn Account</MobileNavBtn>
          <MobileNavBtn active={currentPage === 'faq'} onClick={() => { onNavigate('faq'); setMobileOpen(false); }}>FAQ</MobileNavBtn>
          <MobileNavBtn active={currentPage === 'guide'} onClick={() => { onNavigate('guide'); setMobileOpen(false); }}>Hoe werkt het?</MobileNavBtn>
          {customerUser ? <MobileNavBtn active={false} onClick={() => { onLogout(); setMobileOpen(false); }}>Uitloggen ({customerUser.name})</MobileNavBtn> : <MobileNavBtn active={false} onClick={() => { onLogin(); setMobileOpen(false); }}>Inloggen</MobileNavBtn>}
        </div>
      )}
    </header>
  );
}

function NavBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        active ? 'text-orange-600 bg-orange-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
      }`}
    >
      {children}
    </button>
  );
}

function MobileNavBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`block w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium ${
        active ? 'text-orange-600 bg-orange-50' : 'text-slate-600 hover:bg-slate-50'
      }`}
    >
      {children}
    </button>
  );
}
