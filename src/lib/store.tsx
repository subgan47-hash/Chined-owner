import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import type { Product, Order, ReturnFundEntry, Settings, ApiKeyConfig, LegalDocs, CartItem, TransportMode, CustomerUser, PriceProof, ProcurementRequest } from './types';
import { DEFAULT_SETTINGS, DEFAULT_API_KEYS, DEFAULT_LEGAL, DEFAULT_PRICE_PROOFS } from './settings';
import { SEED_PRODUCTS, SEED_ORDERS, SEED_RETURN_FUND_ENTRIES } from './seed';
import { calculateOrderPricing, generateOrderNumber, generateBarcode } from './pricing';
import { upsertSettings, upsertProofs, insertOrder, fetchRemoteSettings, fetchRemoteProofs, fetchRemoteProducts, upsertProduct, deleteRemoteProduct, deleteAllRemoteProducts } from './supabaseClient';
import type { Product as ProductType } from './types';

const LS_KEY = 'chined-state-v1';

interface StoreState {
  products: Product[];
  orders: Order[];
  returnFundEntries: ReturnFundEntry[];
  settings: Settings;
  apiKeys: ApiKeyConfig;
  legal: LegalDocs;
  cart: CartItem[];
  cartOpen: boolean;
  transportMode: TransportMode;
  isAdmin: boolean;
  customerUser: CustomerUser | null;
  priceProofs: PriceProof[];
  procurementRequests: ProcurementRequest[];
}

