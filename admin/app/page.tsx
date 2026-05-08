'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Activity,
  BadgeIndianRupee,
  Bell,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Download,
  Eye,
  FileBarChart2,
  FileDown,
  Fingerprint,
  Gauge,
  KeyRound,
  LayoutDashboard,
  ListChecks,
  LockKeyhole,
  Logs,
  RefreshCcw,
  Search,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Smartphone,
  TableProperties,
  Users,
  Webhook,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn, formatINR } from '@/lib/utils';

type Screen =
  | 'overview'
  | 'users'
  | 'transactions'
  | 'recharges'
  | 'commissions'
  | 'kyc'
  | 'logs'
  | 'webhooks'
  | 'reports'
  | 'settings';

type Status = 'success' | 'pending' | 'failed' | 'refunded' | 'blocked' | 'verified';

const nav: Array<{ id: Screen; label: string; icon: typeof LayoutDashboard }> = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'transactions', label: 'Transactions', icon: TableProperties },
  { id: 'recharges', label: 'Recharges Live', icon: Activity },
  { id: 'commissions', label: 'Commissions', icon: BadgeIndianRupee },
  { id: 'kyc', label: 'KYC Queue', icon: ClipboardCheck },
  { id: 'logs', label: 'API Logs', icon: Logs },
  { id: 'webhooks', label: 'Webhooks', icon: Webhook },
  { id: 'reports', label: 'Reports', icon: FileBarChart2 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const revenueData = Array.from({ length: 12 }, (_, i) => ({
  day: `W${i + 1}`,
  revenue: [86000, 98000, 92000, 128000, 151000, 143000, 176000, 193000, 188000, 214000, 232000, 251000][i],
  transactions: [420, 510, 488, 642, 711, 690, 812, 910, 885, 1002, 1094, 1180][i],
}));

const stackedData = [
  { name: 'Mon', recharge: 320, bills: 210, rewards: 90 },
  { name: 'Tue', recharge: 380, bills: 240, rewards: 112 },
  { name: 'Wed', recharge: 420, bills: 270, rewards: 138 },
  { name: 'Thu', recharge: 470, bills: 295, rewards: 151 },
  { name: 'Fri', recharge: 530, bills: 320, rewards: 178 },
  { name: 'Sat', recharge: 610, bills: 360, rewards: 210 },
  { name: 'Sun', recharge: 580, bills: 345, rewards: 202 },
];

const operatorData = [
  { name: 'Jio', value: 1380 },
  { name: 'Airtel', value: 1120 },
  { name: 'Vi', value: 860 },
  { name: 'FASTag', value: 640 },
  { name: 'Electricity', value: 580 },
];

const transactions = [
  {
    id: 'TXN2405078451',
    user: 'Keshav Swami',
    mobile: '9568654684',
    service: 'Prepaid',
    operator: 'Jio',
    amount: 199,
    status: 'success' as Status,
    time: '07 May, 8:44 PM',
  },
  {
    id: 'TXN2405077520',
    user: 'Anshika Verma',
    mobile: '9193658636',
    service: 'FASTag',
    operator: 'ICICI FASTag',
    amount: 500,
    status: 'failed' as Status,
    time: '07 May, 5:02 PM',
  },
  {
    id: 'TXN2405076221',
    user: 'Rahul Sharma',
    mobile: '9876543210',
    service: 'Electricity',
    operator: 'UPPCL',
    amount: 1312,
    status: 'pending' as Status,
    time: '07 May, 3:18 PM',
  },
  {
    id: 'TXN2405075574',
    user: 'Neha Singh',
    mobile: '7894561230',
    service: 'Rewards',
    operator: 'Amazon Voucher',
    amount: 1000,
    status: 'success' as Status,
    time: '07 May, 1:55 PM',
  },
  {
    id: 'TXN2405069913',
    user: 'Mohit Arora',
    mobile: '9812345678',
    service: 'DTH',
    operator: 'Tata Play',
    amount: 399,
    status: 'refunded' as Status,
    time: '06 May, 9:40 PM',
  },
];

type Transaction = (typeof transactions)[number];

const users = [
  {
    id: 'USR1001',
    name: 'Keshav Swami',
    mobile: '9568654684',
    email: 'keshav@wigope.com',
    kyc: 'verified',
    wallet: 1200,
    blocked: false,
    joined: '02 May 2026',
  },
  {
    id: 'USR1002',
    name: 'Anshika Verma',
    mobile: '9193658636',
    email: 'anshika@example.com',
    kyc: 'pending',
    wallet: 80,
    blocked: false,
    joined: '06 May 2026',
  },
  {
    id: 'USR1003',
    name: 'Rahul Sharma',
    mobile: '9876543210',
    email: 'rahul@example.com',
    kyc: 'none',
    wallet: 0,
    blocked: true,
    joined: '07 May 2026',
  },
  {
    id: 'USR1004',
    name: 'Neha Singh',
    mobile: '7894561230',
    email: 'neha@example.com',
    kyc: 'verified',
    wallet: 2450,
    blocked: false,
    joined: '04 May 2026',
  },
];

const rechargeStreamSeed = [
  {
    id: 'RCG_9074',
    mobile: '9568654684',
    operator: 'Jio',
    amount: 199,
    status: 'success' as Status,
    latency: '2.1s',
    request: { opid: '11', number: '956****684', amount: 199, provider: 'KwikAPI UAT' },
    response: { status: 'SUCCESS', providerTxnId: 'KWK8472201', message: 'Recharge accepted' },
  },
  {
    id: 'RCG_9073',
    mobile: '9193658636',
    operator: 'Vi',
    amount: 299,
    status: 'pending' as Status,
    latency: '8.4s',
    request: { opid: '14', number: '919****636', amount: 299, provider: 'KwikAPI UAT' },
    response: { status: 'PENDING', providerTxnId: 'KWK8472199', message: 'Awaiting operator status' },
  },
  {
    id: 'RCG_9072',
    mobile: '9876543210',
    operator: 'Airtel',
    amount: 239,
    status: 'failed' as Status,
    latency: '1.8s',
    request: { opid: '7', number: '987****210', amount: 239, provider: 'KwikAPI UAT' },
    response: { status: 'FAILURE', providerTxnId: null, message: 'Operator rejected' },
  },
];

const kycItems = [
  {
    id: 'KYC-2201',
    name: 'Anshika Verma',
    pan: 'BXCPA****F',
    aadhaar: 'XXXX XXXX 7812',
    confidence: 94,
    submitted: '07 May, 6:22 PM',
  },
  {
    id: 'KYC-2202',
    name: 'Mohit Arora',
    pan: 'DRSPA****K',
    aadhaar: 'XXXX XXXX 1190',
    confidence: 87,
    submitted: '07 May, 4:09 PM',
  },
];

const apiLogs = [
  { id: 'LOG-901', method: 'POST', path: '/api/v1/auth/verify-otp', status: 200, latency: '84ms', at: '21:38:12' },
  { id: 'LOG-902', method: 'POST', path: '/api/v1/recharge/mobile', status: 202, latency: '1290ms', at: '21:37:48' },
  { id: 'LOG-903', method: 'GET', path: '/api/v1/wallet/balance', status: 200, latency: '41ms', at: '21:37:18' },
  { id: 'LOG-904', method: 'POST', path: '/api/v1/hubble/sso', status: 200, latency: '66ms', at: '21:36:54' },
];

const webhookEvents = [
  { id: 'WH-501', source: 'Hubble', event: 'transaction.completed', status: 'success' as Status, at: '21:20', payload: { brand: 'Amazon', amount: 1000, orderStatus: 'COMPLETED' } },
  { id: 'WH-502', source: 'KwikAPI', event: 'recharge.pending', status: 'pending' as Status, at: '20:58', payload: { orderId: 'RCG_9073', status: 'PENDING' } },
  { id: 'WH-503', source: 'Razorpay', event: 'payment.failed', status: 'failed' as Status, at: '20:40', payload: { paymentId: 'pay_mock_882', reason: 'UAT failure' } },
];

const reports = [
  { title: 'Daily revenue', rows: 128, amount: '₹2.51L', icon: FileBarChart2 },
  { title: 'GST report', rows: 42, amount: '₹18,420', icon: FileDown },
  { title: 'Operator-wise volume', rows: 18, amount: '4,202 txns', icon: Gauge },
  { title: 'User growth', rows: 612, amount: '+18.4%', icon: Users },
];

export default function AdminPage() {
  const [authStep, setAuthStep] = useState<'login' | 'otp' | 'done'>('login');
  const [screen, setScreen] = useState<Screen>('overview');
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<(typeof users)[number] | null>(null);
  const [selectedRecharge, setSelectedRecharge] = useState<(typeof rechargeStreamSeed)[number] | null>(null);
  const [selectedWebhook, setSelectedWebhook] = useState<(typeof webhookEvents)[number] | null>(null);
  const [kycQueue, setKycQueue] = useState(kycItems);
  const [rechargeStream, setRechargeStream] = useState(rechargeStreamSeed);
  const [commissionRows, setCommissionRows] = useState([
    { service: 'Prepaid', operator: 'Jio', mode: 'percent', value: 3.8, min: 0, max: 200 },
    { service: 'DTH', operator: 'Tata Play', mode: 'percent', value: 4.1, min: 1, max: 250 },
    { service: 'FASTag', operator: 'ICICI FASTag', mode: 'percent', value: 2, min: 0, max: 150 },
    { service: 'Rewards', operator: 'Amazon Voucher', mode: 'fixed', value: 12, min: 0, max: 300 },
  ]);
  const [auditLog, setAuditLog] = useState([
    '21:31 · System synced KwikAPI UAT operator catalogue',
    '21:08 · Admin enabled Hubble staging rewards',
    '20:44 · Wallet topup bonus changed to upto ₹200',
  ]);

  useEffect(() => {
    if (screen !== 'recharges') return;
    const timer = window.setInterval(() => {
      setRechargeStream((items) => {
        const next = {
          ...items[0],
          id: `RCG_${Math.floor(9100 + Math.random() * 99)}`,
          latency: `${(1 + Math.random() * 4).toFixed(1)}s`,
          status: Math.random() > 0.72 ? ('pending' as Status) : ('success' as Status),
        };
        return [next, ...items].slice(0, 8);
      });
    }, 10000);
    return () => window.clearInterval(timer);
  }, [screen]);

  const filteredTransactions = useMemo(() => {
    const q = search.toLowerCase();
    return transactions.filter((txn) =>
      [txn.id, txn.mobile, txn.user, txn.operator, txn.service, txn.status].some((v) =>
        String(v).toLowerCase().includes(q),
      ),
    );
  }, [search]);

  const exportRows = (name: string, rows: Record<string, unknown>[]) => {
    const headers = Object.keys(rows[0] ?? {});
    const csv = [headers.join(','), ...rows.map((row) => headers.map((h) => JSON.stringify(row[h] ?? '')).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${name}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (authStep !== 'done') {
    return <AdminAuth step={authStep} setStep={setAuthStep} />;
  }

  return (
    <main className="min-h-screen bg-[#f7f8fb] text-ink-primary">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 shrink-0 border-r border-border-soft bg-white xl:block">
          <div className="sticky top-0 flex h-screen flex-col">
            <div className="border-b border-border-soft px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-grad-orange text-lg font-black text-white shadow-hero">
                  W
                </div>
                <div>
                  <div className="font-display text-lg font-extrabold">Wigope Admin</div>
                  <div className="text-xs font-semibold uppercase tracking-[0.22em] text-ink-tertiary">merchant panel</div>
                </div>
              </div>
            </div>
            <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-5">
              {nav.map((item) => {
                const Icon = item.icon;
                const active = screen === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setScreen(item.id)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-card px-4 py-3 text-left text-sm font-bold transition',
                      active
                        ? 'bg-wigope-orange-50 text-wigope-orange-600 ring-1 ring-wigope-orange-600/20'
                        : 'text-ink-secondary hover:bg-surface-muted hover:text-ink-primary',
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
            <div className="border-t border-border-soft p-4">
              <div className="rounded-card bg-grad-navy p-4 text-white">
                <div className="text-sm font-bold">Live controls</div>
                <p className="mt-1 text-xs leading-5 text-white/70">UAT-first setup. Keys stay masked in the panel.</p>
              </div>
            </div>
          </div>
        </aside>

        <section className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 border-b border-border-soft bg-white/90 backdrop-blur">
            <div className="flex items-center justify-between gap-4 px-5 py-4 lg:px-8">
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.22em] text-wigope-orange-600">Phase 9</div>
                <h1 className="font-display text-2xl font-extrabold tracking-tight text-wigope-navy-900 lg:text-3xl">
                  {nav.find((item) => item.id === screen)?.label}
                </h1>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden items-center gap-2 rounded-full border border-border-soft bg-white px-3 py-2 text-sm font-semibold text-ink-secondary md:flex">
                  <ShieldCheck className="h-4 w-4 text-success" />
                  2FA active
                </div>
                <button className="rounded-full border border-border-soft bg-white p-3 text-ink-secondary shadow-card">
                  <Bell className="h-5 w-5" />
                </button>
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-wigope-navy-900 text-sm font-black text-white">
                  KS
                </div>
              </div>
            </div>
            <div className="scrollbar-hide flex gap-2 overflow-x-auto border-t border-border-soft px-5 py-3 xl:hidden">
              {nav.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setScreen(item.id)}
                  className={cn(
                    'shrink-0 rounded-full border px-4 py-2 text-sm font-bold',
                    screen === item.id
                      ? 'border-wigope-orange-600 bg-wigope-orange-50 text-wigope-orange-600'
                      : 'border-border-soft bg-white text-ink-secondary',
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </header>

          <div className="mx-auto max-w-7xl space-y-6 px-5 py-6 lg:px-8">
            {screen === 'overview' && <Overview exportRows={exportRows} />}
            {screen === 'users' && <UsersScreen search={search} setSearch={setSearch} setSelectedUser={setSelectedUser} />}
            {screen === 'transactions' && (
              <TransactionsScreen
                search={search}
                setSearch={setSearch}
                transactions={filteredTransactions}
                exportRows={exportRows}
              />
            )}
            {screen === 'recharges' && (
              <RechargesScreen items={rechargeStream} setSelectedRecharge={setSelectedRecharge} />
            )}
            {screen === 'commissions' && (
              <CommissionsScreen
                rows={commissionRows}
                setRows={setCommissionRows}
                auditLog={auditLog}
                setAuditLog={setAuditLog}
              />
            )}
            {screen === 'kyc' && <KycScreen items={kycQueue} setItems={setKycQueue} />}
            {screen === 'logs' && <LogsScreen />}
            {screen === 'webhooks' && <WebhooksScreen setSelectedWebhook={setSelectedWebhook} />}
            {screen === 'reports' && <ReportsScreen exportRows={exportRows} />}
            {screen === 'settings' && <SettingsScreen auditLog={auditLog} />}
          </div>
        </section>
      </div>

      {selectedUser && <UserDrawer user={selectedUser} onClose={() => setSelectedUser(null)} />}
      {selectedRecharge && (
        <PayloadDrawer
          title={`Recharge ${selectedRecharge.id}`}
          payload={{ request: selectedRecharge.request, response: selectedRecharge.response }}
          onClose={() => setSelectedRecharge(null)}
        />
      )}
      {selectedWebhook && (
        <PayloadDrawer
          title={`${selectedWebhook.source} · ${selectedWebhook.event}`}
          payload={selectedWebhook.payload}
          onClose={() => setSelectedWebhook(null)}
        />
      )}
    </main>
  );
}

function AdminAuth({
  step,
  setStep,
}: {
  step: 'login' | 'otp';
  setStep: (step: 'login' | 'otp' | 'done') => void;
}) {
  const [otp, setOtp] = useState('');
  return (
    <main className="bg-grid flex min-h-screen items-center justify-center bg-white px-5">
      <section className="w-full max-w-md rounded-[28px] border border-border-soft bg-white p-7 shadow-hero">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-grad-orange text-xl font-black text-white">
            W
          </div>
          <div>
            <div className="font-display text-xl font-extrabold">Wigope Admin</div>
            <div className="text-sm text-ink-secondary">Secure operator access</div>
          </div>
        </div>
        <div className="mt-8 rounded-card bg-grad-orange-soft p-5">
          <LockKeyhole className="h-7 w-7 text-wigope-orange-600" />
          <h1 className="mt-3 font-display text-3xl font-extrabold text-wigope-navy-900">
            {step === 'login' ? 'Admin sign in' : 'Verify 2FA'}
          </h1>
          <p className="mt-2 text-sm leading-6 text-ink-secondary">
            {step === 'login'
              ? 'Use admin credentials, then confirm the one-time code.'
              : 'Demo code is 123456 for local Phase 9 testing.'}
          </p>
        </div>
        {step === 'login' ? (
          <div className="mt-6 space-y-4">
            <Field label="Email" value="admin@wigope.com" readOnly />
            <Field label="Password" value="••••••••••" readOnly />
            <Button className="w-full" size="lg" onClick={() => setStep('otp')}>
              Continue to 2FA
            </Button>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            <Field label="2FA code" value={otp} onChange={(event) => setOtp(event.target.value)} placeholder="123456" />
            <Button className="w-full" size="lg" onClick={() => setStep('done')} disabled={otp.length < 6}>
              Open dashboard
            </Button>
          </div>
        )}
      </section>
    </main>
  );
}

function Overview({ exportRows }: { exportRows: (name: string, rows: Record<string, unknown>[]) => void }) {
  const kpis = [
    { label: 'Revenue', value: '₹2.51L', delta: '+18.4%', icon: BadgeIndianRupee },
    { label: 'Transactions', value: '4,202', delta: '+11.2%', icon: Activity },
    { label: 'Success Rate', value: '97.8%', delta: '+2.1%', icon: CheckCircle2 },
    { label: 'Last Settlement', value: '₹84,300', delta: 'Today 6 PM', icon: ShieldCheck },
  ];

  return (
    <>
      <section className="bg-grid rounded-[28px] border border-border-soft bg-white p-6 shadow-card">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-wigope-orange-600">Admin command center</p>
            <h2 className="mt-2 font-display text-4xl font-extrabold text-wigope-navy-900">
              Welcome back, Keshav 👋
            </h2>
            <p className="mt-2 max-w-2xl text-ink-secondary">
              Monitor revenue, recharges, KYC risk, wallet movements, provider logs, and settlement health from one panel.
            </p>
          </div>
          <Button onClick={() => exportRows('recent-transactions', transactions)}>
            <Download className="h-4 w-4" />
            Export today
          </Button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label} className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-ink-tertiary">{kpi.label}</p>
                  <div className="mt-2 font-display text-3xl font-extrabold text-wigope-navy-900">{kpi.value}</div>
                  <p className="mt-2 text-sm font-bold text-success">{kpi.delta}</p>
                </div>
                <div className="rounded-2xl bg-wigope-orange-50 p-3 text-wigope-orange-600">
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </Card>
          );
        })}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.3fr_0.9fr]">
        <ChartCard title="Revenue line chart" subtitle="Last 90 days · orange line">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={revenueData}>
              <CartesianGrid stroke="#E8EAF0" strokeDasharray="4 4" />
              <XAxis dataKey="day" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => `₹${Number(v) / 1000}k`} />
              <Tooltip formatter={(v) => formatINR(Number(v))} />
              <Line type="monotone" dataKey="revenue" stroke="#F97316" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Top operators" subtitle="Volume by operator">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={operatorData} layout="vertical">
              <CartesianGrid stroke="#E8EAF0" strokeDasharray="4 4" />
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} width={80} />
              <Tooltip />
              <Bar dataKey="value" fill="#F97316" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <ChartCard title="Transactions stacked area" subtitle="Recharge, bills, rewards">
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={stackedData}>
              <CartesianGrid stroke="#E8EAF0" strokeDasharray="4 4" />
              <XAxis dataKey="name" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <Tooltip />
              <Area type="monotone" dataKey="recharge" stackId="1" fill="#F97316" stroke="#F97316" />
              <Area type="monotone" dataKey="bills" stackId="1" fill="#3B82F6" stroke="#3B82F6" />
              <Area type="monotone" dataKey="rewards" stackId="1" fill="#10B981" stroke="#10B981" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
        <Card className="overflow-hidden">
          <SectionHeader title="Recent transactions" subtitle="Last 20, newest first" />
          <DataTable
            headers={['Txn ID', 'User', 'Service', 'Amount', 'Status']}
            rows={transactions.map((txn) => [
              txn.id,
              txn.user,
              txn.service,
              formatINR(txn.amount),
              <StatusPill key={txn.id} status={txn.status} />,
            ])}
          />
        </Card>
      </section>
    </>
  );
}

