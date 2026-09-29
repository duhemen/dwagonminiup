import { Link } from 'react-router-dom';

interface ServiceCardProps {
  title: string;
  description: string;
  icon: string;
  path: string;
  nip?: string;
  autoLogin?: boolean;
  connected?: boolean;
  color?: string;
}

export default function ServiceCard({
  title,
  description,
  icon,
  path,
  nip = '198108272025211024',
  autoLogin = true,
  connected = true,
  color = 'bg-blue-100 text-blue-600',
}: ServiceCardProps) {
  return (
    <Link
      to={path}
      className="block bg-white rounded-xl border border-slate-200 p-5 hover:shadow-lg hover:border-blue-300 transition-all duration-200 group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold ${color}`}>
          {icon}
        </div>
        {autoLogin && (
          <span className="text-[10px] bg-pink-500 text-white px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
            ⚡ Auto-Login
          </span>
        )}
      </div>

      {nip && (
        <p className="text-[10px] text-slate-400 mb-2 flex items-center gap-1">
          <span>👤</span> {nip}
        </p>
      )}

      <h3 className="font-bold text-slate-800 text-lg mb-1 group-hover:text-blue-600 transition">
        {title}
      </h3>
      <p className="text-xs text-slate-500 leading-relaxed mb-4 line-clamp-2 min-h-[2.5rem]">
        {description}
      </p>

      {connected && (
        <span className="inline-flex items-center gap-1.5 text-xs text-green-700 bg-green-50 border border-green-200 px-3 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
          Sudah Terhubung
        </span>
      )}
    </Link>
  );
}