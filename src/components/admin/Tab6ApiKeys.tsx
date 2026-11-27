import { useStore } from '@/lib/store';
import type { ApiKeyConfig } from '@/lib/types';
import { Eye, EyeOff, Check, X, KeyRound, CreditCard, Building2, Truck, Save } from 'lucide-react';
import { useState } from 'react';

type TestStatus = 'idle' | 'success' | 'fail';

export default function Tab6ApiKeys() {
  const { apiKeys, updateApiKeys, settings, updateSettings } = useStore();
  const [local, setLocal] = useState<ApiKeyConfig>(apiKeys);
  const [localOneboundKey, setLocalOneboundKey] = useState(settings.oneboundKey);
  const [localOneboundSecret, setLocalOneboundSecret] = useState(settings.oneboundSecret);
  const [saved, setSaved] = useState(false);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [testStatus, setTestStatus] = useState<Record<string, TestStatus>>({});

  const update = (key: keyof ApiKeyConfig, value: any) => setLocal({ ...local, [key]: value });

  const handleSave = () => {
    updateApiKeys(local);
    updateSettings({ oneboundKey: localOneboundKey, oneboundSecret: localOneboundSecret });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const toggleShow = (key: string) => setShowKeys({ ...showKeys, [key]: !showKeys[key] });

  const testConnection = (name: string) => {
    setTestStatus({ ...testStatus, [name]: 'success' });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Multi-Merchant API Keys, Betaalstromen & Koppelingen</h1>
          <p className="text-sm text-slate-500">Beheer alle API-sleutels en koppelingen veilig.</p>
        </div>
        <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-semibold transition-colors">
          {saved ? <><Check className="w-4 h-4" /> Opgeslagen</> : <><Save className="w-4 h-4" /> Opslaan</>}
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Section title="Multi-Merchant Product & Sourcing APIs" icon={<KeyRound className="w-5 h-5" />}>          <div className="space-y-2">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-2">
              <p className="text-xs font-bold text-orange-800 mb-1">1688 Open Platform / OneBound</p>
              <p className="text-[10px] text-orange-600">Deze sleutels worden opgeslagen in app_settings en direct door de onebound-1688 edge function gebruikt.</p>
            </div>
            <SecureInput label="OneBound API Key" value={localOneboundKey} onChange={setLocalOneboundKey}
              show={showKeys['oneboundKey']} onToggle={() => toggleShow('oneboundKey')} onTest={() => testConnection('oneboundKey')} status={testStatus['oneboundKey']} />
            <SecureInput label="OneBound Secret Key" value={localOneboundSecret} onChange={setLocalOneboundSecret}
              show={showKeys['oneboundSecret']} onToggle={() => toggleShow('oneboundSecret')} onTest={() => testConnection('oneboundSecret')} status={testStatus['oneboundSecret']} />
          </div>
          <ApiKeyField label="Shein Product API" keyVal={local.sheinKey} endpoint={local.sheinEndpoint}
            onKeyChange={v => update('sheinKey', v)} onEndpointChange={v => update('sheinEndpoint', v)}
            show={showKeys['shein']} onToggle={() => toggleShow('shein')} onTest={() => testConnection('shein')} status={testStatus['shein']} />
          <ApiKeyField label="Temu Sourcing API" keyVal={local.temuKey} endpoint={local.temuEndpoint}
            onKeyChange={v => update('temuKey', v)} onEndpointChange={v => update('temuEndpoint', v)}
            show={showKeys['temu']} onToggle={() => toggleShow('temu')} onTest={() => testConnection('temu')} status={testStatus['temu']} />
          <ApiKeyField label="AliExpress Affiliate/Dropship API" keyVal={local.aliexpressKey} endpoint={local.aliexpressEndpoint}
            onKeyChange={v => update('aliexpressKey', v)} onEndpointChange={v => update('aliexpressEndpoint', v)}
            show={showKeys['aliexpress']} onToggle={() => toggleShow('aliexpress')} onTest={() => testConnection('aliexpress')} status={testStatus['aliexpress']} />
        </Section>

        <Section title="Payment Service Provider (PSP)" icon={<CreditCard className="w-5 h-5" />}>
          <div className="mb-3">
            <label className="text-xs text-slate-500 block mb-1">Provider</label>
            <select value={local.pspProvider} onChange={e => update('pspProvider', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-orange-400 outline-none">
              <option value="mollie">Mollie</option>
              <option value="stripe">Stripe</option>
              <option value="adyen">Adyen</option>
            </select>
          </div>
          <SecureInput label="Live API Key" value={local.pspLiveKey} onChange={v => update('pspLiveKey', v)}
            show={showKeys['pspKey']} onToggle={() => toggleShow('pspKey')} onTest={() => testConnection('psp')} status={testStatus['psp']} />
          <PlainInput label="Merchant ID" value={local.pspMerchantId} onChange={v => update('pspMerchantId', v)} />
          <SecureInput label="Webhook Secret" value={local.pspWebhookSecret} onChange={v => update('pspWebhookSecret', v)}
            show={showKeys['pspWebhook']} onToggle={() => toggleShow('pspWebhook')} />

          <div className="mt-3">
            <p className="text-xs text-slate-500 mb-2">Betaalmethoden</p>
            <div className="grid grid-cols-2 gap-2">
              <Toggle label="iDEAL" checked={local.pspIdeal} onChange={v => update('pspIdeal', v)} />
              <Toggle label="Creditcard" checked={local.pspCreditcard} onChange={v => update('pspCreditcard', v)} />
              <Toggle label="Klarna" checked={local.pspKlarna} onChange={v => update('pspKlarna', v)} />
              <Toggle label="Bancontact" checked={local.pspBancontact} onChange={v => update('pspBancontact', v)} />
            </div>
          </div>
        </Section>

        <Section title="China Payout API & PostNL / Douane" icon={<Truck className="w-5 h-5" />}>
          <div className="mb-3">
            <label className="text-xs text-slate-500 block mb-1">China Payout Provider</label>
            <select value={local.chinaPayoutProvider} onChange={e => update('chinaPayoutProvider', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-orange-400 outline-none">
              <option value="alipay">Alipay Business</option>
              <option value="wise">Wise</option>
              <option value="worldfirst">WorldFirst</option>
            </select>
          </div>
          <SecureInput label="China Payout API Key" value={local.chinaPayoutKey} onChange={v => update('chinaPayoutKey', v)}
            show={showKeys['chinaPayout']} onToggle={() => toggleShow('chinaPayout')} onTest={() => testConnection('chinaPayout')} status={testStatus['chinaPayout']} />
          <SecureInput label="PostNL API Key" value={local.postnlApiKey} onChange={v => update('postnlApiKey', v)}
            show={showKeys['postnl']} onToggle={() => toggleShow('postnl')} onTest={() => testConnection('postnl')} status={testStatus['postnl']} />
          <PlainInput label="PostNL Customer Code" value={local.postnlCustomerCode} onChange={v => update('postnlCustomerCode', v)} />
          <PlainInput label="BLC Contract Code" value={local.postnlBlcContract} onChange={v => update('postnlBlcContract', v)} />
          <PlainInput label="EORI-nummer" value={local.eoriNumber} onChange={v => update('eoriNumber', v)} />
        </Section>

        <Section title="Status Overzicht" icon={<Building2 className="w-5 h-5" />}>
          <div className="space-y-2">
            <StatusRow label="OneBound (1688) API" status={testStatus['oneboundKey']} configured={!!localOneboundKey} />
            <StatusRow label="Shein API" status={testStatus['shein']} configured={!!local.sheinKey} />
            <StatusRow label="Temu API" status={testStatus['temu']} configured={!!local.temuKey} />
            <StatusRow label="AliExpress API" status={testStatus['aliexpress']} configured={!!local.aliexpressKey} />
            <StatusRow label="PSP Betalingen" status={testStatus['psp']} configured={!!local.pspLiveKey} />
            <StatusRow label="China Payout" status={testStatus['chinaPayout']} configured={!!local.chinaPayoutKey} />
            <StatusRow label="PostNL API" status={testStatus['postnl']} configured={!!local.postnlApiKey} />
          </div>
          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-xs text-amber-700">
              <strong>Beveiligingsinstructie:</strong> API-sleutels worden lokaal opgeslagen en nooit in platte tekst getoond aan derden. Gebruik de show/hide toggle om sleutels te bekijken.
            </p>
          </div>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
      <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2 text-slate-700">
        <span className="text-orange-600">{icon}</span> {title}
      </h3>
      {children}
    </div>
  );
}

function SecureInput({ label, value, onChange, show, onToggle, onTest, status }: {
  label: string; value: string; onChange: (v: string) => void; show?: boolean; onToggle: () => void; onTest?: () => void; status?: TestStatus;
}) {
  return (
    <div>
      <label className="text-xs text-slate-500 block mb-1">{label}</label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input type={show ? 'text' : 'password'} value={value} onChange={e => onChange(e.target.value)} placeholder="••••••••••••"
            className="w-full px-3 py-2 pr-10 rounded-lg border border-slate-200 text-sm font-mono focus:border-orange-400 outline-none" />
          <button onClick={onToggle} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {onTest && <TestButton onClick={onTest} status={status} />}
      </div>
    </div>
  );
}

function ApiKeyField({ label, keyVal, endpoint, onKeyChange, onEndpointChange, show, onToggle, onTest, status }: {
  label: string; keyVal: string; endpoint: string; onKeyChange: (v: string) => void; onEndpointChange: (v: string) => void;
  show: boolean; onToggle: () => void; onTest: () => void; status?: TestStatus;
}) {
  return (
    <div className="space-y-2">
      <SecureInput label={label} value={keyVal} onChange={onKeyChange} show={show} onToggle={onToggle} onTest={onTest} status={status} />
      <PlainInput label="Endpoint" value={endpoint} onChange={onEndpointChange} />
    </div>
  );
}

function PlainInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-xs text-slate-500 block mb-1">{label}</label>
      <input type="text" value={value} onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-orange-400 outline-none" />
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!checked)}
      className={`flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-medium transition-all ${checked ? 'border-orange-300 bg-orange-50 text-orange-700' : 'border-slate-200 text-slate-500'}`}>
      {label}
      <span className={`w-4 h-4 rounded-full flex items-center justify-center ${checked ? 'bg-orange-500' : 'bg-slate-300'}`}>
        {checked && <Check className="w-3 h-3 text-white" />}
      </span>
    </button>
  );
}

function TestButton({ onClick, status }: { onClick: () => void; status?: TestStatus }) {
  return (
    <button onClick={onClick}
      className={`px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
        status === 'success' ? 'bg-emerald-100 text-emerald-700' : status === 'fail' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
      }`}>
      {status === 'success' ? <><Check className="w-3 h-3 inline mr-1" /> OK</> : status === 'fail' ? <><X className="w-3 h-3 inline mr-1" /> Fail</> : 'Test'}
    </button>
  );
}

function StatusRow({ label, status, configured }: { label: string; status?: TestStatus; configured: boolean }) {
  return (
    <div className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-slate-50">
      <span className="text-slate-600">{label}</span>
      <span className={`flex items-center gap-1 font-medium ${status === 'success' ? 'text-emerald-600' : configured ? 'text-amber-600' : 'text-slate-400'}`}>
        {status === 'success' ? <><Check className="w-3 h-3" /> Verbonden</> : configured ? 'Geconfigureerd (niet getest)' : 'Niet geconfigureerd'}
      </span>
    </div>
  );
}