function UsersScreen({
  search,
  setSearch,
  setSelectedUser,
}: {
  search: string;
  setSearch: (value: string) => void;
  setSelectedUser: (user: (typeof users)[number]) => void;
}) {
  const q = search.toLowerCase();
  const filtered = users.filter((user) =>
    [user.name, user.mobile, user.email, user.kyc].some((v) => v.toLowerCase().includes(q)),
  );

  return (
    <Card>
      <SectionHeader
        title="Users"
        subtitle="Search, KYC filters, blocked status, and drawer actions"
        action={<SearchBox value={search} onChange={setSearch} placeholder="Search user or mobile" />}
      />
      <div className="flex flex-wrap gap-2 px-5 pb-4">
        {['All', 'KYC verified', 'KYC pending', 'Blocked', 'Joined today'].map((filter) => (
          <Chip key={filter}>{filter}</Chip>
        ))}
      </div>
      <DataTable
        headers={['User', 'Mobile', 'KYC', 'Wallet', 'Blocked', 'Joined']}
        rows={filtered.map((user) => [
          <button key={user.id} className="font-bold text-wigope-navy-900" onClick={() => setSelectedUser(user)}>
            {user.name}
          </button>,
          user.mobile,
          <StatusPill key={user.id} status={user.kyc === 'verified' ? 'verified' : 'pending'} label={user.kyc} />,
          formatINR(user.wallet),
          user.blocked ? <StatusPill key={user.id} status="blocked" label="Blocked" /> : 'No',
          user.joined,
        ])}
      />
    </Card>
  );
}

