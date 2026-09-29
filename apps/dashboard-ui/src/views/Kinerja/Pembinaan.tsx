import { useEffect, useState } from 'react';
import {
  getPembinaanList, getPembinaanStats, createPembinaan, updatePembinaan,
  PembinaanKinerja, PembinaanStats,
} from '../../api/pembinaan';
import Modal from '../../components/Modal';
import PembinaanIllustration from './PembinaanIllustration';

const STATUS_STYLES: Record<string, string> = {
  'Terjadwal': 'bg-yellow-100 text-yellow-700',
  'Berlangsung': 'bg-blue-100 text-blue-700',
  'Selesai': 'bg-green-500 text-white',
};

const TEKNIK_STYLES: Record<string, string> = {
  'Mentoring/Training': 'bg-red-500 text-white',
  'Coaching': 'bg-amber-500 text-white',
  'Directing': 'bg-rose-600 text-white',
  'Counseling/Motivating': 'bg-red-800 text-white',
};

export default function Pembinaan() {
  const [tab, setTab] = useState<'Bimbingan' | 'Konseling'>('Bimbingan');
  const [year, setYear] = useState(new Date().getFullYear());
  const [items, setItems] = useState<PembinaanKinerja[]>([]);
  const [stats, setStats] = useState<PembinaanStats | null>(null);
  const [loading, setLoading] = useState(true);

  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState<any>({
    tipe: 'Bimbingan', teknik: 'Coaching',
    rencanaHasilKerja: '', periode: '',
    tanggal: new Date().toISOString().slice(0, 10),
    catatan: '', status: 'Terjadwal',
  });
  const [submitting, setSubmitting] = useState(false);
  const [detail, setDetail] = useState<PembinaanKinerja | null>(null);

  const load = () => {
    setLoading(true);
    Promise.all([getPembinaanList({ tahun: String(year), tipe: tab }), getPembinaanStats()])
      .then(([list, s]) => { setItems(list); setStats(s); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, [tab, year]);

  const openNew = () => {
    setForm({
      tipe: tab,
      teknik: tab === 'Bimbingan' ? 'Coaching' : 'Counseling/Motivating',
      rencanaHasilKerja: '',
      periode: `${year}-01-01 s/d ${year}-12-31`,
      tanggal: new Date().toISOString().slice(0, 10),
      catatan: '',
      status: 'Terjadwal',
    });
    setShowNew(true);
  };

  const handleCreate = async () => {
    if (!form.rencanaHasilKerja || !form.periode) return;
    setSubmitting(true);
    try {
      await createPembinaan({ ...form, tahun: year });
      setShowNew(false);
      load();
    } finally { setSubmitting(false); }
  };

  const handleSelesai = async (id: string) => {
    if (!confirm('Tandai sesi ini sebagai Selesai?')) return;
    await updatePembinaan(id, { status: 'Selesai' });
    load();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header with Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden mb-4">
        <div className="grid grid-cols-2">
          <button
            onClick={() => setTab('Bimbingan')}
            className={`py-4 text-sm font-bold tracking-wide transition border-b-4 ${
              tab === 'Bimbingan'
                ? 'bg-blue-900 text-white border-blue-900'
                : 'bg-blue-100 text-blue-800 border-transparent hover:bg-blue-200'
            }`}
          >
            BIMBINGAN KINERJA
          </button>
          <button
            onClick={() => setTab('Konseling')}
            className={`py-4 text-sm font-bold tracking-wide transition border-b-4 ${
              tab === 'Konseling'
                ? 'bg-blue-900 text-white border-blue-900'
                : 'bg-blue-100 text-blue-800 border-transparent hover:bg-blue-200'
            }`}
          >
            KONSELING KINERJA
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <h2 className="text-lg font-bold text-blue-900 mb-3">
            {tab === 'Bimbingan' ? 'Bimbingan Kinerja' : 'Konseling Kinerja'}
          </h2>
          <p className="text-sm text-slate-700 leading-relaxed mb-6">
            {tab === 'Bimbingan' ? (
              <>
                Teknik <strong>Coaching dan Mentoring</strong> dilakukan apabila terjadi{' '}
                <strong className="text-red-600">permasalahan</strong> dalam hal pencapaian{' '}
                <strong className="text-red-600">hasil kerja</strong>. Sedangkan Pembinaan kinerja dengan teknik konseling
                dilakukan khusus apabila terjadi <strong className="text-red-600">permasalahan perilaku</strong>. Seperti
                diilustrasikan dalam tabel berikut ini:
              </>
            ) : (
              <>
                Teknik <strong>Counseling dan Directing</strong> dilakukan untuk mengatasi{' '}
                <strong className="text-red-600">permasalahan perilaku</strong> pegawai, seperti disiplin,
                motivasi kerja, atau hubungan interpersonal di tempat kerja.
              </>
            )}
          </p>

          {/* Diagram + Illustration */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-center">
            {/* Kuadran - 3 cols */}
            <div className="lg:col-span-3 flex justify-center">
              <div className="relative" style={{ width: '360px', height: '260px' }}>
                <div className="absolute -left-8 top-0 bottom-0 flex items-center">
                  <span className="text-[10px] font-bold text-slate-600 -rotate-90 whitespace-nowrap">MOTIVASI</span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 text-center -mb-6">
                  <span className="text-[10px] font-bold text-slate-600">KNOWLEDGE / SKILLS</span>
                </div>
                <div className="grid grid-cols-2 grid-rows-2 h-full border border-slate-200">
                  <div className={`flex items-center justify-center p-4 text-center text-white font-semibold text-xs transition-all ${
                    tab === 'Bimbingan' ? 'bg-red-500 ring-4 ring-red-200 ring-inset' : 'bg-red-400 opacity-60'
                  }`}>
                    <p className="text-base font-bold">Mentoring /<br/>Training</p>
                  </div>
                  <div className={`flex items-center justify-center p-4 text-center text-white font-semibold text-xs transition-all ${
                    tab === 'Bimbingan' ? 'bg-amber-500 ring-4 ring-amber-200 ring-inset' : 'bg-amber-400 opacity-60'
                  }`}>
                    <p className="text-base font-bold">Coaching</p>
                  </div>
                  <div className={`flex items-center justify-center p-4 text-center text-white font-semibold text-xs transition-all ${
                    tab === 'Konseling' ? 'bg-rose-600 ring-4 ring-rose-200 ring-inset' : 'bg-rose-500 opacity-60'
                  }`}>
                    <p className="text-base font-bold">Directing</p>
                  </div>
                  <div className={`flex items-center justify-center p-4 text-center text-white font-semibold text-xs transition-all ${
                    tab === 'Konseling' ? 'bg-red-800 ring-4 ring-red-300 ring-inset' : 'bg-red-700 opacity-60'
                  }`}>
                    <p className="text-base font-bold">Counseling /<br/>Motivating</p>
                  </div>
                </div>
                <div className="absolute left-1/2 -translate-x-1/2 -top-2 text-slate-400 text-xs">&#9650;</div>
                <div className="absolute top-1/2 -translate-y-1/2 -right-2 text-slate-400 text-xs">&#9654;</div>
              </div>
            </div>

            {/* Illustration - 2 cols */}
            <div className="lg:col-span-2 bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl border border-slate-200 p-4 flex items-center justify-center min-h-[240px]">
              <PembinaanIllustration tipe={tab} />
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="bg-white rounded-xl border border-slate-200 p-3">
            <p className="text-[10px] text-slate-500 uppercase tracking-wide">Bimbingan</p>
            <p className="text-2xl font-bold text-blue-900 mt-1">{stats.bimbingan}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-3">
            <p className="text-[10px] text-slate-500 uppercase tracking-wide">Konseling</p>
            <p className="text-2xl font-bold text-red-700 mt-1">{stats.konseling}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-3">
            <p className="text-[10px] text-slate-500 uppercase tracking-wide">Selesai</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{stats.selesai}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-3">
            <p className="text-[10px] text-slate-500 uppercase tracking-wide">Terjadwal</p>
            <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.terjadwal}</p>
          </div>
        </div>
      )}

      {/* Filter + Add */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <label className="text-xs font-medium text-slate-600">Tahun SKP:</label>
          <select value={year} onChange={(e) => setYear(Number(e.target.value))}
            className="text-xs border border-slate-300 rounded-lg px-3 py-1.5 font-medium">
            {[2026, 2025, 2024].map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <button onClick={openNew}
          className="bg-orange-500 hover:bg-orange-600 text-white text-xs px-4 py-2 rounded-lg font-medium">
          + TAMBAH {tab.toUpperCase()} KINERJA
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-blue-900 text-white">
              <tr>
                <th className="px-3 py-3 text-left w-12">No</th>
                <th className="px-3 py-3 text-left">Pegawai</th>
                <th className="px-3 py-3 text-left">Teknik</th>
                <th className="px-3 py-3 text-left">Rencana Hasil Kerja</th>
                <th className="px-3 py-3 text-left w-32">Periode</th>
                <th className="px-3 py-3 text-center w-24">Status</th>
                <th className="px-3 py-3 text-center w-24">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="py-8 text-center text-slate-400">Memuat...</td></tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <p className="text-sm text-slate-500">Belum ada data {tab.toLowerCase()} untuk tahun {year}</p>
                    <p className="text-xs text-slate-400 mt-1">Klik tombol "+ TAMBAH {tab.toUpperCase()} KINERJA" untuk membuat sesi baru</p>
                  </td>
                </tr>
              ) : (
                items.map((p, i) => (
                  <tr key={p.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="px-3 py-3 text-slate-500">{i + 1}</td>
                    <td className="px-3 py-3">
                      <p className="font-medium text-slate-800">{p.pembinaNama ?? '-'}</p>
                      <p className="text-[10px] text-slate-500">{p.pembinaJabatan ?? '-'}</p>
                    </td>
                    <td className="px-3 py-3">
                      {p.teknik ? (
                        <span className={`text-[10px] px-2 py-1 rounded font-bold ${TEKNIK_STYLES[p.teknik] ?? 'bg-slate-100 text-slate-700'}`}>
                          {p.teknik}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="px-3 py-3 text-slate-700 max-w-[300px]">{p.rencanaHasilKerja}</td>
                    <td className="px-3 py-3 text-[10px] text-slate-500">{p.periode}</td>
                    <td className="px-3 py-3 text-center">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${STATUS_STYLES[p.status] ?? 'bg-slate-100'}`}>
                        {p.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <div className="flex gap-1 justify-center">
                        <button onClick={() => setDetail(p)}
                          className="text-[10px] bg-blue-500 hover:bg-blue-600 text-white px-2.5 py-1 rounded font-medium">
                          Detail
                        </button>
                        {p.status !== 'Selesai' && (
                          <button onClick={() => handleSelesai(p.id)}
                            className="text-[10px] bg-green-500 hover:bg-green-600 text-white px-2.5 py-1 rounded font-medium">
                            Selesai
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal new */}
      <Modal open={showNew} onClose={() => setShowNew(false)} title={`Tambah ${tab} Kinerja`}>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          <div>
            <label className="text-xs font-medium text-slate-700 mb-1 block">Tipe</label>
            <select value={form.tipe} onChange={(e) => setForm({ ...form, tipe: e.target.value })}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm">
              <option value="Bimbingan">Bimbingan Kinerja</option>
              <option value="Konseling">Konseling Kinerja</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-700 mb-1 block">Teknik</label>
            <select value={form.teknik} onChange={(e) => setForm({ ...form, teknik: e.target.value })}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm">
              {form.tipe === 'Bimbingan' ? (
                <>
                  <option value="Mentoring/Training">Mentoring / Training</option>
                  <option value="Coaching">Coaching</option>
                </>
              ) : (
                <>
                  <option value="Directing">Directing</option>
                  <option value="Counseling/Motivating">Counseling / Motivating</option>
                </>
              )}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-700 mb-1 block">Rencana Hasil Kerja (RHK)</label>
            <textarea value={form.rencanaHasilKerja}
              onChange={(e) => setForm({ ...form, rencanaHasilKerja: e.target.value })}
              rows={2} placeholder="RHK terkait pembinaan ini..."
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-700 mb-1 block">Periode</label>
            <input type="text" value={form.periode}
              onChange={(e) => setForm({ ...form, periode: e.target.value })}
              placeholder={`${year}-01-01 s/d ${year}-12-31`}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-700 mb-1 block">Tanggal Sesi</label>
            <input type="date" value={form.tanggal}
              onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-700 mb-1 block">Catatan (opsional)</label>
            <textarea value={form.catatan}
              onChange={(e) => setForm({ ...form, catatan: e.target.value })}
              rows={3} placeholder="Catatan sesi pembinaan..."
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none" />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-slate-100">
          <button onClick={() => setShowNew(false)} className="px-4 py-2 text-sm rounded-lg border border-slate-300">
            Batal
          </button>
          <button onClick={handleCreate} disabled={submitting || !form.rencanaHasilKerja}
            className="px-4 py-2 text-sm rounded-lg bg-orange-500 hover:bg-orange-600 disabled:bg-slate-300 text-white font-medium">
            {submitting ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </Modal>

      {/* Modal detail */}
      <Modal open={!!detail} onClose={() => setDetail(null)} title="Detail Pembinaan Kinerja">
        {detail && (
          <div className="space-y-3 text-sm">
            <div className="flex gap-2">
              <span className={`text-[10px] px-2 py-1 rounded font-bold ${
                detail.tipe === 'Bimbingan' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
              }`}>{detail.tipe}</span>
              {detail.teknik && (
                <span className={`text-[10px] px-2 py-1 rounded font-bold ${TEKNIK_STYLES[detail.teknik] ?? 'bg-slate-100'}`}>
                  {detail.teknik}
                </span>
              )}
              <span className={`text-[10px] px-2 py-1 rounded font-bold ml-auto ${STATUS_STYLES[detail.status]}`}>
                {detail.status}
              </span>
            </div>
            <div>
              <p className="text-xs text-slate-500">Pembina</p>
              <p className="font-medium">{detail.pembinaNama ?? '-'}</p>
              <p className="text-[10px] text-slate-500">{detail.pembinaJabatan ?? '-'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">RHK Terkait</p>
              <p className="font-medium">{detail.rencanaHasilKerja}</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-xs text-slate-500">Periode</p>
                <p>{detail.periode}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Tanggal Sesi</p>
                <p>{new Date(detail.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
            </div>
            {detail.catatan && (
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-500 mb-1">Catatan</p>
                <p className="text-sm text-slate-700 italic">"{detail.catatan}"</p>
              </div>
            )}
            {detail.hasil && (
              <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                <p className="text-xs text-green-700 font-medium mb-1">Hasil</p>
                <p className="text-sm text-green-800">{detail.hasil}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}