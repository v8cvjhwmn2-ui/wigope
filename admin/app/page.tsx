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

type Status = 'success' | 'pending' | 'failed' | 'refunded' | 'blocked' | 'verified' | 'initiated';

type ChartPoint = Record<string, string | number>;
type AdminKpis = {
  revenue: number;
  transactions: number;
  successRate: number;
  lastSettlement: number;
  totalCashback: number;
  users: number;
  wallets: number;
};
type Transaction = {
  id: string;
  user: string;
  mobile: string;
  service: string;
  operator: string;
  amount: number;
  cashbackAmount?: number;
  status: Status;
  paymentMode?: string;
  time: string;
  raw?: unknown;
};
type UserRow = {
  id: string;
  name: string;
  mobile: string;
  email: string;
  kyc: string;
  wallet: number;
  blocked: boolean;
  joined: string;
  raw?: unknown;
};
type RechargeItem = Transaction & {
  latency?: string;
  request?: unknown;
  response?: unknown;
};
type KycItem = {
  id: string;
  name: string;
  pan: string;
  aadhaar: string;
  confidence: number;
  status?: string;
  submitted: string;
  raw?: unknown;
};
type ApiLog = { id: string; method: string; path: string; status: number; latency: string; at: string };
type WebhookEvent = { id: string; source: string; event: string; status: Status; at: string; payload: unknown };
type Report = { title: string; rows: number; amount: number | string };
type CommissionRow = { service: string; operator: string; mode: string; value: number; min: number; max: number };
type AdminDashboardData = {
  overview: {
    kpis: AdminKpis;
    revenueSeries: ChartPoint[];
    transactionSeries: ChartPoint[];
    operatorSeries: ChartPoint[];
    recentTransactions: Transaction[];
  };
  users: UserRow[];
  transactions: Transaction[];
  rechargeStream: RechargeItem[];
  kycQueue: KycItem[];
  apiLogs: ApiLog[];
  webhookEvents: WebhookEvent[];
  reports: Report[];
};

const emptyDashboard: AdminDashboardData = {
  overview: {
    kpis: {
      revenue: 0,
      transactions: 0,
      successRate: 0,
      lastSettlement: 0,
      totalCashback: 0,
      users: 0,
      wallets: 0,
    },
    revenueSeries: [],
    transactionSeries: [],
    operatorSeries: [],
    recentTransactions: [],
  },
  users: [],
  transactions: [],
  rechargeStream: [],
  kycQueue: [],
  apiLogs: [],
  webhookEvents: [],
  reports: [],
};

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

const transactions: Transaction[] = [];
const users: UserRow[] = [];
const rechargeStreamSeed: RechargeItem[] = [];
const kycItems: KycItem[] = [];
const apiLogs: ApiLog[] = [];
const webhookEvents: WebhookEvent[] = [];
const reports: Report[] = [];

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { cache: 'no-store', ...init });
  const text = await response.text();
  let payload: unknown = null;

  if (text.trim()) {
    try {
      payload = JSON.parse(text);
    } catch {
      throw new Error(`Invalid JSON from ${url}`);
    }
  }

  if (!response.ok) {
    const message =
      typeof payload === 'object' && payload && 'error' in payload
        ? ((payload as { error?: { message?: string } }).error?.message ?? response.statusText)
        : response.statusText;
    throw new Error(message || `Request failed: ${response.status}`);
  }

  return payload as T;
}

function normalizeStatus(value: unknown): Status {
  const status = typeof value === 'string' ? value.toLowerCase() : '';
  if (['success', 'pending', 'failed', 'refunded', 'blocked', 'verified', 'initiated'].includes(status)) {
    return status as Status;
  }
  return 'pending';
}

