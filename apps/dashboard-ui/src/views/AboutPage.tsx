import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import { api } from '../api/client';

interface AboutData {
  name: string; version: string; description: string; architecture: string;
  features: string[]; tech: Record<string, string>;
  region: Array<{ name: string; port: number; provinces: number; capital: string }>;
}

export default function AboutPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<AboutData | null>(null);

  useEffect(() => {
    api.get<AboutData>('/system/about').then((r) => setData(r.data)).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <TopBar title="Tentang Sistem" variant="blue" />
      <div className="max-w-4xl mx-auto px-6 py-8">
        <button onClick={() => navigate('/')} className="text-sm text-slate-500 hover:text-blue-600 mb-4">← Kembali</button>

        {!data ? (
          <div className="text-center py-12 text-slate-500">Loading...</div>
        ) : (
          <>
            <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl p-8 text-white mb-6">
              <h1 className="text-3xl font-bold">{data.name}</h1>
              <p className="text-blue-100 mt-1">v{data.version}</p>
              <p className="text-white/90 mt-3">{data.description}</p>
              <p className="text-xs text-blue-100 mt-3">{data.architecture}</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
              <h2 className="font-semibold text-slate-800 mb-4">✨ Fitur Utama</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {data.features.map((f) => (
                  <div key={f} className="flex items-center gap-2 text-sm text-slate-700">
                    <span className="text-green-500">✓</span> {f}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
              <h2 className="font-semibold text-slate-800 mb-4">🛠️ Tech Stack</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(data.tech).map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between text-sm border-b border-slate-100 last:border-0 py-2">
                    <span className="text-slate-500 capitalize">{k}</span>
                    <span className="font-medium text-slate-800">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="font-semibold text-slate-800 mb-4">🇮🇩 7 Region Coverage</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {data.region.map((r) => (
                  <div key={r.name} className="flex items-center justify-between border border-slate-100 rounded-lg p-3">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{r.name}</p>
                      <p className="text-[10px] text-slate-500">{r.provinces} provinsi · {r.capital}</p>
                    </div>
                    <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-1 rounded">:{r.port}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center text-xs text-slate-500">
                Total: <span className="font-bold text-slate-700">38 provinsi</span> seluruh Indonesia
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}