function TransactionsScreen({
  search,
  setSearch,
  transactions,
  exportRows,
}: {
  search: string;
  setSearch: (value: string) => void;
  transactions: Transaction[];
  exportRows: (name: string, rows: Record<string, unknown>[]) => void;
}) {
  return (
    <Card>
      <SectionHeader
        title="Transactions"
        subtitle="Server-side pagination shape with service, operator, status, date and mobile search"
        action={
          <div className="flex flex-wrap gap-2">
            <SearchBox value={search} onChange={setSearch} placeholder="Mobile / Txn ID" />
            <Button variant="secondary" onClick={() => exportRows('transactions', transactions)}>
              <Download className="h-4 w-4" />
              CSV
            </Button>
            <Button variant="secondary" onClick={() => exportRows('transactions-xlsx-compatible', transactions)}>
              <FileDown className="h-4 w-4" />
              XLSX
            </Button>
          </div>
        }
      />
      <div className="grid gap-3 px-5 pb-4 md:grid-cols-5">
        {['Service', 'Operator', 'Status', 'Amount range', 'Date range'].map((filter) => (
          <select key={filter} className="h-11 rounded-card border border-border-soft bg-white px-3 text-sm font-semibold text-ink-secondary">
            <option>{filter}</option>
          </select>
        ))}
      </div>
      <DataTable
        headers={['Txn ID', 'User', 'Mobile', 'Service', 'Operator', 'Amount', 'Status', 'Time']}
        rows={transactions.map((txn) => [
          txn.id,
          txn.user,
          txn.mobile,
          txn.service,
          txn.operator,
          formatINR(txn.amount),
          <StatusPill key={txn.id} status={txn.status} />,
          txn.time,
        ])}
      />
    </Card>
  );
}