function normalizeDashboard(value?: Partial<AdminDashboardData>): AdminDashboardData {
  const source = value ?? {};
  const overview = source.overview ?? emptyDashboard.overview;
  return {
    overview: {
      kpis: { ...emptyDashboard.overview.kpis, ...(overview.kpis ?? {}) },
      revenueSeries: Array.isArray(overview.revenueSeries) ? overview.revenueSeries : [],
      transactionSeries: Array.isArray(overview.transactionSeries) ? overview.transactionSeries : [],
      operatorSeries: Array.isArray(overview.operatorSeries) ? overview.operatorSeries : [],
      recentTransactions: Array.isArray(overview.recentTransactions)
        ? overview.recentTransactions.map((txn) => ({ ...txn, status: normalizeStatus(txn.status) }))
        : [],
    },
    users: Array.isArray(source.users) ? source.users : [],
    transactions: Array.isArray(source.transactions)
      ? source.transactions.map((txn) => ({ ...txn, status: normalizeStatus(txn.status) }))
      : [],
    rechargeStream: Array.isArray(source.rechargeStream)
      ? source.rechargeStream.map((txn) => ({ ...txn, status: normalizeStatus(txn.status) }))
      : [],
    kycQueue: Array.isArray(source.kycQueue) ? source.kycQueue : [],
    apiLogs: Array.isArray(source.apiLogs) ? source.apiLogs : [],
    webhookEvents: Array.isArray(source.webhookEvents)
      ? source.webhookEvents.map((event) => ({ ...event, status: normalizeStatus(event.status) }))
      : [],
    reports: Array.isArray(source.reports) ? source.reports : [],
  };
}

