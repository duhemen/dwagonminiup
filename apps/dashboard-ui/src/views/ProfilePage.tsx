import { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import { changePassword, getMe, ProfileResponse } from '../api/auth';
import { unlockRegion, detectRegion } from '../api/geo';
import { useAuth } from '../contexts/AuthContext';
import { useRegion } from '../contexts/RegionContext';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { region, setRegion, locked, source } = useRegion();
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [regionMsg, setRegionMsg] = useState<string | null>(null);

  useEffect(() => { getMe().then(setProfile).catch(() => {}); }, []);

  async function handleUnlock() {
    try {
      setRegionMsg(null);
      await unlockRegion();
      const detect = await detectRegion();
      await setRegion(detect.region as any);
      window.dispatchEvent(new CustomEvent('dwagon:region-changed', {
        detail: { region: detect.region, source: detect.source, locked: false },
      }));
      setRegionMsg(`Unlock berhasil. Region baru: ${detect.region} (${detect.source})`);
      setTimeout(() => window.location.reload(), 1200);
    } catch (e: any) {
      setRegionMsg(`Gagal unlock: ${e?.message ?? 'unknown'}`);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null); setSuccess(null);
    if (!oldPassword || !newPassword || !confirmPassword) return setError('Semua field wajib diisi');
    if (newPassword.length < 6) return setError('Password baru minimal 6 karakter');
    if (newPassword !== confirmPassword) return setError('Konfirmasi tidak cocok');
    if (oldPassword === newPassword) return setError('Harus berbeda dari yang lama');
    setLoading(true);
    try {
      const res = await changePassword(oldPassword, newPassword);
      setSuccess(res.message);
      setOldPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (e: any) {
      setError(e?.response?.data?.error ?? e?.message ?? 'Gagal');
    } finally { setLoading(false); }
  }

  const sourceDesc: Record<string, string> = {
    ip: 'auto-detected dari IP address',
    profile: 'dari profil pengguna',
    assigned: 'pilihan tersimpan',
    locked: 'dipin manual oleh Anda',
    default: 'default (tidak terdeteksi)',
    simulate: 'mode simulasi',
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <TopBar title="Profil Saya" variant="blue" />
      <div className="max-w-3xl mx-auto px-6 py-8">
        <button onClick={() => navigate('/')} className="text-sm text-slate-500 hover:text-blue-600 mb-4">← Kembali ke Dashboard</button>

        {/* Region Card */}
        <div className={`rounded-xl border p-5 mb-6 ${locked ? 'bg-amber-50 border-amber-200' : 'bg-blue-50 border-blue-200'}`}>
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-semibold text-slate-800 mb-1 flex items-center gap-2">
                {locked ? '🔒' : '📍'} Region Edge Anda
              </h2>
              <p className="text-sm text-slate-700">
                <span className="font-semibold capitalize">{region}</span>
                <span className="text-xs text-slate-500 ml-2">({sourceDesc[source ?? 'assigned'] ?? source})</span>
              </p>
              {profile?.lastIP && (
                <p className="text-[10px] text-slate-400 mt-1 font-mono">
                  Last IP: {profile.lastIP} · Last login: {profile.lastLoginAt ? new Date(profile.lastLoginAt).toLocaleString('id-ID') : '-'}
                </p>
              )}
            </div>
            {locked && (
              <button onClick={handleUnlock}
                className="text-xs bg-white border border-amber-300 text-amber-700 px-3 py-1.5 rounded-lg hover:bg-amber-100">
                🔓 Unlock & Auto-detect
              </button>
            )}
          </div>
          {regionMsg && <div className="mt-3 text-xs text-blue-700 bg-white border border-blue-200 rounded p-2">{regionMsg}</div>}
        </div>

        {/* Akun */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
          <h2 className="font-semibold text-slate-800 mb-4">Informasi Akun</h2>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div><dt className="text-slate-500 text-xs mb-1">Nama</dt><dd className="font-medium">{profile?.name ?? '-'}</dd></div>
            <div><dt className="text-slate-500 text-xs mb-1">Email</dt><dd className="font-medium">{profile?.email ?? '-'}</dd></div>
            <div><dt className="text-slate-500 text-xs mb-1">NIP</dt><dd className="font-medium">{profile?.nip ?? '-'}</dd></div>
            <div><dt className="text-slate-500 text-xs mb-1">Jabatan</dt><dd className="font-medium">{profile?.jabatan ?? '-'}</dd></div>
            <div><dt className="text-slate-500 text-xs mb-1">Unit Kerja</dt><dd className="font-medium">{profile?.unitKerja ?? '-'}</dd></div>
            <div><dt className="text-slate-500 text-xs mb-1">Role</dt><dd className="font-medium capitalize">{profile?.role ?? user?.role ?? '-'}</dd></div>
          </dl>
        </div>

        {/* Ganti Password */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-800 mb-1">Ganti Password</h2>
          <p className="text-xs text-slate-500 mb-5">Minimal 6 karakter.</p>
          {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">{error}</div>}
          {success && <div className="mb-4 bg-green-50 border border-green-200 text-green-700 rounded-lg p-3 text-sm">✓ {success}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password Lama</label>
              <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm" disabled={loading} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password Baru</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm" disabled={loading} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Konfirmasi Password Baru</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm" disabled={loading} />
            </div>
            <div className="flex gap-2 pt-2">
              <button type="submit" disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2.5 px-6 rounded-lg text-sm">
                {loading ? 'Menyimpan...' : 'Simpan Password Baru'}
              </button>
              <button type="button" onClick={() => { logout(); navigate('/login'); }}
                className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium py-2.5 px-6 rounded-lg text-sm">
                Logout
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}