function RechargesScreen({
  items,
  setSelectedRecharge,
}: {
  items: typeof rechargeStreamSeed;
  setSelectedRecharge: (item: (typeof rechargeStreamSeed)[number]) => void;
}) {
  return (
    <Card>
      <SectionHeader
        title="Recharges live"
        subtitle="Auto-refreshes every 10 seconds. Click a row to inspect provider request and response."
        action={<Chip className="bg-wigope-orange-50 text-wigope-orange-600"><RefreshCcw className="h-4 w-4" /> Live</Chip>}
      />
      <div className="divide-y divide-border-soft">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => setSelectedRecharge(item)}
            className="grid w-full gap-3 px-5 py-4 text-left transition hover:bg-surface-soft md:grid-cols-[1.1fr_1fr_0.7fr_0.7fr_0.5fr_auto]"
          >
            <div>
              <div className="font-bold">{item.id}</div>
              <div className="text-sm text-ink-tertiary">KwikAPI UAT</div>
            </div>
            <div>{item.operator} · {item.mobile}</div>
            <div>{formatINR(item.amount)}</div>
            <StatusPill status={item.status} />
            <div className="text-sm text-ink-secondary">{item.latency}</div>
            <Eye className="h-5 w-5 text-ink-tertiary" />
          </button>
        ))}
      </div>
    </Card>
  );
}