export default function AdminPage() {
  const [authStep, setAuthStep] = useState<'checking' | 'login' | 'done'>('checking');
  const [screen, setScreen] = useState<Screen>('overview');
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);
  const [selectedRecharge, setSelectedRecharge] = useState<RechargeItem | null>(null);
  const [selectedWebhook, setSelectedWebhook] = useState<WebhookEvent | null>(null);
  const [dashboard, setDashboard] = useState<AdminDashboardData>(emptyDashboard);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [dashboardError, setDashboardError] = useState<string | null>(null);
  const [kycQueue, setKycQueue] = useState(kycItems);
  const [rechargeStream, setRechargeStream] = useState(rechargeStreamSeed);
  const [commissionRows, setCommissionRows] = useState<CommissionRow[]>([]);
  const [auditLog, setAuditLog] = useState<string[]>([]);

  useEffect(() => {
    let active = true;
    fetch('/api/admin/me', { cache: 'no-store' })
      .then((res) => {
        if (!active) return;
        setAuthStep(res.ok ? 'done' : 'login');
      })
      .catch(() => active && setAuthStep('login'));
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (authStep !== 'done') return;
    let active = true;

    async function loadDashboard() {
      setDashboardLoading(true);
      setDashboardError(null);
      try {
        const json = await fetchJson<{ data?: AdminDashboardData }>('/api/admin/dashboard');
        if (!active) return;
        const next = normalizeDashboard(json.data);
        setDashboard(next);
        setRechargeStream(next.rechargeStream);
        setKycQueue(next.kycQueue);
      } catch (error) {
        if (!active) return;
        setDashboardError(error instanceof Error ? error.message : 'Admin dashboard load failed');
      } finally {
        if (active) setDashboardLoading(false);
      }
    }

    loadDashboard();
    const timer = window.setInterval(loadDashboard, screen === 'recharges' ? 10_000 : 30_000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [authStep, screen]);

  const filteredTransactions = useMemo(() => {
    const q = search.toLowerCase();
    return dashboard.transactions.filter((txn) =>
      [txn.id, txn.mobile, txn.user, txn.operator, txn.service, txn.status].some((v) =>
        String(v).toLowerCase().includes(q),
      ),
    );
  }, [dashboard.transactions, search]);

  const exportRows = (name: string, rows: unknown[]) => {
    const normalizedRows = rows.map((row) => row as Record<string, unknown>);
    if (normalizedRows.length === 0) {
      return;
    }
    const headers = Object.keys(normalizedRows[0] ?? {});
    const csv = [headers.join(','), ...normalizedRows.map((row) => headers.map((h) => JSON.stringify(row[h] ?? '')).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${name}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' }).catch(() => null);
    setDashboard(emptyDashboard);
    setAuthStep('login');
  }

  if (authStep !== 'done') {
    return <AdminAuth checking={authStep === 'checking'} onAuthed={() => setAuthStep('done')} />;
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
                  Session active
                </div>
                <button className="rounded-full border border-border-soft bg-white p-3 text-ink-secondary shadow-card">
                  <Bell className="h-5 w-5" />
                </button>
                <Button variant="secondary" size="sm" onClick={logout}>
                  Logout
                </Button>
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
            {dashboardError && (
              <div className="rounded-card border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                {dashboardError}
              </div>
            )}
            {screen === 'overview' && (
              <Overview
                data={dashboard.overview}
                loading={dashboardLoading}
                exportRows={exportRows}
              />
            )}
            {screen === 'users' && (
              <UsersScreen
                users={dashboard.users}
                search={search}
                setSearch={setSearch}
                setSelectedUser={setSelectedUser}
              />
            )}
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
            {screen === 'logs' && <LogsScreen logs={dashboard.apiLogs} />}
            {screen === 'webhooks' && (
              <WebhooksScreen events={dashboard.webhookEvents} setSelectedWebhook={setSelectedWebhook} />
            )}
            {screen === 'reports' && <ReportsScreen reports={dashboard.reports} exportRows={exportRows} />}
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

function AdminAuth({ checking, onAuthed }: { checking: boolean; onAuthed: () => void }) {
  const [email, setEmail] = useState('admin@wigope.com');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    setError(null);
    try {
      await fetchJson('/api/admin/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, password, otp }),
      });
      onAuthed();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Admin login failed');
    } finally {
      setLoading(false);
    }
  }

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
            {checking ? 'Checking session' : 'Admin sign in'}
          </h1>
          <p className="mt-2 text-sm leading-6 text-ink-secondary">
            Use admin credentials and the configured access code to open the production control room.
          </p>
        </div>
        {!checking && (
          <form
            className="mt-6 space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              submit();
            }}
          >
            <Field label="Email" value={email} onChange={(event) => setEmail(event.target.value)} />
            <Field label="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Admin password" />
            <Field label="Access code" value={otp} onChange={(event) => setOtp(event.target.value)} placeholder="Configured 2FA code" />
            {error && (
              <div className="rounded-card border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                {error}
              </div>
            )}
            <Button className="w-full" size="lg" disabled={loading || !email || !password || otp.length < 6}>
              {loading ? 'Signing in...' : 'Open dashboard'}
            </Button>
          </form>
        )}
      </section>
    </main>
  );
}

