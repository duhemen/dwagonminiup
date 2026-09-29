import { FormEvent, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const DEMO_PASSWORD = 'demo123';

const QUICK_USERS = [
  { email: 'emen@dwagon.id',        label: 'Pegawai',     color: 'bg-blue-50 border-blue-200 hover:bg-blue-100' },
  { email: 'pimpinan@dwagon.id',    label: 'Pimpinan',    color: 'bg-purple-50 border-purple-200 hover:bg-purple-100' },
  { email: 'upt@dwagon.id',         label: 'Admin UPT',   color: 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100' },
  { email: 'kepegawaian@dwagon.id', label: 'Kepegawaian', color: 'bg-amber-50 border-amber-200 hover:bg-amber-100' },
];

const SIMULATE_REGIONS = [
  { value: '',           label: '🌐 Auto-detect' },
  { value: 'sumatera',   label: '🌴 Sumatera' },
  { value: 'jawa',       label: '🏙️ Jawa' },
  { value: 'kalimantan', label: '🌳 Kalimantan' },
  { value: 'bali-nusra', label: '🏖️ Bali-Nusra' },
  { value: 'sulawesi',   label: '🦋 Sulawesi' },
  { value: 'maluku',     label: '🐚 Maluku' },
  { value: 'papua',      label: '🐦 Papua' },
];

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/';

  const [email, setEmail] = useState('emen@dwagon.id');
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [simulateRegion, setSimulateRegion] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => { if (isAuthenticated) navigate(from, { replace: true }); }, [isAuthenticated, from, navigate]);

  async function doLogin(loginEmail: string, loginPassword: string) {
    setError(null); setInfo(null); setLoading(true);
    try {
      const result = await login(loginEmail, loginPassword, simulateRegion || undefined);
      const sourceLabel: Record<string, string> = {
        ip: '📍 auto-detect dari IP', profile: '👤 dari profil',
        assigned: '💾 dari pilihan tersimpan', locked: '🔒 dari pin manual',
        default: '🌐 region default', simulate: '🧪 dari simulasi',
      };
      setInfo(`Region: ${result.region.toUpperCase()} — ${sourceLabel[result.regionSource] ?? ''}`);
      setTimeout(() => navigate(from, { replace: true }), 700);
    } catch (e: any) {
      setError(e?.response?.data?.error ?? e?.message ?? 'Login gagal');
    } finally { setLoading(false); }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) return setError('Email wajib diisi');
    if (!password.trim()) return setError('Password wajib diisi');
    doLogin(email.trim(), password);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 shadow-lg shadow-blue-500/30 mb-4">
            <span className="text-white font-bold text-2xl">D</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-800">Selamat Datang Kembali</h1>
          <p className="text-slate-500 mt-2 text-sm">Masuk ke akun <span className="font-semibold text-slate-700">DwagonMiniUp</span></p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 sm:p-8">
          {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">{error}</div>}
          {info && <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg p-3 text-sm">{info}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@dwagon.id"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" disabled={loading} />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-slate-700">Password</label>
                <button type="button" onClick={() => setShowPassword((v) => !v)} className="text-xs text-blue-600 hover:underline">
                  {showPassword ? 'Sembunyikan' : 'Tampilkan'}
                </button>
              </div>
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" disabled={loading} />
            </div>

            <details className="bg-slate-50 rounded-lg border border-slate-200 px-3 py-2 text-xs">
              <summary className="cursor-pointer text-slate-600 font-medium">🧪 Simulate Region (testing)</summary>
              <div className="mt-2">
                <p className="text-[10px] text-slate-500 mb-2">Simulasi user dari region berbeda (bypass IP auto-detect).</p>
                <select value={simulateRegion} onChange={(e) => setSimulateRegion(e.target.value)}
                  className="w-full border border-slate-300 rounded px-2 py-1.5 text-xs">
                  {SIMULATE_REGIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
            </details>

            <button type="submit" disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2.5 rounded-lg text-sm">
              {loading ? 'Memproses...' : 'Masuk'}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs text-slate-400 font-medium tracking-wider">ATAU MASUK CEPAT</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            {QUICK_USERS.map((u) => (
              <button key={u.email} type="button" disabled={loading}
                onClick={() => { setEmail(u.email); setPassword(DEMO_PASSWORD); doLogin(u.email, DEMO_PASSWORD); }}
                className={`${u.color} border rounded-lg py-2.5 px-3 text-left transition disabled:opacity-50`}>
                <div className="text-xs font-semibold text-slate-800">{u.label}</div>
                <div className="text-[10px] text-slate-500 truncate">{u.email}</div>
              </button>
            ))}
          </div>

          <div className="mt-6 bg-slate-50 border border-slate-100 rounded-lg p-3 text-center">
            <p className="text-[11px] text-slate-500">Password demo: <span className="font-mono font-bold text-slate-700">demo123</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}