function CommissionsScreen({
  rows,
  setRows,
  auditLog,
  setAuditLog,
}: {
  rows: Array<{ service: string; operator: string; mode: string; value: number; min: number; max: number }>;
  setRows: (rows: Array<{ service: string; operator: string; mode: string; value: number; min: number; max: number }>) => void;
  auditLog: string[];
  setAuditLog: (rows: string[]) => void;
}) {
  const updateRow = (index: number, key: 'value' | 'min' | 'max', value: number) => {
    const next = rows.map((row, rowIndex) => (rowIndex === index ? { ...row, [key]: value } : row));
    setRows(next);
    setAuditLog([`Now · Commission ${rows[index].service}/${rows[index].operator} ${key} updated`, ...auditLog].slice(0, 8));
  };

  return (
    <section className="grid gap-5 xl:grid-cols-[1fr_360px]">
      <Card>
        <SectionHeader title="Commission matrix" subtitle="Service × operator · percentage / fixed / min / max" />
        <DataTable
          headers={['Service', 'Operator', 'Mode', 'Value', 'Min', 'Max']}
          rows={rows.map((row, index) => [
            row.service,
            row.operator,
            row.mode,
            <NumberCell key={`${row.operator}-value`} value={row.value} onChange={(v) => updateRow(index, 'value', v)} />,
            <NumberCell key={`${row.operator}-min`} value={row.min} onChange={(v) => updateRow(index, 'min', v)} />,
            <NumberCell key={`${row.operator}-max`} value={row.max} onChange={(v) => updateRow(index, 'max', v)} />,
          ])}
        />
      </Card>
      <Card>
        <SectionHeader title="Audit trail" subtitle="Optimistic edits are logged" />
        <div className="space-y-3 p-5 pt-0">
          {auditLog.map((row) => (
            <div key={row} className="rounded-card border border-border-soft bg-surface-soft p-3 text-sm font-semibold text-ink-secondary">
              {row}
            </div>
          ))}
        </div>
      </Card>
    </section>
  );
}

function KycScreen({
  items,
  setItems,
}: {
  items: typeof kycItems;
  setItems: (items: typeof kycItems) => void;
}) {
  return (
    <Card>
      <SectionHeader title="KYC Queue" subtitle="PAN preview, Aadhaar masked, OCR confidence and approval workflow" />
      <div className="grid gap-4 p-5 pt-0 lg:grid-cols-2">
        {items.map((item) => (
          <div key={item.id} className="rounded-[20px] border border-border-soft bg-white p-5 shadow-card">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.2em] text-wigope-orange-600">{item.id}</div>
                <h3 className="mt-1 font-display text-xl font-extrabold">{item.name}</h3>
                <p className="mt-1 text-sm text-ink-secondary">Submitted {item.submitted}</p>
              </div>
              <div className="rounded-2xl bg-success/10 px-3 py-2 text-sm font-extrabold text-success">
                {item.confidence}% OCR
              </div>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <PreviewCard label="PAN preview" value={item.pan} />
              <PreviewCard label="Aadhaar" value={item.aadhaar} />
            </div>
            <div className="mt-5 flex gap-3">
              <Button className="flex-1" onClick={() => setItems(items.filter((x) => x.id !== item.id))}>
                Approve
              </Button>
              <Button variant="secondary" className="flex-1" onClick={() => setItems(items.filter((x) => x.id !== item.id))}>
                Reject
              </Button>
            </div>
            <textarea className="mt-3 min-h-20 w-full rounded-card border border-border-soft p-3 text-sm" placeholder="Reason for rejection if needed" />
          </div>
        ))}
        {items.length === 0 && <EmptyState title="KYC queue clear" body="No pending submissions right now." />}
      </div>
    </Card>
  );
}

