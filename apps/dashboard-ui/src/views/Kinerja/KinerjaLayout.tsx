import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const MENU = [
  { to: '/kinerja',                label: 'Beranda',                   exact: true },
  { to: '/kinerja/skp',            label: 'Sasaran Kinerja Pegawai' },
  { to: '/kinerja/cetak',          label: 'Cetak & Unggah Dokumen' },
  { to: '/kinerja/hk',             label: 'Pengajuan & Monitoring HK' },
  { to: '/kinerja/tte',            label: 'Tanda Tangan Elektronik' },
  { to: '/kinerja/pdf-tools',      label: 'Gabung & Kompres PDF' },
  { to: '/kinerja/rekap',          label: 'Rekapitulasi Kompetensi' },
  { to: '/kinerja/pembinaan',      label: 'Pembinaan Kinerja' },
  { to: '/kinerja/pengaturan',     label: 'Pengaturan Atasan' },
  { to: '/kinerja/unduh',          label: 'Unduh Dokumen' },
  { to: '/kinerja/video',          label: 'Video Tutorial' },
];

export default function KinerjaLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const isActive = (m: any) => m.exact ? location.pathname === m.to : location.pathname.startsWith(m.to);
  const initials = (user?.name ?? 'U').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-blue-900 text-white shadow-md sticky top-0 z-30">
        <div className="flex items-center justify-between px-6 py-3">
          <Link to="/kinerja" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-md bg-yellow-400 text-blue-900 flex items-center justify-center font-bold">E</div>
            <span className="font-bold text-lg tracking-wide">E-KINERJA</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/" className="text-xs text-blue-200 hover:text-white transition">Dashboard</Link>
            <a href="#" className="bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1.5 rounded-md">
              Helpdesk
            </a>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="w-64 bg-blue-800 text-white min-h-[calc(100vh-57px)] flex flex-col fixed left-0 top-[57px] overflow-y-auto">
          <nav className="flex-1 p-3 space-y-0.5">
            {MENU.map((m) => {
              const active = isActive(m);
              return (
                <Link
                  key={m.to}
                  to={m.to}
                  className={`block px-3 py-2.5 rounded-lg text-xs font-medium transition ${
                    active
                      ? 'bg-blue-900 text-white shadow-inner'
                      : 'text-blue-100 hover:bg-blue-700'
                  }`}
                >
                  {m.label}
                </Link>
              );
            })}
          </nav>

          {user && (
            <div className="p-3 border-t border-blue-700">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 text-blue-900 font-bold flex items-center justify-center">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{user.name}</p>
                  <p className="text-[10px] text-blue-200 truncate">NIP: 199610112022031007</p>
                </div>
              </div>
              <button
                onClick={() => { logout(); navigate('/login'); }}
                className="w-full text-xs bg-blue-900 hover:bg-red-600 text-blue-100 hover:text-white py-2 rounded-lg transition"
              >
                Keluar
              </button>
            </div>
          )}
        </aside>

        <main className="flex-1 ml-64 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}