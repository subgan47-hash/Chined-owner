import { useStore } from '@/lib/store';
import { Package, LayoutDashboard, Settings, Users, ShoppingCart, ScanLine, KeyRound, FileText, TrendingUp, LogOut, Menu, BookOpen } from 'lucide-react';
import { useState } from 'react';

export type AdminTab = 'dashboard' | 'settings' | 'returnfund' | 'procurement' | 'hubscanner' | 'apikeys' | 'legal' | 'simulator' | 'handbook';

interface Props {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  onExit: () => void;
  children: React.ReactNode;
}

const TABS: { key: AdminTab; label: string; icon: React.ReactNode }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { key: 'settings', label: 'Tarieven & Risico', icon: <Settings className="w-5 h-5" /> },
  { key: 'returnfund', label: 'Retourfonds Beheer', icon: <Users className="w-5 h-5" /> },
  { key: 'procurement', label: 'Inkoop & QC', icon: <ShoppingCart className="w-5 h-5" /> },
  { key: 'hubscanner', label: 'Hub Scanner & Labels', icon: <ScanLine className="w-5 h-5" /> },
  { key: 'apikeys', label: 'API & Koppelingen', icon: <KeyRound className="w-5 h-5" /> },
  { key: 'legal', label: 'Juridisch & Content', icon: <FileText className="w-5 h-5" /> },
  { key: 'simulator', label: 'Pitch Simulator', icon: <TrendingUp className="w-5 h-5" /> },
  { key: 'handbook', label: 'Handleiding & Handboek', icon: <BookOpen className="w-5 h-5" /> },
];

export default function AdminLayout({ activeTab, onTabChange, onExit, children }: Props) {
  const { logoutAdmin } = useStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logoutAdmin();
    onExit();
  };

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={() => setSidebarOpen(false)} />}

      <aside className={`fixed md:sticky top-0 left-0 z-40 h-screen w-64 bg-slate-900 flex flex-col transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-4 border-b border-slate-800 flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-sm font-bold text-white">ChiNed Beheer</span>
            <p className="text-[10px] text-slate-400">Hub & Pitch Portal</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => { onTabChange(tab.key); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.key ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-slate-800">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <LogOut className="w-5 h-5" /> <span>Uitloggen</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <div className="md:hidden bg-white border-b border-slate-200 p-3 flex items-center justify-between sticky top-0 z-20">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-slate-100">
            <Menu className="w-5 h-5 text-slate-700" />
          </button>
          <span className="text-sm font-bold text-slate-900">{TABS.find(t => t.key === activeTab)?.label}</span>
          <button onClick={handleLogout} className="p-2 rounded-lg text-slate-600 hover:bg-slate-100" aria-label="Uitloggen"><LogOut className="w-5 h-5" /></button>
        </div>
        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