function LogsScreen() {
  return (
    <Card>
      <SectionHeader title="API Logs" subtitle="Last 7 days · filterable and searchable" action={<SearchBox value="" onChange={() => null} placeholder="Search path" />} />
      <DataTable
        headers={['ID', 'Method', 'Path', 'Status', 'Latency', 'Time']}
        rows={apiLogs.map((log) => [
          log.id,
          <span key={log.id} className="font-black text-wigope-orange-600">{log.method}</span>,
          log.path,
          log.status,
          log.latency,
          log.at,
        ])}
      />
    </Card>
  );
}

function WebhooksScreen({ setSelectedWebhook }: { setSelectedWebhook: (event: (typeof webhookEvents)[number]) => void }) {
  return (
    <Card>
      <SectionHeader title="Webhooks" subtitle="Events, processing status, payload viewer and retry controls" />
      <DataTable
        headers={['ID', 'Source', 'Event', 'Status', 'Time', 'Action']}
        rows={webhookEvents.map((event) => [
          event.id,
          event.source,
          event.event,
          <StatusPill key={event.id} status={event.status} />,
          event.at,
          <div key={event.id} className="flex gap-2">
            <Button variant="tertiary" size="sm" onClick={() => setSelectedWebhook(event)}>View</Button>
            <Button variant="secondary" size="sm">Retry</Button>
          </div>,
        ])}
      />
    </Card>
  );
}

function ReportsScreen({ exportRows }: { exportRows: (name: string, rows: Record<string, unknown>[]) => void }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {reports.map((report) => {
        const Icon = report.icon;
        return (
          <Card key={report.title} className="p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-wigope-orange-50 text-wigope-orange-600">
              <Icon className="h-6 w-6" />
            </div>
            <h3 className="mt-5 font-display text-xl font-extrabold">{report.title}</h3>
            <p className="mt-1 text-sm text-ink-secondary">{report.rows} rows · {report.amount}</p>
            <Button variant="secondary" className="mt-5 w-full" onClick={() => exportRows(report.title, transactions)}>
              Export
            </Button>
          </Card>
        );
      })}
    </div>
  );
}

type RuntimeSetting = {
  key: string;
  value: string;
  isSecret: boolean;
  configured: boolean;
};

type RuntimeConfigResponse = {
  status: {
    mode: string;
    smsLive: boolean;
    rechargeLive: boolean;
    walletLive: boolean;
    hubbleLive: boolean;
  };
  settings: RuntimeSetting[];
};

const providerGroups = [
  {
    title: 'SMS provider',
    subtitle: 'InboxRaja DLT OTP, sender and template.',
    icon: ShieldCheck,
    keys: ['SMS_PROVIDER', 'INBOXRAJA_BASE_URL', 'INBOXRAJA_API_KEY', 'INBOXRAJA_SENDER_ID', 'INBOXRAJA_TEMPLATE_ID'],
  },
  {
    title: 'Wallet top-up',
    subtitle: 'Razorpay keys used immediately for add-money orders.',
    icon: KeyRound,
    keys: ['RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET', 'RAZORPAY_WEBHOOK_SECRET'],
  },
  {
    title: 'Recharge provider',
    subtitle: 'KwikAPI UAT/production endpoint, API key and webhook secret.',
    icon: Smartphone,
    keys: ['KWIKAPI_BASE_URL', 'KWIKAPI_API_KEY', 'KWIKAPI_ENVIRONMENT', 'KWIKAPI_WEBHOOK_SECRET'],
  },
  {
    title: 'Hubble rewards',
    subtitle: 'SSO, coins and webhook shared secrets.',
    icon: BadgeIndianRupee,
    keys: ['HUBBLE_X_SECRET', 'HUBBLE_WEBHOOK_SECRET', 'HUBBLE_SSO_TTL_SECONDS'],
  },
] as const;

