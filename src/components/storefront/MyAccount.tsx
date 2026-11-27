import { useStore } from '@/lib/store';
import { formatEur } from '@/lib/pricing';
import { Package, TrendingUp, Shield, Wallet, CheckCircle2, Clock, AlertCircle, Train, Plane } from 'lucide-react';
import { useState } from 'react';

interface Props {
  onNavigate: (page: string) => void;
}

export default function MyAccount({ onNavigate }: Props) {
  const { orders, returnFundEntries, settings } = useStore();
  const [searchEmail, setSearchEmail] = useState('');
  const [activeEmail, setActiveEmail] = useState('');

  const userOrders = activeEmail
    ? orders.filter(o => o.customerEmail === activeEmail)
    : orders;

  const userInflow = returnFundEntries.filter(e => e.type === 'inflow' && userOrders.some(o => o.id === e.orderId));
  const userDepreciation = returnFundEntries.filter(e => e.type === 'depreciation' && userOrders.some(o => o.id === e.orderId));
  const totalInflow = userInflow.reduce((s, e) => s + e.amount, 0);
  const totalDepreciation = userDepreciation.reduce((s, e) => s + e.amount, 0);
  const personalDeposit = totalInflow;
  const hasReturns = userOrders.some(o => o.hasReturned);
  const expectedPayout = hasReturns ? personalDeposit * 0.5 : personalDeposit * 1.1;

  const totalPoolInflow = returnFundEntries.filter(e => e.type === 'inflow').reduce((s, e) => s + e.amount, 0);
  const totalPoolDepreciation = returnFundEntries.filter(e => e.type === 'depreciation').reduce((s, e) => s + e.amount, 0);
  const netPoolBalance = totalPoolInflow - totalPoolDepreciation;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Mijn Account</h1>
        <p className="text-sm text-slate-500 mb-6">Bekijk je bestellingen, volg je pakketten en beheer je ChiNed Retour-Spaarpot.</p>

        <div className="mb-6 flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            value={searchEmail}
            onChange={e => setSearchEmail(e.target.value)}
            placeholder="Zoek je bestellingen op e-mailadres..."
            className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none text-sm"
          />
          <button onClick={() => setActiveEmail(searchEmail)} className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-semibold">
            Zoeken
          </button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <KpiCard icon={<Wallet className="w-5 h-5" />} title="Jouw Retour-Spaarpot" value={formatEur(personalDeposit)} color="text-blue-600 bg-blue-50" />
          <KpiCard icon={<Shield className="w-5 h-5" />} title="Schadevrij status" value={hasReturns ? 'Retour ingediend' : '100% Voorrang'} color={hasReturns ? 'text-amber-600 bg-amber-50' : 'text-emerald-600 bg-emerald-50'} />
          <KpiCard icon={<TrendingUp className="w-5 h-5" />} title="Verwachte uitkering" value={formatEur(expectedPayout)} color="text-orange-600 bg-orange-50" />
          <KpiCard icon={<Package className="w-5 h-5" />} title="Spaarpot totaal" value={formatEur(netPoolBalance)} color="text-purple-600 bg-purple-50" />
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6">
          <h2 className="text-sm font-bold text-slate-900 mb-3">ChiNed Retour-Spaarpot Dashboard</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <StatItem label="Totale spaarpot (collectief)" value={formatEur(totalPoolInflow)} />
            <StatItem label="Afschrijvingen (retouren)" value={formatEur(totalPoolDepreciation)} />
            <StatItem label="Netto spaarpot balans" value={formatEur(netPoolBalance)} />
            <StatItem label="Claim ratio" value={`${totalPoolInflow > 0 ? ((totalPoolDepreciation / totalPoolInflow) * 100).toFixed(1) : 0}%`} />
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
            <p className="text-xs text-emerald-700">
              <strong>ChiNed Retour-Spaarpot:</strong> {hasReturns
                ? 'Je hebt dit jaar een retour ingediend. Je ontvangt wettelijk 100% van je aankoopbedrag terug binnen 14 dagen.'
                : 'Je hebt 0 retouren in de afgelopen 12 maanden! Je ontvangt de opgebouwde spaarpot + 10% bonus als ChiNed shoptegoed, of 100% als contante uitbetaling.'}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-sm font-bold text-slate-900 mb-4">Mijn Bestellingen ({userOrders.length})</h2>
          {userOrders.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">Nog geen bestellingen gevonden.</p>
          ) : (
            <div className="space-y-4">
              {userOrders.map(order => (
                <div key={order.id} className="border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{order.orderNumber}</p>
                      <p className="text-xs text-slate-500">{new Date(order.createdAt).toLocaleDateString('nl-NL')} · {order.items.length} items</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-semibold px-2 py-1 rounded-full flex items-center gap-1 ${order.transportMode === 'train' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                        {order.transportMode === 'train' ? <><Train className="w-3 h-3" /> Treinvracht</> : <><Plane className="w-3 h-3" /> Luchtvracht</>}
                      </span>
                      <span className="text-sm font-bold text-slate-900">{formatEur(order.totalEur)}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 mb-3 overflow-x-auto">
                    {order.items.slice(0, 6).map(item => (
                      <img key={item.id} src={item.product.imageUrl} alt="" className="w-12 h-12 rounded-lg object-cover bg-slate-50 flex-shrink-0" />
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <OrderStatusBadge status={order.status} />
                    </div>
                    <button
                      onClick={() => onNavigate('track')}
                      className="text-xs font-semibold text-orange-600 hover:text-orange-700"
                    >
                      Track & Trace →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function KpiCard({ icon, title, value, color }: { icon: React.ReactNode; title: string; value: string; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-2 ${color}`}>{icon}</div>
      <p className="text-xs text-slate-500 mb-0.5">{title}</p>
      <p className="text-lg font-bold text-slate-900">{value}</p>
    </div>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-50 rounded-lg p-3">
      <p className="text-[10px] text-slate-500 mb-0.5">{label}</p>
      <p className="text-sm font-bold text-slate-900">{value}</p>
    </div>
  );
}

function OrderStatusBadge({ status }: { status: string }) {
  const isDone = status === 'Bezorgd';
  const isInProgress = !isDone && status !== 'Nieuw';
  const bgClass = isDone ? 'bg-emerald-100 text-emerald-700' : isInProgress ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600';
  const icon = isDone ? <CheckCircle2 className="w-3 h-3" /> : isInProgress ? <Clock className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />;
  return (
    <span className={`text-[10px] font-medium px-2 py-1 rounded-full flex items-center gap-1 ${bgClass}`}>
      {icon}
      {status}
    </span>
  );
}
