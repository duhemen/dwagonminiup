import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import RegionSelector from './RegionSelector';
import NotificationBell from './NotificationBell';

interface TopBarProps {
  title?: string;
  variant?: 'blue' | 'orange' | 'navy';
}

const BG = {
  blue: 'bg-white border-b border-slate-200',
  orange: 'bg-white border-b border-orange-200',
  navy: 'bg-blue-900 border-b border-blue-800 text-white',
};

export default function TopBar({ title = 'DwagonMiniUp', variant = 'blue' }: TopBarProps) {
  const { user } = useAuth();
  const initials = (user?.name ?? 'U').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

  return (
    <header className={`${BG[variant]} px-6 py-3 flex items-center justify-between sticky top-0 z-30 shadow-sm`}>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white ${
            variant === 'orange' ? 'bg-orange-500' : 'bg-blue-600'
          }`}>D</div>
          <span className={`font-semibold ${variant === 'navy' ? 'text-white' : 'text-slate-800'}`}>{title}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <RegionSelector />
        <NotificationBell />
        <Link to="/profil" className="flex items-center gap-3 hover:opacity-80 transition cursor-pointer group ml-1">
          <div className="text-right hidden sm:block">
            <p className={`text-xs font-medium ${variant === 'navy' ? 'text-white' : 'text-slate-700'}`}>
              {user?.name ?? 'Pengguna'}
            </p>
            <p className="text-[10px] text-slate-400 group-hover:text-blue-500">{user?.email}</p>
          </div>
          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${
            variant === 'orange' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
          }`}>
            {initials}
          </div>
        </Link>
      </div>
    </header>
  );
}