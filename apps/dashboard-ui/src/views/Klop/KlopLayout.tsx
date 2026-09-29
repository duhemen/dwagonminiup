import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const NAV = [
  { to: '/klop',              label: 'Home',           exact: true },
  { to: '/klop/knowledge',    label: 'E-Knowledge' },
  { to: '/klop/elearning',    label: 'E-Learning' },
  { to: '/klop/talkshow',     label: 'Talkshow' },
  { to: '/klop/forum',        label: 'Ruang Diskusi' },
  { to: '/klop/jurnal',       label: 'Jurnal' },
  { to: '/klop/komunitas',    label: 'Komunitas',      badge: 'NEW' },
];

export default function KlopLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const isActive = (item: { to: string; exact?: boolean }) => {
    if (item.exact) return location.pathname === item.to;
    return location.pathname.startsWith(item.to);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Orange Navbar */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/klop" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-orange-500/30 group-hover:shadow-lg transition">
                K
              </div>
              <div>
                <p className="font-bold text-slate-800 leading-tight">Klop</p>
                <p className="text-[9px] text-orange-500 font-medium leading-tight">e-Knowledge by PU</p>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-5 text-sm">
              {NAV.map((m) => (
                <Link
                  key={m.to}
                  to={m.to}
                  className={`relative transition font-medium pb-0.5 ${
                    isActive(m) ? 'text-orange-500' : 'text-slate-600 hover:text-orange-500'
                  }`}
                >
                  {m.label}
                  {m.badge && (
                    <span className="absolute -top-3 -right-6 text-[9px] bg-orange-500 text-white px-1.5 py-0.5 rounded-full font-bold">
                      {m.badge}
                    </span>
                  )}
                  {isActive(m) && (
                    <span className="absolute -bottom-[15px] left-0 right-0 h-0.5 bg-orange-500 rounded-full" />
                  )}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="text-xs text-slate-500 hover:text-orange-500 transition flex items-center gap-1"
              title="Kembali ke Dashboard"
            >
              <span>←</span> <span className="hidden sm:inline">Dashboard</span>
            </Link>
            <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
              <span className="text-sm text-slate-700 font-medium">{user?.email?.split('@')[0]}</span>
              <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded font-bold">ID</span>
            </div>
          </div>
        </div>

        {/* Mobile nav */}
        <div className="md:hidden border-t border-slate-100 overflow-x-auto">
          <div className="flex gap-4 px-6 py-2 text-xs whitespace-nowrap">
            {NAV.map((m) => (
              <Link
                key={m.to}
                to={m.to}
                className={`font-medium transition ${
                  isActive(m) ? 'text-orange-500' : 'text-slate-600'
                }`}
              >
                {m.label}
              </Link>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6">
        <Outlet />
      </main>
    </div>
  );
}