function Overview({
  data,
  loading,
  exportRows,
}: {
  data: AdminDashboardData['overview'];
  loading: boolean;
  exportRows: (name: string, rows: unknown[]) => void;
}) {
  const kpis = [
    { label: 'Revenue', value: formatINR(data.kpis.revenue), delta: 'Live gross volume', icon: BadgeIndianRupee },
    { label: 'Transactions', value: String(data.kpis.transactions), delta: 'All statuses', icon: Activity },
    { label: 'Success Rate', value: `${data.kpis.successRate.toFixed(1)}%`, delta: 'Provider settled', icon: CheckCircle2 },
    { label: 'Last Settlement', value: formatINR(data.kpis.lastSettlement), delta: 'Awaiting settlement feed', icon: ShieldCheck },
  ];

  return (
    <>
      <section className="bg-grid rounded-[28px] border border-border-soft bg-white p-6 shadow-card">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-wigope-orange-600">Admin command center</p>
            <h2 className="mt-2 font-display text-4xl font-extrabold text-wigope-navy-900">
              Welcome back
            </h2>
            <p className="mt-2 max-w-2xl text-ink-secondary">
              Monitor revenue, recharges, KYC risk, wallet movements, provider logs, and settlement health from one panel.
            </p>
          </div>
          <Button onClick={() => exportRows('recent-transactions', data.recentTransactions)}>
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
          {loading ? <PanelSkeleton /> : data.revenueSeries.length ? (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={data.revenueSeries}>
                <CartesianGrid stroke="#E8EAF0" strokeDasharray="4 4" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => `₹${Number(v) / 1000}k`} />
                <Tooltip formatter={(v) => formatINR(Number(v))} />
                <Line type="monotone" dataKey="revenue" stroke="#F97316" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : <EmptyState title="No revenue yet" body="Successful recharge and wallet transactions will appear here." />}
        </ChartCard>

        <ChartCard title="Top operators" subtitle="Volume by operator">
          {loading ? <PanelSkeleton /> : data.operatorSeries.length ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data.operatorSeries} layout="vertical">
                <CartesianGrid stroke="#E8EAF0" strokeDasharray="4 4" />
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} width={80} />
                <Tooltip />
                <Bar dataKey="value" fill="#F97316" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyState title="No operator volume" body="Operator analytics will populate from live recharge transactions." />}
        </ChartCard>
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <ChartCard title="Transactions stacked area" subtitle="Recharge, bills, rewards">
          {loading ? <PanelSkeleton /> : data.transactionSeries.length ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={data.transactionSeries}>
                <CartesianGrid stroke="#E8EAF0" strokeDasharray="4 4" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="recharge" stackId="1" fill="#F97316" stroke="#F97316" />
                <Area type="monotone" dataKey="bills" stackId="1" fill="#3B82F6" stroke="#3B82F6" />
                <Area type="monotone" dataKey="rewards" stackId="1" fill="#10B981" stroke="#10B981" />
              </AreaChart>
            </ResponsiveContainer>
          ) : <EmptyState title="No transaction mix" body="Recharge, bill and reward categories will appear after live usage." />}
        </ChartCard>
        <Card className="overflow-hidden">
          <SectionHeader title="Recent transactions" subtitle="Last 20, newest first" />
          <DataTable
            headers={['Txn ID', 'User', 'Service', 'Amount', 'Status']}
            rows={data.recentTransactions.map((txn) => [
              txn.id,
              txn.user,
              txn.service,
              formatINR(txn.amount),
              <StatusPill key={txn.id} status={txn.status} />,
            ])}
          />
          {data.recentTransactions.length === 0 && <EmptyState title="No transactions yet" body="Live transactions will show up here automatically." />}
        </Card>
      </section>
    </>
  );
}

function UsersScreen({
  users,
  search,
  setSearch,
  setSelectedUser,
}: {
  users: UserRow[];
  search: string;
  setSearch: (value: string) => void;
  setSelectedUser: (user: UserRow) => void;
}) {
  const q = search.toLowerCase();
  const filtered = users.filter((user) =>
    [user.name, user.mobile, user.email, user.kyc].some((v) => String(v).toLowerCase().includes(q)),
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
      {filtered.length === 0 && <EmptyState title="No users found" body="Users will appear here after OTP login creates their account." />}
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
  exportRows: (name: string, rows: unknown[]) => void;
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
      {transactions.length === 0 && <EmptyState title="No transactions found" body="Recharge, deposits, refunds and cashback entries will appear here." />}
    </Card>
  );
}

function RechargesScreen({
  items,
  setSelectedRecharge,
}: {
  items: RechargeItem[];
  setSelectedRecharge: (item: RechargeItem) => void;
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
      {items.length === 0 && <EmptyState title="No recharge stream yet" body="Live recharge requests will stream here from the backend." />}
    </Card>
  );
}

