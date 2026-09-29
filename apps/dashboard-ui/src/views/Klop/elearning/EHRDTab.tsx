import { useState } from 'react';

type SubTab = 'rpk10' | 'rpk20' | 'rpk70' | 'asesmen';

const SUBTABS = [
  { key: 'rpk10',   label: 'RPK-10',   title: 'Rencana Pengembangan Kompetensi (RPK-10)', desc: 'Tidak ada data rekomendasi pelatihan yang tersedia' },
  { key: 'rpk20',   label: 'RPK-20',   title: 'Coaching Mentoring Counseling (RPK-20)',   desc: 'Tidak ada data coaching mentoring counseling yang tersedia' },
  { key: 'rpk70',   label: 'RPK-70',   title: 'Program Pendidikan (RPK-70)',              desc: 'Tidak ada data program pendidikan yang tersedia' },
  { key: 'asesmen', label: 'Asesmen',  title: 'Hasil Asesmen',                            desc: 'Tidak ada data asesmen yang tersedia' },
];

export default function EHRDTab() {
  const [sub, setSub] = useState<SubTab>('rpk10');
  const current = SUBTABS.find((s) => s.key === sub)!;

  return (
    <div>
      {/* Header */}
      <div className="mb-5">
        <h2 className="text-xl font-bold text-slate-800 mb-1">Data E-HRD</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-slate-500 mt-3">
          <p>Data Kotak: <span className="font-medium text-slate-700">-</span></p>
          <p>Rating Kinerja: <span className="font-medium text-slate-700">-</span></p>
          <p>Jenis Asesmen: <span className="font-medium text-slate-700">-</span></p>
          <p>Nilai Potensi Kompetensi: <span className="font-medium text-slate-700">-</span></p>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex flex-wrap gap-6 border-b border-slate-200 mb-4">
        {SUBTABS.map((s) => (
          <button
            key={s.key}
            onClick={() => setSub(s.key as SubTab)}
            className={`pb-3 text-sm font-medium transition border-b-2 -mb-px ${
              sub === s.key
                ? 'border-orange-500 text-slate-800'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-800">{current.title}</h3>
          <a href="/ehrd" className="text-xs text-blue-600 hover:underline">E-HRD →</a>
        </div>

        {/* Empty state */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-8 text-center">
          <p className="text-3xl mb-2 opacity-40">ℹ️</p>
          <p className="text-sm font-medium text-slate-600 mb-1">Tidak ada data</p>
          <p className="text-xs text-slate-400">{current.desc}</p>
        </div>
      </div>
    </div>
  );
}