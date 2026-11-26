import { useState, useEffect, useCallback } from 'react';
import { StoreProvider, useStore } from '@/lib/store';
import type { Product, Merchant, Order } from '@/lib/types';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

import Header from '@/components/storefront/Header';
import Hero from '@/components/storefront/Hero';
import ProductGrid from '@/components/storefront/ProductGrid';
import ProductModal from '@/components/storefront/ProductModal';
import CartDrawer from '@/components/storefront/CartDrawer';
import Checkout from '@/components/storefront/Checkout';
import Footer from '@/components/storefront/Footer';
import CustomerAuthModal from '@/components/storefront/CustomerAuthModal';
import PriceProofSection from '@/components/storefront/PriceProofSection';
import MyAccount from '@/components/storefront/MyAccount';
import TrackOrder from '@/components/storefront/TrackOrder';
import LegalPage from '@/components/storefront/LegalPage';

import AdminLogin from '@/components/admin/AdminLogin';
import AdminLayout, { type AdminTab } from '@/components/admin/AdminLayout';
import Tab1Dashboard from '@/components/admin/Tab1Dashboard';
import Tab2Settings from '@/components/admin/Tab2Settings';
import Tab3ReturnFund from '@/components/admin/Tab3ReturnFund';
import Tab4Procurement from '@/components/admin/Tab4Procurement';
import Tab5HubScanner from '@/components/admin/Tab5HubScanner';
import Tab6ApiKeys from '@/components/admin/Tab6ApiKeys';
import Tab7Legal from '@/components/admin/Tab7Legal';
import Tab8Simulator from '@/components/admin/Tab8Simulator';
import Tab9Handbook from '@/components/admin/Tab9Handbook';

type Page = 'home' | 'track' | 'account' | 'faq' | 'terms' | 'returns' | 'privacy' | 'guide' | 'admin';

function AppContent() {
  const { isAdmin, cart, setCartOpen, customerUser, logoutCustomer } = useStore();
  const [page, setPage] = useState<Page>('home');
  const [adminTab, setAdminTab] = useState<AdminTab>('dashboard');
  const [productModal, setProductModal] = useState<Product | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState<{ query: string; merchant: Merchant | 'all' }>({ query: '', merchant: 'all' });
  const [authOpen, setAuthOpen] = useState(false);
  const [welcomeOpen, setWelcomeOpen] = useState(() => !customerUser);
  const [pendingAction, setPendingAction] = useState<'checkout' | 'account' | null>(null);

  const closeModals = useCallback(() => {
    setProductModal(null);
    setCheckoutOpen(false);
    setAuthOpen(false);
    setWelcomeOpen(false);
  }, []);

  useEffect(() => {
    const onPopState = () => {
      setPage('home');
      closeModals();
      window.scrollTo({ top: 0 });
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [closeModals]);

  useEffect(() => {
    if (page !== 'home' || productModal || checkoutOpen || authOpen || welcomeOpen) {
      window.history.pushState({ chined: 'sub' }, '');
    }
  }, [page, productModal, checkoutOpen, authOpen, welcomeOpen]);

  const handleNavigate = (p: string) => {
    if (p === 'account' && !customerUser) { setPendingAction('account'); setAuthOpen(true); return; }
    setPage(p as Page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = (query: string, merchant: Merchant | 'all') => {
    setSearchFilter({ query, merchant });
    setPage('home');
    setTimeout(() => {
      const grid = document.getElementById('product-grid-section');
      if (grid) grid.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleCheckoutComplete = (order: Order) => {
    setCheckoutOpen(false);
    setPage('track');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (page === 'admin') {
    if (!isAdmin) {
      return <AdminLogin onBack={() => handleNavigate('home')} />;
    }
    return (
      <AdminLayout activeTab={adminTab} onTabChange={setAdminTab} onExit={() => handleNavigate('home')}>
        {adminTab === 'dashboard' && <Tab1Dashboard />}
        {adminTab === 'settings' && <Tab2Settings />}
        {adminTab === 'returnfund' && <Tab3ReturnFund />}
        {adminTab === 'procurement' && <Tab4Procurement />}
        {adminTab === 'hubscanner' && <Tab5HubScanner />}
        {adminTab === 'apikeys' && <Tab6ApiKeys />}
        {adminTab === 'legal' && <Tab7Legal />}
        {adminTab === 'simulator' && <Tab8Simulator />}
        {adminTab === 'handbook' && <Tab9Handbook />}
      </AdminLayout>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header onNavigate={handleNavigate} currentPage={page} onLogin={() => setAuthOpen(true)} customerUser={customerUser} onLogout={logoutCustomer} />

      <main className="flex-1">
        {page === 'home' && (
          <>
            <Hero onSearch={handleSearch} />
            <PriceProofSection />
            <div id="product-grid-section">
              <ProductGrid filter={searchFilter} onProductClick={setProductModal} />
            </div>
          </>
        )}
        {page === 'track' && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
            <button onClick={() => handleNavigate('home')} className="md:hidden flex items-center gap-1 text-sm font-semibold text-slate-600 mb-4"><ArrowLeft className="w-4 h-4" /> Terug</button>
            <TrackOrder />
          </div>
        )}
        {page === 'account' && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
            <button onClick={() => handleNavigate('home')} className="md:hidden flex items-center gap-1 text-sm font-semibold text-slate-600 mb-4"><ArrowLeft className="w-4 h-4" /> Terug</button>
            <MyAccount onNavigate={handleNavigate} />
          </div>
        )}
        {(page === 'faq' || page === 'terms' || page === 'returns' || page === 'privacy' || page === 'guide') && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
            <button onClick={() => handleNavigate('home')} className="md:hidden flex items-center gap-1 text-sm font-semibold text-slate-600 mb-4"><ArrowLeft className="w-4 h-4" /> Terug</button>
            <LegalPage page={page as 'faq' | 'terms' | 'returns' | 'privacy' | 'guide'} onNavigate={handleNavigate} />
          </div>
        )}
      </main>

      <Footer onNavigate={handleNavigate} />

      <ProductModal product={productModal} onClose={() => setProductModal(null)} />
      <CartDrawer onCheckout={() => { if (customerUser) setCheckoutOpen(true); else { setPendingAction('checkout'); setAuthOpen(true); } }} />
      {checkoutOpen && <Checkout onClose={() => setCheckoutOpen(false)} onComplete={handleCheckoutComplete} />}

      {welcomeOpen && !customerUser && <CustomerAuthModal welcome onClose={() => setWelcomeOpen(false)} onSuccess={() => { setWelcomeOpen(false); }} />}
      {authOpen && <CustomerAuthModal onClose={() => { setAuthOpen(false); setPendingAction(null); }} onSuccess={() => { const action = pendingAction; setAuthOpen(false); setPendingAction(null); if (action === 'checkout') setCheckoutOpen(true); if (action === 'account') setPage('account'); }} />}

      {cart.length > 0 && page === 'home' && (
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-slate-200 shadow-lg print:hidden">
          <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-sm">
              <span className="font-bold text-slate-900">{cart.reduce((s, ci) => s + ci.quantity, 0)} items</span>
              <span className="text-slate-400 hidden sm:inline">in je ChiNed Bundel</span>
              <span className="hidden md:flex items-center gap-2 text-[10px] text-emerald-600 font-medium">
                <ShieldCheck className="w-3 h-3" /> Veilig betalen (iDEAL / Klarna) · 14 dagen zichttermijn
              </span>
            </div>
            <button onClick={() => setCartOpen(true)} className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-semibold">
              Bekijk Bundel →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}