function CommissionsScreen({
  rows,
  setRows,
  auditLog,
  setAuditLog,
}: {
  rows: CommissionRow[];
  setRows: (rows: CommissionRow[]) => void;
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
  items: KycItem[];
  setItems: (items: KycItem[]) => void;
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

function LogsScreen({ logs }: { logs: ApiLog[] }) {
  return (
    <Card>
      <SectionHeader title="API Logs" subtitle="Last 7 days · filterable and searchable" action={<SearchBox value="" onChange={() => null} placeholder="Search path" />} />
      <DataTable
        headers={['ID', 'Method', 'Path', 'Status', 'Latency', 'Time']}
        rows={logs.map((log) => [
          log.id,
          <span key={log.id} className="font-black text-wigope-orange-600">{log.method}</span>,
          log.path,
          log.status,
          log.latency,
          log.at,
        ])}
      />
      {logs.length === 0 && <EmptyState title="No API logs yet" body="Request log persistence is ready for wiring; no stored log rows were returned." />}
    </Card>
  );
}

function WebhooksScreen({
  events,
  setSelectedWebhook,
}: {
  events: WebhookEvent[];
  setSelectedWebhook: (event: WebhookEvent) => void;
}) {
  return (
    <Card>
      <SectionHeader title="Webhooks" subtitle="Events, processing status, payload viewer and retry controls" />
      <DataTable
        headers={['ID', 'Source', 'Event', 'Status', 'Time', 'Action']}
        rows={events.map((event) => [
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
      {events.length === 0 && <EmptyState title="No webhook events stored" body="Webhook monitor will show events once webhook persistence is enabled." />}
    </Card>
  );
}

function ReportsScreen({
  reports,
  exportRows,
}: {
  reports: Report[];
  exportRows: (name: string, rows: unknown[]) => void;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {reports.map((report) => {
        const Icon = FileBarChart2;
        return (
          <Card key={report.title} className="p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-wigope-orange-50 text-wigope-orange-600">
              <Icon className="h-6 w-6" />
            </div>
            <h3 className="mt-5 font-display text-xl font-extrabold">{report.title}</h3>
            <p className="mt-1 text-sm text-ink-secondary">
              {report.rows} rows · {typeof report.amount === 'number' ? formatINR(report.amount) : report.amount}
            </p>
            <Button variant="secondary" className="mt-5 w-full" onClick={() => exportRows(report.title, [report])}>
              Export
            </Button>
          </Card>
        );
      })}
      {reports.length === 0 && <EmptyState title="No reports yet" body="Report cards will populate from live transactions and wallet ledger." />}
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
    fetchJson<{ data?: RuntimeConfigResponse }>('/api/admin/runtime-config')
      .then((json) => {
        if (!active) return;
        const data = json.data;
        if (!data || !Array.isArray(data.settings)) {
          throw new Error('Runtime config response is incomplete.');
        }
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
      const json = await fetchJson<{ data: RuntimeConfigResponse }>('/api/admin/runtime-config', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ settings }),
      });
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
      const json = await fetchJson<{ data: { sentTo: string } }>('/api/admin/runtime-config/test-sms', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ mobile: testMobile }),
      });
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

        <SectionHeader title="Admin access" subtitle="Configured via production environment variables" />
        <div className="space-y-3 p-5 pt-0">
          <div className="flex items-center gap-3 rounded-card border border-border-soft p-3">
            <Fingerprint className="h-5 w-5 text-success" />
            <span className="text-sm font-bold">super_admin · password + access code required</span>
          </div>
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

function UserDrawer({ user, onClose }: { user: UserRow; onClose: () => void }) {
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
    initiated: 'bg-info/10 text-info',
    failed: 'bg-danger/10 text-danger',
    refunded: 'bg-info/10 text-info',
    blocked: 'bg-danger/10 text-danger',
  };
  const icons: Record<Status, React.ReactNode> = {
    success: <CheckCircle2 className="h-3.5 w-3.5" />,
    verified: <ShieldCheck className="h-3.5 w-3.5" />,
    pending: <RefreshCcw className="h-3.5 w-3.5" />,
    initiated: <RefreshCcw className="h-3.5 w-3.5" />,
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

function PanelSkeleton() {
  return (
    <div className="h-[280px] animate-pulse rounded-[20px] border border-border-soft bg-surface-soft">
      <div className="h-full rounded-[20px] bg-gradient-to-br from-white via-slate-100 to-white" />
    </div>
  );
}