function SettingsScreen({ auditLog }: { auditLog: string[] }) {
  const [config, setConfig] = useState<RuntimeConfigResponse | null>(null);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [testMobile, setTestMobile] = useState('');
  const [testingSms, setTestingSms] = useState(false);

  useEffect(() => {
    let active = true;
    fetch('/api/admin/runtime-config', { cache: 'no-store' })
      .then((res) => res.json())
      .then((json) => {
        if (!active) return;
        const data = (json.data ?? json) as RuntimeConfigResponse;
        setConfig(data);
        setDraft(
          Object.fromEntries(
            data.settings.map((item) => [item.key, item.isSecret ? '' : item.value ?? '']),
          ),
        );
      })
      .catch(() => setMessage('Backend admin config API is not reachable.'))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const settingByKey = useMemo(() => {
    return new Map((config?.settings ?? []).map((item) => [item.key, item]));
  }, [config]);

  async function saveGroup(keys: readonly string[], title: string) {
    setSaving(title);
    setMessage(null);
    const settings: Record<string, string> = {};
    for (const key of keys) {
      const meta = settingByKey.get(key);
      const value = draft[key]?.trim() ?? '';
      if (meta?.isSecret && !value) continue;
      settings[key] = value;
    }
    try {
      const res = await fetch('/api/admin/runtime-config', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ settings }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message ?? 'Config save failed');
      const data = json.data as RuntimeConfigResponse;
      setConfig(data);
      setDraft((current) => ({
        ...current,
        ...Object.fromEntries(data.settings.map((item) => [item.key, item.isSecret ? '' : item.value ?? ''])),
      }));
      setMessage(`${title} saved. Backend will use the new values on the next request.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Config save failed');
    } finally {
      setSaving(null);
    }
  }

  async function sendTestSms() {
    setTestingSms(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/runtime-config/test-sms', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ mobile: testMobile }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message ?? 'SMS test failed');
      setMessage(`Live OTP SMS sent to ${json.data.sentTo}.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'SMS test failed');
    } finally {
      setTestingSms(false);
    }
  }

  return (
    <section className="grid gap-5 xl:grid-cols-[1fr_380px]">
      <Card>
        <SectionHeader title="Live settings" subtitle="Provider keys save to backend runtime config and apply instantly" />
        {message && (
          <div className="mx-5 mb-4 rounded-card border border-wigope-orange-200 bg-wigope-orange-50 px-4 py-3 text-sm font-bold text-wigope-orange-700">
            {message}
          </div>
        )}
        {loading ? (
          <div className="space-y-3 p-5 pt-0">
            {[1, 2, 3].map((row) => (
              <div key={row} className="h-24 animate-pulse rounded-card bg-slate-100" />
            ))}
          </div>
        ) : (
          <div className="divide-y divide-border-soft">
            {providerGroups.map(({ title, subtitle, icon: Icon, keys }) => (
              <div key={title} className="px-5 py-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-wigope-orange-50 p-3 text-wigope-orange-600">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-bold">{title}</div>
                      <div className="text-sm text-ink-secondary">{subtitle}</div>
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={saving === title}
                    onClick={() => saveGroup(keys, title)}
                  >
                    {saving === title ? 'Saving...' : 'Save'}
                  </Button>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {keys.map((key) => {
                    const meta = settingByKey.get(key);
                    return (
                      <label key={key} className="space-y-1">
                        <div className="flex items-center justify-between gap-2 text-xs font-black uppercase tracking-[0.14em] text-ink-tertiary">
                          <span>{key.replaceAll('_', ' ')}</span>
                          {meta?.isSecret && meta.configured && <span>Configured: {meta.value}</span>}
                        </div>
                        <input
                          className="h-11 w-full rounded-card border border-border-soft bg-white px-3 text-sm font-bold outline-none transition focus:border-wigope-orange-400 focus:ring-4 focus:ring-wigope-orange-100"
                          placeholder={meta?.isSecret ? 'Leave blank to keep existing secret' : key}
                          value={draft[key] ?? ''}
                          onChange={(event) => setDraft((current) => ({ ...current, [key]: event.target.value }))}
                        />
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
      <Card>
        <SectionHeader title="Runtime status" subtitle="What is live right now" />
        <div className="space-y-3 p-5 pt-0">
          {[
            ['Config store', config?.status.mode === 'database' ? 'Database persistent' : 'Memory only until backend restart'],
            ['Live SMS', config?.status.smsLive ? 'InboxRaja ready' : 'Missing SMS key/provider'],
            ['Recharge', config?.status.rechargeLive ? 'KwikAPI ready' : 'Missing KwikAPI key'],
            ['Wallet', config?.status.walletLive ? 'Razorpay ready' : 'Missing Razorpay keys'],
            ['Rewards', config?.status.hubbleLive ? 'Hubble secret ready' : 'Missing Hubble secret'],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between rounded-card border border-border-soft p-3">
              <span className="text-sm font-black">{label}</span>
              <span className="text-right text-sm font-bold text-ink-secondary">{value}</span>
            </div>
          ))}
        </div>

        <SectionHeader title="Test live SMS" subtitle="Sends a real InboxRaja OTP through backend" />
        <div className="space-y-3 p-5 pt-0">
          <input
            className="h-11 w-full rounded-card border border-border-soft px-3 font-bold outline-none focus:border-wigope-orange-400 focus:ring-4 focus:ring-wigope-orange-100"
            placeholder="10-digit mobile"
            value={testMobile}
            onChange={(event) => setTestMobile(event.target.value)}
          />
          <Button className="w-full" disabled={testingSms} onClick={sendTestSms}>
            {testingSms ? 'Sending...' : 'Send live OTP'}
          </Button>
        </div>

        <SectionHeader title="Admin users" subtitle="2FA and roles" />
        <div className="space-y-3 p-5 pt-0">
          {['Keshav · super_admin · 2FA on', 'Ops Lead · admin · 2FA on', 'Support · analyst · 2FA required'].map((admin) => (
            <div key={admin} className="flex items-center gap-3 rounded-card border border-border-soft p-3">
              <Fingerprint className="h-5 w-5 text-success" />
              <span className="text-sm font-bold">{admin}</span>
            </div>
          ))}
        </div>
        <SectionHeader title="Audit log" subtitle="Recent config changes" />
        <div className="space-y-3 p-5 pt-0">
          {auditLog.map((item) => (
            <div key={item} className="text-sm font-semibold text-ink-secondary">{item}</div>
          ))}
        </div>
      </Card>
    </section>
  );
}

function UserDrawer({ user, onClose }: { user: (typeof users)[number]; onClose: () => void }) {
  return (
    <Drawer title={user.name} subtitle={`${user.id} · +91 ${user.mobile}`} onClose={onClose}>
      <div className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <PreviewCard label="Wallet balance" value={formatINR(user.wallet)} />
          <PreviewCard label="KYC status" value={user.kyc} />
          <PreviewCard label="Email" value={user.email} />
          <PreviewCard label="Joined" value={user.joined} />
        </div>
        <div>
          <h3 className="font-display text-lg font-extrabold">Manual wallet adjust</h3>
          <div className="mt-3 flex gap-2">
            <input className="h-11 min-w-0 flex-1 rounded-card border border-border-soft px-3" placeholder="Amount" />
            <Button>Apply</Button>
          </div>
        </div>
        <DataTable
          headers={['Ledger', 'Amount']}
          rows={[
            ['Wallet topup', '+₹500'],
            ['Jio recharge', '-₹199'],
            ['Cashback', '+₹7'],
          ]}
        />
        <DataTable
          headers={['Txn', 'Status']}
          rows={transactions.filter((txn) => txn.mobile === user.mobile).map((txn) => [txn.id, <StatusPill key={txn.id} status={txn.status} />])}
        />
      </div>
    </Drawer>
  );
}

function PayloadDrawer({ title, payload, onClose }: { title: string; payload: unknown; onClose: () => void }) {
  return (
    <Drawer title={title} subtitle="Raw request / response payload" onClose={onClose}>
      <pre className="max-h-[70vh] overflow-auto rounded-card bg-wigope-navy-900 p-4 text-xs leading-6 text-white">
        {JSON.stringify(payload, null, 2)}
      </pre>
    </Drawer>
  );
}

function Drawer({
  title,
  subtitle,
  onClose,
  children,
}: {
  title: string;
  subtitle: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-wigope-navy-900/35" onClick={onClose}>
      <aside
        className="ml-auto h-full w-full max-w-xl overflow-y-auto bg-white p-6 shadow-sheet"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-extrabold">{title}</h2>
            <p className="mt-1 text-sm text-ink-secondary">{subtitle}</p>
          </div>
          <button onClick={onClose} className="rounded-full border border-border-soft p-2">
            <XCircle className="h-5 w-5" />
          </button>
        </div>
        {children}
      </aside>
    </div>
  );
}

function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <section className={cn('rounded-[24px] border border-border-soft bg-white shadow-card', className)}>{children}</section>;
}

function ChartCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <Card>
      <SectionHeader title={title} subtitle={subtitle} />
      <div className="p-5 pt-0">{children}</div>
    </Card>
  );
}

function SectionHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center">
      <div>
        <h2 className="font-display text-2xl font-extrabold text-wigope-navy-900">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-ink-secondary">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

function DataTable({ headers, rows }: { headers: string[]; rows: Array<Array<React.ReactNode>> }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="border-y border-border-soft bg-surface-soft text-xs uppercase tracking-[0.16em] text-ink-tertiary">
          <tr>
            {headers.map((header) => (
              <th key={header} className="px-5 py-3 font-extrabold">{header}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border-soft">
          {rows.map((row, index) => (
            <tr key={index} className="hover:bg-surface-soft">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="px-5 py-4 font-semibold text-ink-secondary">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatusPill({ status, label }: { status: Status; label?: string }) {
  const tones: Record<Status, string> = {
    success: 'bg-success/10 text-success',
    verified: 'bg-success/10 text-success',
    pending: 'bg-warning/10 text-warning',
    failed: 'bg-danger/10 text-danger',
    refunded: 'bg-info/10 text-info',
    blocked: 'bg-danger/10 text-danger',
  };
  const icons: Record<Status, React.ReactNode> = {
    success: <CheckCircle2 className="h-3.5 w-3.5" />,
    verified: <ShieldCheck className="h-3.5 w-3.5" />,
    pending: <RefreshCcw className="h-3.5 w-3.5" />,
    failed: <XCircle className="h-3.5 w-3.5" />,
    refunded: <RefreshCcw className="h-3.5 w-3.5" />,
    blocked: <XCircle className="h-3.5 w-3.5" />,
  };
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold capitalize', tones[status])}>
      {icons[status]}
      {label ?? status}
    </span>
  );
}

function SearchBox({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) {
  return (
    <label className="flex h-11 items-center gap-2 rounded-card border border-border-soft bg-white px-3 text-sm text-ink-secondary">
      <Search className="h-4 w-4" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="min-w-0 bg-transparent font-semibold outline-none"
      />
    </label>
  );
}

function Field(props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const { label, className, ...inputProps } = props;
  return (
    <label className="block">
      <span className="text-sm font-bold text-ink-secondary">{label}</span>
      <input
        {...inputProps}
        className={cn('mt-2 h-12 w-full rounded-card border border-border-soft bg-surface-soft px-4 font-bold outline-none focus:border-wigope-orange-600', className)}
      />
    </label>
  );
}

function Chip({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <span className={cn('inline-flex items-center gap-2 rounded-full border border-border-soft bg-white px-4 py-2 text-sm font-bold text-ink-secondary', className)}>
      {children}
    </span>
  );
}

function NumberCell({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return (
    <input
      type="number"
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
      className="h-9 w-24 rounded-card border border-border-soft px-3 text-sm font-bold text-ink-primary outline-none focus:border-wigope-orange-600"
    />
  );
}

function PreviewCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-card border border-border-soft bg-surface-soft p-4">
      <div className="text-xs font-bold uppercase tracking-[0.18em] text-ink-tertiary">{label}</div>
      <div className="mt-1 font-display text-lg font-extrabold text-wigope-navy-900">{value}</div>
    </div>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="col-span-full rounded-[20px] border border-dashed border-border bg-surface-soft p-8 text-center">
      <ListChecks className="mx-auto h-10 w-10 text-wigope-orange-600" />
      <h3 className="mt-3 font-display text-xl font-extrabold">{title}</h3>
      <p className="mt-1 text-sm text-ink-secondary">{body}</p>
    </div>
  );
}