interface StoreContextValue extends StoreState {
  addToCart: (product: Product, size: string, color: string, quantity?: number) => void;
  removeFromCart: (itemId: string) => void;
  updateCartQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  setCartOpen: (open: boolean) => void;
  setTransportMode: (mode: TransportMode) => void;
  checkout: (customer: { name: string; email: string; phone: string; address: string; postalCode: string; city: string; deliveryType: 'home' | 'locker'; pickupPoint?: string; paymentMethod: string }) => Order;
  loginAdmin: (password: string) => boolean;
  logoutAdmin: () => void;
  updateSettings: (s: Partial<Settings>) => void;
  updateApiKeys: (a: Partial<ApiKeyConfig>) => void;
  updateLegal: (l: Partial<LegalDocs>) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  addProduct: (p: Product) => void;
  updateProduct: (p: Product) => void;
  deleteProduct: (id: string) => void;
  deleteAllProducts: () => void;
  logReturnDepreciation: (orderId: string, amount: number, description: string, isClothing: boolean) => void;
  addQcPhotos: (orderId: string, photos: { url: string; caption: string }[]) => void;
  customerUser: CustomerUser | null;
  registerCustomer: (customer: Omit<CustomerUser, 'id' | 'createdAt'>) => boolean;
  loginCustomer: (email: string, password: string) => boolean;
  logoutCustomer: () => void;
  updatePriceProofs: (proofs: PriceProof[]) => void;
  addProcurementRequest: (req: ProcurementRequest) => void;
  updateProcurementRequest: (req: ProcurementRequest) => void;
  moveProcurementToStock: (reqId: string, product: Product) => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

function loadState(): StoreState {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...parsed,
        settings: { ...DEFAULT_SETTINGS, ...parsed.settings, launchCities: { ...DEFAULT_SETTINGS.launchCities, ...parsed.settings?.launchCities } },
        apiKeys: { ...DEFAULT_API_KEYS, ...parsed.apiKeys },
        legal: {
          ...DEFAULT_LEGAL,
          ...parsed.legal,
          trustBar: parsed.legal?.trustBar?.includes('Bespaar € 4,05') || parsed.legal?.trustBar?.includes('Bezorgd door PostNL') ? DEFAULT_LEGAL.trustBar : parsed.legal?.trustBar || DEFAULT_LEGAL.trustBar,
          heroBanner: parsed.legal?.heroBanner?.includes('slim gebundeld via Rotterdam') ? DEFAULT_LEGAL.heroBanner : parsed.legal?.heroBanner || DEFAULT_LEGAL.heroBanner,
          handbookAdmin: parsed.legal?.handbookAdmin || DEFAULT_LEGAL.handbookAdmin,
          handbookCustomer: parsed.legal?.handbookCustomer || DEFAULT_LEGAL.handbookCustomer,
          guide: parsed.legal?.guide || DEFAULT_LEGAL.guide,
        },
        customerUser: JSON.parse(localStorage.getItem('chined-customer-user-v1') || 'null'),
        transportMode: parsed.settings?.airFreightEnabled === false ? 'train' : 'air',
        priceProofs: DEFAULT_PRICE_PROOFS.map((defaultProof: PriceProof) => {
          const saved = (parsed.priceProofs as PriceProof[] | undefined)?.find((proof: PriceProof) => proof.id === defaultProof.id);
          const oldPhoto = !saved?.imageUrl || saved.imageUrl.includes('images.pexels.com') || !saved.sourceImageUrl || saved.sourceImageUrl.includes('images.pexels.com');
          return oldPhoto ? defaultProof : { ...defaultProof, ...saved, title: defaultProof.title };
        }),
        procurementRequests: parsed.procurementRequests || [],
      };
    }
  } catch {}
  return {
    products: SEED_PRODUCTS,
    orders: SEED_ORDERS,
    returnFundEntries: SEED_RETURN_FUND_ENTRIES,
    settings: DEFAULT_SETTINGS,
    apiKeys: DEFAULT_API_KEYS,
    legal: DEFAULT_LEGAL,
    cart: [],
    cartOpen: false,
    transportMode: 'air',
    isAdmin: false,
    customerUser: JSON.parse(localStorage.getItem('chined-customer-user-v1') || 'null'),
    priceProofs: DEFAULT_PRICE_PROOFS,
    procurementRequests: [],
  };
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StoreState>(loadState);

  useEffect(() => {
    const toSave = { ...state, isAdmin: false, customerUser: null };
    if (state.customerUser) localStorage.setItem('chined-customer-user-v1', JSON.stringify(state.customerUser));
    localStorage.setItem(LS_KEY, JSON.stringify(toSave));
  }, [state]);

  useEffect(() => {
    const admin = sessionStorage.getItem('chined-admin') === 'true';
    if (admin !== state.isAdmin) setState(s => ({ ...s, isAdmin: admin }));
  }, []);

  useEffect(() => {
    upsertSettings(state.settings as unknown as Record<string, unknown>, state.legal as unknown as Record<string, unknown>);
    upsertProofs(state.priceProofs as unknown as Record<string, unknown>[]);
    (window as any).__chinedSettings = state.settings;
  }, [state.settings, state.legal, state.priceProofs]);

  // Load products from Supabase on mount, merging with localStorage
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const remote = await fetchRemoteProducts();
      if (cancelled || !remote || remote.length === 0) return;
      const remoteProducts = remote as unknown as ProductType[];
      setState(s => {
        const localIds = new Set(s.products.map(p => p.id));
        const newFromRemote = remoteProducts.filter(p => !localIds.has(p.id));
        if (newFromRemote.length === 0) return s;
        return { ...s, products: [...s.products, ...newFromRemote] };
      });
      // Migrate any localStorage-only products to Supabase
      setState(s => {
        const remoteIds = new Set(remoteProducts.map(p => p.id));
        s.products.filter(p => !remoteIds.has(p.id)).forEach(p => {
          upsertProduct(p as unknown as Record<string, unknown>);
        });
        return s;
      });
    })();
    return () => { cancelled = true; };
  }, []);

  const addToCart = useCallback((product: Product, size: string, color: string, quantity: number = 1) => {
    if (!product.inStock) return;
    setState(s => {
      const existing = s.cart.find(ci => ci.product.id === product.id && ci.size === size && ci.color === color);
      if (existing) {
        return { ...s, cart: s.cart.map(ci => ci.id === existing.id ? { ...ci, quantity: ci.quantity + quantity } : ci), cartOpen: true };
      }
      return { ...s, cart: [...s.cart, { id: `ci-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, product, size, color, quantity }], cartOpen: true };
    });
  }, []);

  const removeFromCart = useCallback((itemId: string) => {
    setState(s => ({ ...s, cart: s.cart.filter(ci => ci.id !== itemId) }));
  }, []);

  const updateCartQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity <= 0) { removeFromCart(itemId); return; }
    setState(s => ({ ...s, cart: s.cart.map(ci => ci.id === itemId ? { ...ci, quantity } : ci) }));
  }, [removeFromCart]);

  const clearCart = useCallback(() => setState(s => ({ ...s, cart: [] })), []);

  const setCartOpen = useCallback((open: boolean) => setState(s => ({ ...s, cartOpen: open })), []);

  const setTransportMode = useCallback((mode: TransportMode) => setState(s => ({ ...s, transportMode: mode === 'air' && !s.settings.airFreightEnabled ? 'train' : mode })), []);

  const checkout = useCallback((customer: { name: string; email: string; phone: string; address: string; postalCode: string; city: string; deliveryType: 'home' | 'locker'; pickupPoint?: string; paymentMethod: string }): Order => {
    const pricing = calculateOrderPricing(state.cart, state.transportMode, state.settings);
    const order: Order = {
      id: `order-${Date.now()}`,
      orderNumber: generateOrderNumber(),
      customerName: customer.name,
      customerEmail: customer.email,
      customerPhone: customer.phone,
      address: customer.address,
      postalCode: customer.postalCode,
      city: customer.city,
      deliveryType: customer.deliveryType,
      pickupPoint: customer.pickupPoint,
      paymentMethod: customer.paymentMethod,
      customerUserId: state.customerUser?.id,
      items: [...state.cart],
      transportMode: state.transportMode,
      status: 'Nieuw',
      milestones: [
        { status: 'Nieuw', date: new Date().toISOString().split('T')[0], done: true, note: 'Bestelling ontvangen door ChiNed.' },
      ],
      ...pricing,
      createdAt: new Date().toISOString(),
      internalBarcode: generateBarcode(),
      qcPhotos: [],
      hasReturned: false,
    };

    insertOrder(order as unknown as Record<string, unknown>);

    setState(s => {
      const inflowEntry: ReturnFundEntry = {
        id: `rf-${Date.now()}`,
        orderId: order.id,
        type: 'inflow',
        amount: pricing.communityFundDeposit,
        description: `Inleg ${order.orderNumber}`,
        date: new Date().toISOString(),
        isClothing: false,
      };
      return {
        ...s,
        orders: [order, ...s.orders],
        returnFundEntries: [inflowEntry, ...s.returnFundEntries],
        cart: [],
        cartOpen: false,
      };
    });
    return order;
  }, [state.cart, state.transportMode, state.settings]);

  const loginAdmin = useCallback((password: string) => {
    if (password === 'Akketakke12!') {
      sessionStorage.setItem('chined-admin', 'true');
      setState(s => ({ ...s, isAdmin: true }));
      return true;
    }
    return false;
  }, []);

  const logoutAdmin = useCallback(() => {
    sessionStorage.removeItem('chined-admin');
    setState(s => ({ ...s, isAdmin: false }));
  }, []);

  const updateSettings = useCallback((s: Partial<Settings>) => setState(prev => ({ ...prev, settings: { ...prev.settings, ...s } })), []);
  const updateApiKeys = useCallback((a: Partial<ApiKeyConfig>) => setState(prev => ({ ...prev, apiKeys: { ...prev.apiKeys, ...a } })), []);
  const updateLegal = useCallback((l: Partial<LegalDocs>) => setState(prev => ({ ...prev, legal: { ...prev.legal, ...l } })), []);
  const registerCustomer = useCallback((customer: Omit<CustomerUser, 'id' | 'createdAt'>) => {
    const user: CustomerUser = { ...customer, id: `customer-${Date.now()}`, createdAt: new Date().toISOString() };
    localStorage.setItem('chined-customer-user-v1', JSON.stringify(user));
    setState(prev => ({ ...prev, customerUser: user }));
    return true;
  }, []);
  const loginCustomer = useCallback((email: string, password: string) => {
    const stored = JSON.parse(localStorage.getItem('chined-customer-user-v1') || 'null') as CustomerUser | null;
    if (!stored || stored.email.toLowerCase() !== email.toLowerCase() || stored.password !== password) return false;
    setState(prev => ({ ...prev, customerUser: stored }));
    return true;
  }, []);
  const logoutCustomer = useCallback(() => {
    localStorage.removeItem('chined-customer-user-v1');
    setState(prev => ({ ...prev, customerUser: null }));
  }, []);
  const updatePriceProofs = useCallback((proofs: PriceProof[]) => setState(prev => ({ ...prev, priceProofs: proofs })), []);
  const addProcurementRequest = useCallback((req: ProcurementRequest) => setState(prev => ({ ...prev, procurementRequests: [req, ...prev.procurementRequests] })), []);
  const updateProcurementRequest = useCallback((req: ProcurementRequest) => setState(prev => ({ ...prev, procurementRequests: prev.procurementRequests.map(r => r.id === req.id ? req : r) })), []);
  const moveProcurementToStock = useCallback((reqId: string, product: Product) => {
    const stockedProduct = { ...product, inStock: true };
    setState(s => ({
      ...s,
      products: [...s.products, stockedProduct],
      procurementRequests: s.procurementRequests.map(r => r.id === reqId ? { ...r, status: 'Op Voorraad in Rotterdam' } : r),
    }));
    upsertProduct(stockedProduct as unknown as Record<string, unknown>);
  }, []);

  const updateOrderStatus = useCallback((orderId: string, status: Order['status']) => {
    setState(s => ({
      ...s,
      orders: s.orders.map(o => {
        if (o.id !== orderId) return o;
        const steps = ['Nieuw', 'Besteld bij Bron/1688', 'QC Foto\'s Goedgekeurd', 'In Bulkdoos naar Rotterdam', 'Aangekomen in Rotterdam', 'PostNL Label Gemaakt', 'Onderweg naar Klant', 'Bezorgd'] as const;
        const idx = steps.indexOf(status);
        return {
          ...o,
          status,
          milestones: steps.map((step, i) => ({
            status: step,
            date: new Date(Date.now() - (steps.length - i) * 86400000).toISOString().split('T')[0],
            done: i <= idx,
            note: i <= idx ? step === status ? 'Zojuist bijgewerkt.' : step : undefined,
          })),
        };
      }),
    }));
  }, []);

  const addProduct = useCallback((p: Product) => {
    setState(s => ({ ...s, products: [...s.products, p] }));
    upsertProduct(p as unknown as Record<string, unknown>);
  }, []);
  const updateProduct = useCallback((p: Product) => {
    setState(s => ({ ...s, products: s.products.map(prod => prod.id === p.id ? p : prod) }));
    upsertProduct(p as unknown as Record<string, unknown>);
  }, []);
  const deleteProduct = useCallback((id: string) => {
    setState(s => ({ ...s, products: s.products.filter(p => p.id !== id) }));
    deleteRemoteProduct(id);
  }, []);
  const deleteAllProducts = useCallback(() => {
    setState(s => ({ ...s, products: [] }));
    deleteAllRemoteProducts();
  }, []);

  const logReturnDepreciation = useCallback((orderId: string, amount: number, description: string, isClothing: boolean) => {
    setState(s => ({
      ...s,
      returnFundEntries: [{
        id: `rf-${Date.now()}`,
        orderId, type: 'depreciation', amount, description, date: new Date().toISOString(), isClothing,
      }, ...s.returnFundEntries],
      orders: s.orders.map(o => o.id === orderId ? { ...o, hasReturned: true } : o),
    }));
  }, []);

  const addQcPhotos = useCallback((orderId: string, photos: { url: string; caption: string }[]) => {
    setState(s => ({
      ...s,
      orders: s.orders.map(o => o.id === orderId ? {
        ...o,
        qcPhotos: [...o.qcPhotos, ...photos.map((p, i) => ({ id: `qc-${orderId}-${Date.now()}-${i}`, url: p.url, caption: p.caption }))],
      } : o),
    }));
  }, []);

  return (
    <StoreContext.Provider value={{
      ...state, addToCart, removeFromCart, updateCartQuantity, clearCart, setCartOpen, setTransportMode,
      checkout, loginAdmin, logoutAdmin, updateSettings, updateApiKeys, updateLegal,
      updateOrderStatus, addProduct, updateProduct, deleteProduct, deleteAllProducts, logReturnDepreciation, addQcPhotos,
      registerCustomer, loginCustomer, logoutCustomer, updatePriceProofs,
      addProcurementRequest, updateProcurementRequest, moveProcurementToStock,
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
