import { useStore } from '@/lib/store';
import { formatEur, formatRmb, getProductCostEur } from '@/lib/pricing';
import { exportProcurementCsv, getQcInstructionEn } from '@/lib/csv';
import { detectWeightAndCategory, calculateChinedAllInEur, calculateChinedPrice, type FreightMode } from '@/lib/bundleBuilder';
import { search1688, get1688Item, extract1688ItemId, mapOneBoundItemToProduct, type OneBoundItem } from '@/lib/onebound';
import type { Order, OrderStatus, Product, Merchant, Category, ProcurementRequest } from '@/lib/types';
import { Download, Copy, Check, Train, Plane, Plus, Edit2, Trash2, X, ExternalLink, Filter, ShieldCheck, Camera, Send, Inbox, Search, Loader2, Upload } from 'lucide-react';
import { useState } from 'react';

function tierFor(valueUsd: number): { label: string; class: string } {
  if (valueUsd < 50) return { label: `$0-$50: $5 flat`, class: 'bg-slate-100 text-slate-700' };
  if (valueUsd < 150) return { label: `$50-$149: 15%`, class: 'bg-amber-100 text-amber-700' };
  if (valueUsd < 2000) return { label: `$150-$1,999: 8%`, class: 'bg-emerald-100 text-emerald-700' };
  return { label: `$2,000+: 6%`, class: 'bg-blue-100 text-blue-700' };
}

const MERCHANT_BADGE: Record<Merchant, { label: string; class: string }> = {
  '1688': { label: '1688', class: 'bg-red-100 text-red-700' },
  'shein': { label: 'Shein', class: 'bg-pink-100 text-pink-700' },
  'temu': { label: 'Temu', class: 'bg-orange-100 text-orange-700' },
  'aliexpress': { label: 'AliExpress', class: 'bg-amber-100 text-amber-700' },
};

const STATUS_FLOW: OrderStatus[] = [
  'Nieuw', 'Besteld bij Bron/1688', 'QC Foto\'s Goedgekeurd', 'In Bulkdoos naar Rotterdam',
  'Aangekomen in Rotterdam', 'PostNL Label Gemaakt', 'Onderweg naar Klant', 'Bezorgd'
];

type TransportFilter = 'all' | 'train' | 'air';

