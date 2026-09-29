import { useState } from 'react';
import { useRegion, REGIONS } from '../contexts/RegionContext';

export default function RegionSelector() {
  const { region, setRegion, currentMeta, locked, autoDetected, source } = useRegion();
  const [open, setOpen] = useState(false);
  const totalProvinces = REGIONS.reduce((a, b) => a + b.provinces, 0);

  const sourceLabel: Record<string, string> = {
    ip: '📍 auto dari IP', profile: '👤 dari profil',
    assigned: '💾 tersimpan', locked: '🔒 dipin manual',
    default: '🌐 default', simulate: '🧪 simulasi',
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-white transition text-xs ${
          locked ? 'border-amber-300 bg-amber-50' : autoDetected ? 'border-blue-300 bg-blue-50' : 'border-slate-200 hover:border-blue-300'
        }`}
        title={`Region: ${currentMeta.label} (${sourceLabel[source ?? 'assigned'] ?? 'unknown'})`}
      >
        <span>{currentMeta.flag}</span>
        <span className="font-medium text-slate-700 hidden sm:inline">{currentMeta.label}</span>
        {locked && <span className="text-amber-600 text-[10px]">🔒</span>}
        {autoDetected && !locked && <span className="text-blue-600 text-[10px]">📍</span>}
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
        <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl z-20 w-80 overflow-hidden">
            <div className="px-4 py-2.5 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-slate-50">
              <p className="text-[10px] text-slate-500 uppercase tracking-wide font-semibold">Pilih Region Edge</p>
              <p className="text-[10px] text-slate-400 mt-0.5">7 region · {totalProvinces} provinsi Indonesia</p>
              {source && <p className="text-[10px] text-blue-600 mt-1 font-medium">Saat ini: {sourceLabel[source] ?? source}</p>}
            </div>
            <div className="max-h-96 overflow-y-auto">
              {REGIONS.map((r) => (
                <button
                  key={r.value}
                  onClick={async () => { await setRegion(r.value, { lock: true }); setOpen(false); }}
                  className={`w-full text-left px-4 py-2.5 hover:bg-blue-50 transition flex items-center gap-3 border-b border-slate-50 last:border-0 ${region === r.value ? 'bg-blue-50' : ''}`}
                >
                  <span className="text-xl">{r.flag}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-medium ${region === r.value ? 'text-blue-700' : 'text-slate-700'}`}>{r.label}</p>
                    <p className="text-[10px] text-slate-400 truncate">{r.provinces} provinsi · {r.capital} · :{r.port}</p>
                  </div>
                  {region === r.value && <span className="text-blue-600 text-xs flex-shrink-0">✓</span>}
                </button>
              ))}
            </div>
            <div className="px-4 py-2 bg-slate-50 border-t border-slate-100">
              <p className="text-[10px] text-slate-500">💡 Pilih = lock region. Unlock lewat halaman profil.</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}