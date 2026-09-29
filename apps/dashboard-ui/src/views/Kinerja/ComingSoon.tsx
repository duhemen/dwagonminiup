import { Link } from 'react-router-dom';

interface Props {
  title: string;
  description: string;
}

export default function KinerjaComingSoon({ title, description }: Props) {
  return (
    <div className="p-6 max-w-2xl mx-auto py-16">
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="bg-blue-900 text-white px-6 py-4 text-center">
          <h1 className="font-bold text-lg">{title}</h1>
        </div>
        <div className="p-8 text-center">
          {/* CSS-only icon — no emoji */}
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center">
            <div className="w-12 h-12 rounded-lg bg-blue-900 flex items-center justify-center">
              <span className="text-white font-bold text-xl">?</span>
            </div>
          </div>

          <p className="text-sm text-slate-600 mb-6">{description}</p>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 max-w-md mx-auto">
            <p className="text-xs text-amber-800">
              Fitur ini sedang dalam pengembangan dan akan tersedia di sprint berikutnya.
            </p>
          </div>

          <Link
            to="/kinerja"
            className="inline-block text-sm bg-blue-900 hover:bg-blue-800 text-white px-6 py-2.5 rounded-lg font-medium transition"
          >
            Kembali ke Beranda Kinerja
          </Link>
        </div>
      </div>
    </div>
  );
}