export default function Tab4Procurement() {
  const { orders, settings, updateOrderStatus, products, addProduct, updateProduct, deleteProduct, deleteAllProducts, updateSettings, procurementRequests, updateProcurementRequest, addQcPhotos } = useStore();
  const [transportFilter, setTransportFilter] = useState<TransportFilter>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showCatalog, setShowCatalog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [qcDraft, setQcDraft] = useState('');
  const [qcSaved, setQcSaved] = useState(false);
  const [showProcurement, setShowProcurement] = useState(false);
  const [qcPhotoOrder, setQcPhotoOrder] = useState<Order | null>(null);
  const [qcPhotoUrl, setQcPhotoUrl] = useState('');
  const [qcPhotoCaption, setQcPhotoCaption] = useState('');

  // 1688 import state
  const [importQuery, setImportQuery] = useState('');
  const [importSearching, setImportSearching] = useState(false);
  const [importResults, setImportResults] = useState<Product[]>([]);
  const [importError, setImportError] = useState('');

  const filteredOrders = transportFilter === 'all' ? orders : orders.filter(o => o.transportMode === transportFilter);
  const pendingOrders = orders.filter(o => o.status === 'Nieuw');
  const batchValueUsd = pendingOrders.reduce((s, o) => s + o.items.reduce((ss, i) => ss + getProductCostEur(i.product.priceRmb, settings) / settings.rmbToEurRate * i.quantity, 0), 0);
  const tier = tierFor(batchValueUsd);

  const handleCopyQc = (order: Order) => {
    const text = getQcInstructionEn(order);
    navigator.clipboard.writeText(text);
    setCopiedId(order.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleImportSearch = async () => {
    if (!importQuery.trim()) return;
    setImportSearching(true);
    setImportError('');
    setImportResults([]);

    const itemId = extract1688ItemId(importQuery);
    if (itemId) {
      const result = await get1688Item(itemId);
      if (result.product) {
        setImportResults([result.product]);
      } else {
        setImportError(result.error || 'Kon dit 1688-product niet ophalen.');
      }
    } else {
      const result = await search1688(importQuery);
      if (result.products.length > 0) {
        setImportResults(result.products);
      } else {
        setImportError(result.error || 'Geen resultaten gevonden.');
      }
    }
    setImportSearching(false);
  };

  const handleSaveImported = (product: Product) => {
    addProduct(product);
    setImportResults(prev => prev.filter(p => p.id !== product.id));
  };

  const handleDeleteAllDemo = () => {
    if (confirm('Weet je zeker dat je alle demo-producten wilt verwijderen? Dit kan niet ongedaan worden gemaakt.')) {
      deleteAllProducts();
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Multi-Merchant Inkoopbeheer & CN Cargo Kwaliteitscontrole</h1>
          <p className="text-sm text-slate-500">Order queue met bron-merchant, RMB prijzen en anonieme interne barcodes voor CN Cargo.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowCatalog(!showCatalog)} className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-semibold">
            {showCatalog ? 'Terug naar Orders' : 'Product Catalog Beheer'}
          </button>
          <button onClick={() => setShowProcurement(!showProcurement)} className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold flex items-center gap-1.5">
            <Inbox className="w-4 h-4" /> Opzoekverzoeken {procurementRequests.length > 0 && <span className="bg-white text-blue-600 text-[10px] font-bold rounded-full px-1.5 py-0.5">{procurementRequests.length}</span>}
          </button>
        </div>
      </div>

      {showProcurement ? (
        <ProcurementRequestsPanel requests={procurementRequests} onUpdate={updateProcurementRequest} settings={settings} />
      ) : !showCatalog ? (
        <>
          <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-600" /> Standaard QC- &amp; Verpakkingsinstructie</h2>
              <button onClick={() => { updateSettings({ qcInstructionEn: qcDraft || settings.qcInstructionEn }); setQcSaved(true); setTimeout(() => setQcSaved(false), 2000); }} className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-semibold">{qcSaved ? 'Opgeslagen' : 'Opslaan'}</button>
            </div>
            <textarea value={qcDraft || settings.qcInstructionEn} onChange={e => setQcDraft(e.target.value)} rows={3} className="w-full text-xs text-slate-700 border border-slate-200 rounded-lg p-2.5 focus:border-orange-400 outline-none" />
            <p className="text-[10px] text-slate-400 mt-1">Deze instructie wordt automatisch bovenaan elke Treinvracht- en Luchtvracht-CSV paklijst geplaatst.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-4 rounded-xl bg-slate-50 border border-slate-200 px-4 py-3">
            <span className="text-xs font-semibold text-slate-600">Inkoop-fee tier:</span>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${tier.class}`}>{tier.label}</span>
            <span className="text-xs text-slate-400">· Batchwaarde: ${batchValueUsd.toFixed(2)} ({pendingOrders.length} wachtende orders)</span>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            <span className="text-xs text-slate-500 flex items-center gap-1 mr-1"><Filter className="w-3.5 h-3.5" /> Filter:</span>
            <FilterBtn active={transportFilter === 'all'} onClick={() => setTransportFilter('all')} label="Alle Orders" count={orders.length} />
            <FilterBtn active={transportFilter === 'train'} onClick={() => setTransportFilter('train')} label="Alleen Treinvracht" count={orders.filter(o => o.transportMode === 'train').length} color="blue" />
            <FilterBtn active={transportFilter === 'air'} onClick={() => setTransportFilter('air')} label="Alleen Luchtvracht" count={orders.filter(o => o.transportMode === 'air').length} color="orange" />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <button
              onClick={() => exportProcurementCsv(filteredOrders, settings, 'train')}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-colors shadow-md"
            >
              <Download className="w-5 h-5" /> Exporteer TREINVRACHT Paklijst (CSV)
            </button>
            <button
              onClick={() => exportProcurementCsv(filteredOrders, settings, 'air')}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-semibold text-sm transition-colors shadow-md"
            >
              <Download className="w-5 h-5" /> Exporteer LUCHTVRACHT Paklijst (CSV)
            </button>
          </div>

          <div className="space-y-3">
            {filteredOrders.map(order => (
              <div key={order.id} className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-slate-900">{order.orderNumber}</span>
                      <span className="text-xs text-slate-400 font-mono bg-slate-100 px-2 py-0.5 rounded">{order.internalBarcode}</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${order.transportMode === 'train' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                        {order.transportMode === 'train' ? <><Train className="w-3 h-3" /> Treinvracht</> : <><Plane className="w-3 h-3" /> Luchtvracht</>}
                      </span>
                      {order.items.some(item => ['koffer','trolley','suitcase','box','opberg','kussen','pillow','tas','rugzak','mand'].some(kw => `${item.product.title} ${item.product.titleNl}`.toLowerCase().includes(kw))) && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 flex items-center gap-1">NESTING: Stop overige bundel-items ín dit product!</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{new Date(order.createdAt).toLocaleDateString('nl-NL')} · {order.items.length} items · {order.items.reduce((s, i) => s + i.quantity, 0)} stuks</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleCopyQc(order)} className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors">
                      {copiedId === order.id ? <><Check className="w-3.5 h-3.5 text-emerald-600" /> Gekopieerd</> : <><Copy className="w-3.5 h-3.5" /> QC-instructie (EN)</>}
                    </button>
                    <button onClick={() => setQcPhotoOrder(order)} className="flex items-center gap-1 px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-lg text-xs font-medium transition-colors"><Camera className="w-3.5 h-3.5" /> QC-foto's</button>
                    <select
                      value={order.status}
                      onChange={e => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 focus:border-orange-400 outline-none"
                    >
                      {STATUS_FLOW.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 text-left">
                        <th className="py-1.5 pr-3 font-medium">Merchant</th>
                        <th className="py-1.5 pr-3 font-medium">Product</th>
                        <th className="py-1.5 pr-3 font-medium">Maat/Kleur</th>
                        <th className="py-1.5 pr-3 font-medium">Qty</th>
                        <th className="py-1.5 pr-3 font-medium text-right">RMB</th>
                        <th className="py-1.5 pr-3 font-medium">URL</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map(item => (
                        <tr key={item.id} className="border-b border-slate-50">
                          <td className="py-2 pr-3"><span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${MERCHANT_BADGE[item.product.merchant].class}`}>{MERCHANT_BADGE[item.product.merchant].label}</span></td>
                          <td className="py-2 pr-3 text-slate-700 max-w-[160px] truncate">{item.product.titleNl}</td>
                          <td className="py-2 pr-3 text-slate-500">{item.size} / {item.color}</td>
                          <td className="py-2 pr-3 text-slate-700 font-medium">{item.quantity}</td>
                          <td className="py-2 pr-3 text-right text-slate-700">{formatRmb(item.product.priceRmb)}</td>
                          <td className="py-2 pr-3"><a href={item.product.originalUrl} target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline flex items-center gap-0.5"><ExternalLink className="w-3 h-3" /></a></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {order.qcPhotos.length > 0 && (
                  <div className="mt-3 bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                    <p className="text-xs font-semibold text-emerald-700 mb-2 flex items-center gap-1.5"><Camera className="w-3.5 h-3.5" /> QC-foto's uit China ({order.qcPhotos.length})</p>
                    <div className="flex flex-wrap gap-2">{order.qcPhotos.map(photo => <img key={photo.id} src={photo.url} alt={photo.caption} title={photo.caption} className="w-16 h-16 rounded-lg object-cover bg-white border border-emerald-100" />)}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      ) : (
        <ProductCatalogManager
          products={products}
          onAdd={addProduct}
          onUpdate={updateProduct}
          onDelete={deleteProduct}
          onDeleteAll={handleDeleteAllDemo}
          editingProduct={editingProduct}
          setEditingProduct={setEditingProduct}
          importQuery={importQuery}
          setImportQuery={setImportQuery}
          importSearching={importSearching}
          importResults={importResults}
          importError={importError}
          onImportSearch={handleImportSearch}
          onSaveImported={handleSaveImported}
          settings={settings}
        />
      )}
      {qcPhotoOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4" onClick={() => setQcPhotoOrder(null)}>
          <div className="bg-white rounded-2xl max-w-lg w-full p-5" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4"><h3 className="text-sm font-bold text-slate-900">QC-foto's toevoegen aan {qcPhotoOrder.orderNumber}</h3><button onClick={() => setQcPhotoOrder(null)} className="p-1 rounded hover:bg-slate-100"><X className="w-4 h-4 text-slate-500" /></button></div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Foto URL<input type="text" value={qcPhotoUrl} onChange={e => setQcPhotoUrl(e.target.value)} placeholder="https://..." className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></label>
            <label className="block text-xs font-semibold text-slate-600 mb-1 mt-3">Onderschrift<input type="text" value={qcPhotoCaption} onChange={e => setQcPhotoCaption(e.target.value)} placeholder="bijv. QC foto 1 - voorkant + label" className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></label>
            <button onClick={() => { if (qcPhotoUrl) { addQcPhotos(qcPhotoOrder.id, [{ url: qcPhotoUrl, caption: qcPhotoCaption || 'QC foto' }]); setQcPhotoUrl(''); setQcPhotoCaption(''); } }} className="w-full mt-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold">Voeg QC-foto toe</button>
            {qcPhotoOrder.qcPhotos.length > 0 && <p className="text-[10px] text-slate-400 mt-2 text-center">Deze order heeft al {qcPhotoOrder.qcPhotos.length} QC-foto's.</p>}
          </div>
        </div>
      )}
    </div>
  );
}

function ProcurementRequestsPanel({ requests, onUpdate, settings }: { requests: ProcurementRequest[]; onUpdate: (req: ProcurementRequest) => void; settings: import('@/lib/types').Settings }) {
  const [priceInputs, setPriceInputs] = useState<Record<string, string>>({});
  const [weightInputs, setWeightInputs] = useState<Record<string, string>>({});

  return (
    <div>
      <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2"><Inbox className="w-4 h-4 text-blue-600" /> Klant Opzoekverzoeken (1688prijs &amp; gewicht invullen)</h2>
      {requests.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center"><p className="text-sm text-slate-400">Nog geen opzoekverzoeken. Klanten die alleen Temu-screenshots uploaden komen hier terecht.</p></div>
      ) : (
        <div className="space-y-4">
          {requests.map(req => {
            const detected = detectWeightAndCategory(req.items.map(i => i.url).join(' '));
            const adminPrice = parseFloat(priceInputs[req.id] || '0') || 0;
            const adminWeight = parseFloat(weightInputs[req.id] || '0') || detected.weightKg;
            const breakdown = calculateChinedAllInEur(adminPrice, adminWeight);
            return (
              <div key={req.id} className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div><p className="text-sm font-bold text-slate-900">Verzoek {req.id.slice(-6)}</p><p className="text-[10px] text-slate-400">{new Date(req.createdAt).toLocaleString('nl-NL')} · {req.customerName || 'Gast'} · {req.items.length} items</p></div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${req.status === 'Nieuw' ? 'bg-blue-100 text-blue-700' : req.status === 'Offerte Verzonden' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{req.status}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                  {req.items.map((item, i) => (
                    <div key={item.id} className="bg-slate-50 rounded-lg p-2">
                      {item.photoDataUrl ? <img src={item.photoDataUrl} alt="" className="w-full h-16 object-cover rounded mb-1" /> : <div className="w-full h-16 bg-slate-200 rounded mb-1 flex items-center justify-center text-[10px] text-slate-400">#{i + 1}</div>}
                      <p className="text-[9px] text-slate-500 truncate">{item.url.slice(0, 30)}</p>
                      {item.temuPriceEur && <p className="text-[9px] text-orange-600">Temu: € {item.temuPriceEur.toFixed(2)}</p>}
                    </div>
                  ))}
                </div>
                <div className="grid sm:grid-cols-3 gap-3 items-end bg-blue-50 rounded-lg p-3">
                  <div><label className="text-[10px] font-semibold text-slate-600 block mb-1">1688 fabrieksprijs (€)</label><input type="number" value={priceInputs[req.id] || ''} onChange={e => setPriceInputs({ ...priceInputs, [req.id]: e.target.value })} placeholder="bijv. 12,50" className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm" /></div>
                  <div><label className="text-[10px] font-semibold text-slate-600 block mb-1">Gewicht (kg) — auto: {detected.weightKg}</label><input type="number" step={0.1} value={weightInputs[req.id] || ''} onChange={e => setWeightInputs({ ...weightInputs, [req.id]: e.target.value })} placeholder={String(detected.weightKg)} className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm" /></div>
                  <div>
                    {adminPrice > 0 && <p className="text-xs text-slate-600 mb-1">All-in: <b className="text-orange-600">{formatEur(breakdown.allIn)}</b> per item</p>}
                    <button onClick={() => onUpdate({ ...req, admin1688PriceEur: adminPrice, adminWeightKg: adminWeight, status: 'Offerte Verzonden' })} disabled={adminPrice <= 0} className={`w-full flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-semibold ${adminPrice > 0 ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-slate-100 text-slate-400'}`}><Send className="w-3.5 h-3.5" /> Verzend checkout-link naar klant</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FilterBtn({ active, onClick, label, count, color }: { active: boolean; onClick: () => void; label: string; count: number; color?: 'blue' | 'orange' }) {
  const colorMap = color === 'blue' ? 'bg-blue-600' : color === 'orange' ? 'bg-orange-600' : 'bg-slate-800';
  return (
    <button onClick={onClick} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${active ? `${colorMap} text-white shadow-md` : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'}`}>
      {label} <span className="opacity-60">({count})</span>
    </button>
  );
}

interface CatalogProps {
  products: Product[];
  onAdd: (p: Product) => void;
  onUpdate: (p: Product) => void;
  onDelete: (id: string) => void;
  onDeleteAll: () => void;
  editingProduct: Product | null;
  setEditingProduct: (p: Product | null) => void;
  importQuery: string;
  setImportQuery: (q: string) => void;
  importSearching: boolean;
  importResults: Product[];
  importError: string;
  onImportSearch: () => void;
  onSaveImported: (p: Product) => void;
  settings: import('@/lib/types').Settings;
}

function ProductCatalogManager({ products, onAdd, onUpdate, onDelete, onDeleteAll, editingProduct, setEditingProduct, importQuery, setImportQuery, importSearching, importResults, importError, onImportSearch, onSaveImported, settings }: CatalogProps) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<Product>>({
    merchant: '1688', category: 'Wonen', sizes: [], colors: [], priceRmb: 0, weightKg: 0, lengthCm: 0, widthCm: 0, heightCm: 0,
  });
  const [photoName, setPhotoName] = useState('');

  const startEdit = (p: Product) => {
    setEditingProduct(p);
    setForm(p);
    setShowForm(true);
  };

  const startAdd = () => {
    setEditingProduct(null);
    setForm({ merchant: '1688', category: 'Wonen', sizes: ['Standaard'], colors: ['Standaard'], priceRmb: 0, weightKg: 0, lengthCm: 0, widthCm: 0, heightCm: 0, titleNl: '', title: '', imageUrl: '', originalUrl: '', qcInstructionEn: '' });
    setShowForm(true);
  };

  const handleSave = () => {
    const product: Product = {
      id: editingProduct?.id || `p-${Date.now()}`,
      merchant: form.merchant as Merchant,
      title: form.title || '',
      titleNl: form.titleNl || '',
      category: form.category as Category,
      priceRmb: form.priceRmb || 0,
      weightKg: form.weightKg || 0,
      lengthCm: form.lengthCm || 0,
      widthCm: form.widthCm || 0,
      heightCm: form.heightCm || 0,
      imageUrl: form.imageUrl || 'https://images.pexels.com/photos/4226791/pexels-photo-4226791.jpeg?auto=compress&cs=tinysrgb&w=600',
      sizes: form.sizes || ['Standaard'],
      colors: form.colors || ['Standaard'],
      originalUrl: form.originalUrl || '',
      qcInstructionEn: form.qcInstructionEn || 'Check product quality and quantity.',
    };
    if (editingProduct) onUpdate(product);
    else onAdd(product);
    setShowForm(false);
    setEditingProduct(null);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result);
      // Compress: if > 500KB, resize via canvas
      if (dataUrl.length > 500000) {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 600;
          let { width, height } = img;
          if (width > maxDim || height > maxDim) {
            const ratio = Math.min(maxDim / width, maxDim / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressed = canvas.toDataURL('image/jpeg', 0.7);
            setForm({ ...form, imageUrl: compressed });
          } else {
            setForm({ ...form, imageUrl: dataUrl });
          }
        };
        img.src = dataUrl;
      } else {
        setForm({ ...form, imageUrl: dataUrl });
      }
    };
    reader.readAsDataURL(file);
    setPhotoName(file.name);
  };

  return (
    <div>
      {/* 1688 Import Section */}
      <div className="bg-white rounded-xl border-2 border-orange-200 p-4 mb-4">
        <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2"><Search className="w-4 h-4 text-orange-600" /> 1-Klik Importeer van 1688 URL / Zoekwoord</h2>
        <div className="flex gap-2 mb-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={importQuery}
              onChange={e => setImportQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && onImportSearch()}
              placeholder="Zoekwoord of plak 1688 product URL (detail.1688.com/offer/...)"
              className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none"
            />
          </div>
          <button
            onClick={onImportSearch}
            disabled={!importQuery.trim() || importSearching}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold ${importQuery.trim() && !importSearching ? 'bg-orange-600 hover:bg-orange-700 text-white' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
          >
            {importSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            {importSearching ? 'Zoeken...' : 'Importeer'}
          </button>
        </div>
        {importError && <p className="text-xs text-red-500 mb-2">{importError}</p>}
        {importResults.length > 0 && (
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            <p className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5"><Check className="w-3.5 h-3.5" /> {importResults.length} producten gevonden — klik om op te slaan in catalogus</p>
            {importResults.map(product => {
              const price = calculateChinedPrice(product.priceRmb, settings.rmbToEurRate, product.weightKg, product.lengthCm, product.widthCm, product.heightCm, 'air', {
                airRatePerKg: settings.airRatePerKg, railRatePerKg: settings.railRatePerKg, b2bDutyPct: settings.b2bDutyPct, dutchVatPct: settings.dutchVatPct,
              });
              return (
                <div key={product.id} className="flex gap-3 bg-slate-50 rounded-lg p-3 border border-slate-200">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt="" className="w-16 h-16 rounded-lg object-cover bg-white flex-shrink-0" />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-slate-200 flex items-center justify-center flex-shrink-0 text-[10px] text-slate-400">Geen foto</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-900 line-clamp-2">{product.titleNl}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">¥{product.priceRmb.toFixed(2)} · {product.weightKg.toFixed(2)} kg · {product.category}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-bold text-orange-600">{formatEur(price.allIn)}</span>
                      <span className="text-[9px] text-slate-400 line-through">{formatEur(price.etalageprijs)}</span>
                    </div>
                    <button
                      onClick={() => onSaveImported(product)}
                      className="mt-1.5 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-semibold"
                    >
                      <Check className="w-3 h-3" /> Opslaan in catalogus
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-slate-900">Product Catalog ({products.length} producten)</h2>
        <div className="flex gap-2">
          <button onClick={onDeleteAll} className="flex items-center gap-1.5 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-semibold border border-red-200">
            <Trash2 className="w-4 h-4" /> Verwijder alle demo-producten
          </button>
          <button onClick={startAdd} className="flex items-center gap-1.5 px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-semibold">
            <Plus className="w-4 h-4" /> Product toevoegen
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900">{editingProduct ? 'Product bewerken' : 'Nieuw product'}</h3>
            <button onClick={() => setShowForm(false)} className="p-1 hover:bg-slate-100 rounded"><X className="w-4 h-4 text-slate-500" /></button>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <FormField label="Titel (NL)"><input type="text" value={form.titleNl || ''} onChange={e => setForm({ ...form, titleNl: e.target.value })} className="form-input" /></FormField>
            <FormField label="Titel (origineel)"><input type="text" value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value })} className="form-input" /></FormField>
            <FormField label="Bron Merchant"><select value={form.merchant} onChange={e => setForm({ ...form, merchant: e.target.value as Merchant })} className="form-input"><option value="1688">1688</option><option value="shein">Shein</option><option value="temu">Temu</option><option value="aliexpress">AliExpress</option></select></FormField>
            <FormField label="Categorie"><select value={form.category} onChange={e => setForm({ ...form, category: e.target.value as Category })} className="form-input"><option value="Wonen">Wonen</option><option value="Kleding">Kleding</option><option value="Tech-accessoires">Tech-accessoires</option><option value="Keuken">Keuken</option><option value="Opbergen">Opbergen</option><option value="Sport">Sport</option><option value="Auto & Fiets">Auto & Fiets</option></select></FormField>
            <FormField label="RMB Prijs"><input type="number" value={form.priceRmb || 0} onChange={e => setForm({ ...form, priceRmb: parseFloat(e.target.value) || 0 })} className="form-input" /></FormField>
            <FormField label="Gewicht (kg)"><input type="number" step={0.1} value={form.weightKg || 0} onChange={e => setForm({ ...form, weightKg: parseFloat(e.target.value) || 0 })} className="form-input" /></FormField>
            <FormField label="L x B x H (cm)"><div className="flex gap-1"><input type="number" placeholder="L" value={form.lengthCm || 0} onChange={e => setForm({ ...form, lengthCm: parseFloat(e.target.value) || 0 })} className="form-input" /><input type="number" placeholder="B" value={form.widthCm || 0} onChange={e => setForm({ ...form, widthCm: parseFloat(e.target.value) || 0 })} className="form-input" /><input type="number" placeholder="H" value={form.heightCm || 0} onChange={e => setForm({ ...form, heightCm: parseFloat(e.target.value) || 0 })} className="form-input" /></div></FormField>
            <FormField label="Image URL"><input type="text" value={form.imageUrl || ''} onChange={e => setForm({ ...form, imageUrl: e.target.value })} className="form-input" /></FormField>
            <FormField label="Upload Foto / Screenshot">
              <label className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-dashed border-orange-300 bg-orange-50 text-orange-700 text-sm font-semibold cursor-pointer hover:bg-orange-100">
                <Upload className="w-4 h-4" /> {photoName || 'Kies foto'}
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
              </label>
              {form.imageUrl && form.imageUrl.startsWith('data:') && <p className="text-[10px] text-emerald-600 mt-1 flex items-center gap-1"><Check className="w-3 h-3" /> Foto geüpload</p>}
            </FormField>
            <FormField label="Originele URL"><input type="text" value={form.originalUrl || ''} onChange={e => setForm({ ...form, originalUrl: e.target.value })} className="form-input" /></FormField>
            <FormField label="Maten (kommagescheiden)"><input type="text" value={(form.sizes || []).join(',')} onChange={e => setForm({ ...form, sizes: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} className="form-input" /></FormField>
            <FormField label="Kleuren (kommagescheiden)"><input type="text" value={(form.colors || []).join(',')} onChange={e => setForm({ ...form, colors: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} className="form-input" /></FormField>
            <FormField label="QC instructie (EN)" full><input type="text" value={form.qcInstructionEn || ''} onChange={e => setForm({ ...form, qcInstructionEn: e.target.value })} className="form-input" /></FormField>
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm">Annuleren</button>
            <button onClick={handleSave} className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-semibold">{editingProduct ? 'Opslaan' : 'Toevoegen'}</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {products.map(p => (
          <div key={p.id} className="bg-white rounded-xl border border-slate-200 p-3 flex gap-3">
            <img src={p.imageUrl} alt="" className="w-16 h-16 rounded-lg object-cover bg-slate-50 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${MERCHANT_BADGE[p.merchant].class}`}>{MERCHANT_BADGE[p.merchant].label}</span>
                <span className="text-[9px] text-slate-400">{p.category}</span>
              </div>
              <p className="text-xs font-medium text-slate-900 truncate">{p.titleNl}</p>
              <p className="text-xs text-slate-500">{formatRmb(p.priceRmb)} · {p.weightKg}kg</p>
              <div className="flex gap-1 mt-1">
                <button onClick={() => startEdit(p)} className="p-1 text-slate-400 hover:text-orange-600"><Edit2 className="w-3.5 h-3.5" /></button>
                <button onClick={() => { if (confirm('Product verwijderen?')) onDelete(p.id); }} className="p-1 text-slate-400 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FormField({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={full ? 'sm:col-span-2' : ''}>
      <label className="text-xs text-slate-500 block mb-1">{label}</label>
      {children}
    </div>
  );
}
