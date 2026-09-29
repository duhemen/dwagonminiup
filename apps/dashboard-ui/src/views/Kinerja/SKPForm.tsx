import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createSKP } from '../../api/kinerja';

interface RHKField {
  rencanaHasilKerja: string;
  indikator: string[];
  target: string;
  satuan: string;
}

export default function SKPForm() {
  const navigate = useNavigate();
  const year = new Date().getFullYear();

  const [form, setForm] = useState({
    tahun: year,
    periodeMulai: `${year}-01-01`,
    periodeSelesai: `${year}-12-31`,
    jabatan: '',
    unitKerja: '',
    atasanNama: '',
    atasanNip: '',
    atasanJabatan: '',
    pejabatNama: '',
    pejabatNip: '',
    pejabatJabatan: '',
  });

  const [rhkList, setRhkList] = useState<RHKField[]>([
    { rencanaHasilKerja: '', indikator: [''], target: '', satuan: '' },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addRHK = () => setRhkList([...rhkList, { rencanaHasilKerja: '', indikator: [''], target: '', satuan: '' }]);
  const removeRHK = (i: number) => setRhkList(rhkList.filter((_, idx) => idx !== i));
  const updateRHK = (i: number, field: keyof RHKField, value: any) => {
    const next = [...rhkList];
    (next[i] as any)[field] = value;
    setRhkList(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.periodeMulai || !form.periodeSelesai) { setError('Periode wajib diisi'); return; }
    if (rhkList.length === 0 || !rhkList[0].rencanaHasilKerja.trim()) {
      setError('Minimal 1 RHK harus diisi');
      return;
    }
    setLoading(true); setError(null);
    try {
      const payload = {
        ...form,
        rhkList: rhkList.map((r) => ({
          rencanaHasilKerja: r.rencanaHasilKerja,
          indikator: r.indikator.filter(Boolean),
          target: r.target,
          satuan: r.satuan,
        })),
      };
      const skp = await createSKP(payload);
      navigate(`/kinerja/skp/${skp.id}`);
    } catch (e: any) {
      setError(e?.response?.data?.error ?? 'Gagal membuat SKP');
    } finally { setLoading(false); }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <button onClick={() => navigate('/kinerja/skp')} className="text-sm text-slate-500 hover:text-blue-600 mb-4">← Kembali</button>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-blue-900 text-white px-6 py-4">
          <h1 className="font-bold text-lg">Formulir Penyusunan SKP Baru</h1>
          <p className="text-xs text-blue-200 mt-0.5">Isi parameter, data pegawai, dan rencana hasil kerja</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">{error}</div>}

          {/* Parameter SKP */}
          <section>
            <div className="bg-blue-900 text-white text-sm font-semibold px-4 py-2 rounded-t-lg">📋 Parameter SKP</div>
            <div className="border border-slate-200 border-t-0 rounded-b-lg p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-[11px] text-slate-500 block mb-1">Tahun SKP</label>
                <input type="number" value={form.tahun} onChange={(e) => setForm({ ...form, tahun: Number(e.target.value) })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-[11px] text-slate-500 block mb-1">Periode Mulai</label>
                <input type="date" value={form.periodeMulai} onChange={(e) => setForm({ ...form, periodeMulai: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-[11px] text-slate-500 block mb-1">Periode Selesai</label>
                <input type="date" value={form.periodeSelesai} onChange={(e) => setForm({ ...form, periodeSelesai: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
              </div>
            </div>
          </section>

          {/* Data Pegawai + Atasan */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <section>
              <div className="bg-blue-900 text-white text-sm font-semibold px-4 py-2 rounded-t-lg">👤 Data Pegawai</div>
              <div className="border border-slate-200 border-t-0 rounded-b-lg p-4 space-y-3">
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">Jabatan</label>
                  <input type="text" value={form.jabatan} onChange={(e) => setForm({ ...form, jabatan: e.target.value })}
                    placeholder="Jabatan Anda" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">Unit Kerja</label>
                  <input type="text" value={form.unitKerja} onChange={(e) => setForm({ ...form, unitKerja: e.target.value })}
                    placeholder="Unit kerja Anda" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>
            </section>

            <section>
              <div className="bg-blue-900 text-white text-sm font-semibold px-4 py-2 rounded-t-lg">👔 Atasan Langsung</div>
              <div className="border border-slate-200 border-t-0 rounded-b-lg p-4 space-y-3">
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">Nama Atasan</label>
                  <input type="text" value={form.atasanNama} onChange={(e) => setForm({ ...form, atasanNama: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">NIP Atasan</label>
                  <input type="text" value={form.atasanNip} onChange={(e) => setForm({ ...form, atasanNip: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">Jabatan Atasan</label>
                  <input type="text" value={form.atasanJabatan} onChange={(e) => setForm({ ...form, atasanJabatan: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>
            </section>
          </div>

          {/* Pejabat Penandatangan */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <section>
              <div className="bg-blue-900 text-white text-sm font-semibold px-4 py-2 rounded-t-lg">✍️ Pejabat Penandatangan SKP</div>
              <div className="border border-slate-200 border-t-0 rounded-b-lg p-4 space-y-3">
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">Nama Pejabat</label>
                  <input type="text" value={form.pejabatNama} onChange={(e) => setForm({ ...form, pejabatNama: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">NIP Pejabat</label>
                  <input type="text" value={form.pejabatNip} onChange={(e) => setForm({ ...form, pejabatNip: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>
            </section>

            <section>
              <div className="bg-blue-900 text-white text-sm font-semibold px-4 py-2 rounded-t-lg">👤 Atasan Pejabat Penandatangan</div>
              <div className="border border-slate-200 border-t-0 rounded-b-lg p-4 space-y-3">
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">Jabatan Pejabat</label>
                  <input type="text" value={form.pejabatJabatan} onChange={(e) => setForm({ ...form, pejabatJabatan: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>
            </section>
          </div>

          {/* RHK List */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <div className="bg-blue-900 text-white text-sm font-semibold px-4 py-2 rounded-t-lg flex-1">
                🎯 Rencana Hasil Kerja (RHK)
              </div>
            </div>
            <div className="space-y-3">
              {rhkList.map((r, i) => (
                <div key={i} className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-700">RHK #{i + 1}</span>
                    {rhkList.length > 1 && (
                      <button type="button" onClick={() => removeRHK(i)}
                        className="text-xs text-red-500 hover:underline">Hapus</button>
                    )}
                  </div>
                  <textarea
                    value={r.rencanaHasilKerja}
                    onChange={(e) => updateRHK(i, 'rencanaHasilKerja', e.target.value)}
                    placeholder="Rencana hasil kerja..."
                    rows={2}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm mb-3 resize-none"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[10px] text-slate-500 block mb-1">Indikator (pisahkan dengan koma)</label>
                      <input
                        type="text"
                        value={r.indikator.join(', ')}
                        onChange={(e) => updateRHK(i, 'indikator', e.target.value.split(',').map((s) => s.trim()))}
                        placeholder="Indikator kinerja"
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 block mb-1">Target</label>
                      <input type="text" value={r.target} onChange={(e) => updateRHK(i, 'target', e.target.value)}
                        placeholder="Target" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs" />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 block mb-1">Satuan</label>
                      <input type="text" value={r.satuan} onChange={(e) => updateRHK(i, 'satuan', e.target.value)}
                        placeholder="%" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs" />
                    </div>
                  </div>
                </div>
              ))}
              <button type="button" onClick={addRHK}
                className="w-full border-2 border-dashed border-slate-300 text-slate-500 hover:border-orange-400 hover:text-orange-600 py-3 rounded-lg text-sm font-medium transition">
                + Tambah RHK
              </button>
            </div>
          </section>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button type="button" onClick={() => navigate('/kinerja/skp')}
              className="px-5 py-2.5 text-sm rounded-lg border border-slate-300 hover:bg-slate-50">
              Batal
            </button>
            <button type="submit" disabled={loading}
              className="px-5 py-2.5 text-sm rounded-lg bg-orange-500 hover:bg-orange-600 disabled:bg-slate-300 text-white font-medium">
              {loading ? 'Menyimpan...' : 'Simpan sebagai Draft'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}