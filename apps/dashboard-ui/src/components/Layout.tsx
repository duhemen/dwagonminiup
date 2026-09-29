import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useApprovalBadge } from '../hooks/useApprovalBadge';
import { useNotifications } from '../contexts/NotificationContext';

const ROLE_LABELS: Record<string, string> = {
  pegawai: 'Pegawai', pimpinan: 'Pimpinan', upt: 'Admin UPT',
  kepegawaian: 'Kepegawaian', admin: 'Administrator',
};

const MENU_SECTIONS = [
  {
    title: 'Layanan Publik',
    items: [
      { to: '/karyasiswa', label: 'Karyasiswa', icon: '🎓' },
      { to: '/spasi', label: 'SPASI', icon: '🏢' },
      { to: '/ticketing', label: 'Ticketing DATIN', icon: '🎫' },
    ],
  },
  {
    title: 'Utama',
    items: [
      { to: '/', label: 'Dashboard', icon: 'ðŸ ' },
      { to: '/kinerja', label: 'Kinerja', icon: 'ðŸ“Š' },
      { to: '/ehrd', label: 'E-HRD', icon: 'ðŸ‘¥' },
      { to: '/akreditasi', label: 'Akreditasi', icon: 'ðŸ…' },
      { to: '/karir', label: 'Karir', icon: 'ðŸš€' },
      { to: '/klop', label: 'Klop', icon: 'ðŸŽ“' },
      { to: '/karya', label: 'Karya', icon: 'ðŸ’¡' },
    ],
  },
  {
    title: 'Monitoring',
    items: [
      { to: '/live-dashboard', label: 'Live Metrics', icon: 'ðŸ“ˆ' },
      { to: '/sync-monitor', label: 'Sync Monitor', icon: 'ðŸ”„' },
      { to: '/edge-registry', label: 'Edge Registry', icon: 'ðŸ”' },
      { to: '/system-health', label: 'System Health', icon: 'ðŸ’š' },
      { to: '/about', label: 'Tentang', icon: 'â„¹ï¸' },
    ],
  },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const { unread } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();
  const { isApprover, stats } = useApprovalBadge();

  function handleLogout() {
    if (!confirm('Yakin ingin keluar?')) return;
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-slate-900 text-white p-5 flex flex-col overflow-y-auto">
        <h1 className="text-lg font-bold mb-6 px-2">DwagonMiniUp</h1>

        <nav className="flex-1 space-y-4">
          {isApprover && stats && (
            <Link to="/approval"
              className={`flex items-center justify-between px-3 py-2 rounded-lg transition ${
                location.pathname === '/approval' ? 'bg-blue-600' : 'text-slate-300 hover:bg-slate-800'
              }`}>
              <span className="text-sm">ðŸ“‹ Persetujuan</span>
              {stats.pending > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{stats.pending}</span>
              )}
            </Link>
          )}

          {MENU_SECTIONS.map((sec) => (
            <div key={sec.title}>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider px-3 mb-2 font-semibold">{sec.title}</p>
              <div className="space-y-1">
                {sec.items.map((m) => {
                  const active = location.pathname === m.to;
                  return (
                    <Link key={m.to} to={m.to}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                        active ? 'bg-blue-600 font-medium' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}>
                      <span>{m.icon}</span>
                      <span>{m.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}

          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider px-3 mb-2 font-semibold">Akun</p>
            <Link to="/notifications"
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition ${
                location.pathname === '/notifications' ? 'bg-blue-600 font-medium' : 'text-slate-300 hover:bg-slate-800'
              }`}>
              <span className="flex items-center gap-3"><span>ðŸ””</span> Notifikasi</span>
              {unread > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{unread > 99 ? '99+' : unread}</span>
              )}
            </Link>
          </div>
        </nav>

        {user && (
          <div className="border-t border-slate-700 pt-4 mt-4">
            <div className="mb-3 px-2">
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              <p className="text-xs text-slate-400 truncate">{user.email}</p>
              <span className="inline-block mt-1 text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded">
                {ROLE_LABELS[user.role] ?? user.role}
              </span>
            </div>
            <button onClick={handleLogout}
              className="w-full text-xs bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white py-2 rounded-lg transition">
              Keluar
            </button>
          </div>
        )}
      </aside>
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}