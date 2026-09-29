import { useEffect, useState } from 'react';
import TopBar from '../../components/TopBar';
import { getVenues, createBooking, Venue } from '../../api/final-batch';
import Modal from '../../components/Modal';

const TIPE_FILTERS = ['Semua', 'Asrama', 'Ruang Kelas', 'Ruang Wawancara', 'Aula'];

const TIPE_ICON: Record<string, string> = {
  'Asrama': '🏨', 'Ruang Kelas': '🎓', 'Ruang Wawancara': '💼', 'Aula': '🏛️',
};

export default function Spasi() {
  const [tipe, setTipe] = useState('Semua');
  const [items, setItems] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Venue | null>(null);
  const [booking, setBooking] = useState({ tanggalMulai: '', tanggalSelesai: '', keperluan: '', jumlahOrang: 1 });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    getVenues(tipe).then(setItems).catch(() => {}).finally(() => setLoading(false));
  }, [tipe]);

  const handleBooking = async () => {
    if (!selected || !booking.tanggalMulai || !booking.keberluan || !booking.keperluan) return;
    setSubmitting(true);
    try {
      await createBooking({ venueId: selected.id, ...booking });
      setSelected(null);
      setBooking({ tanggalMulai: '', tanggalSelesai: '', keperluan: '', jumlahOrang: 1 });
      alert('Booking berhasil diajukan!');
    } catch (e: any) {
      alert(e?.response?.data?.error ?? 'Gagal booking');
    } finally { setSubmitting(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <TopBar title="SPASI" variant="blue" />

      {/* Hero */}
      <div className="relative h-64 bg-gradient-to-br from-slate-800 via-slate-900 to-black overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 30% 40%, rgba(59,130,246,0.5), transparent 40%)' }} />
        <div className="relative z-10 text-center text-white px-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Temukan Ruangan Ideal untuk Kebutuhan Anda</h1>
          <p className="text-sm text-white/80 max-w-2xl mx-auto">
            Sistem Peminjaman Aset dan Sarana Instansi BPSDM PU menyediakan berbagai pilihan kelas, ruang rapat, dan asrama berkualitas
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {TIPE_FILTERS.map((t) => (
            <button key={t} onClick={() => setTipe(t)}
              className={`px-4 py-2 text-xs font-medium rounded-full transition ${
                tipe === t ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300'
              }`}>{TIPE_ICON[t] ?? ''} {t}</button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="text-center py-12 text-slate-500">Memuat...</div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 py-16 text-center">
            <p className="text-4xl mb-3 opacity-30">🏢</p>
            <p className="text-slate-500">Belum ada venue</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map((v) => (
              <div key={v.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition">
                <div className="aspect-[16/10] bg-gradient-to-br from-slate-700 to-slate-900 relative flex items-center justify-center">
                  <span className="text-6xl opacity-40">{TIPE_ICON[v.tipe] ?? '🏢'}</span>
                  <span className="absolute top-3 left-3 text-[10px] bg-white/90 text-slate-700 px-2 py-1 rounded font-medium">{v.tipe}</span>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-slate-800 text-sm mb-1">{v.nama}</h3>
                  <p className="text-[10px] text-slate-500 mb-2">Unit ID: {v.unitId}</p>
                  <p className="text-xs text-slate-600 line-clamp-3 mb-3">{v.deskripsi}</p>
                  <div className="flex items-center justify-between mb-3 text-[10px] text-slate-500">
                    <span>Kapasitas: {v.kapasitas} orang</span>
                    <span className="text-green-600 font-bold">{v.harga}</span>
                  </div>
                  <button onClick={() => setSelected(v)}
                    className="w-full bg-blue-900 hover:bg-blue-800 text-white text-xs py-2 rounded-lg font-medium">
                    Booking Sekarang
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={!!selected} onClose={() => setSelected(null)} title={`Booking: ${selected?.nama}`}>
        {selected && (
          <div className="space-y-3">
            <div className="bg-blue-50 rounded-lg p-3 text-xs text-blue-700">
              {TIPE_ICON[selected.tipe]} {selected.tipe} · Kapasitas {selected.kapasitas} orang · {selected.harga}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-700 mb-1 block">Tanggal Mulai</label>
                <input type="date" value={booking.tanggalMulai} onChange={(e) => setBooking({ ...booking, tanggalMulai: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700 mb-1 block">Tanggal Selesai</label>
                <input type="date" value={booking.tanggalSelesai} onChange={(e) => setBooking({ ...booking, tanggalSelesai: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 mb-1 block">Jumlah Orang</label>
              <input type="number" value={booking.jumlahOrang} onChange={(e) => setBooking({ ...booking, jumlahOrang: Number(e.target.value) })}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 mb-1 block">Keperluan</label>
              <textarea value={booking.keperluan} onChange={(e) => setBooking({ ...booking, keperluan: e.target.value })}
                rows={3} placeholder="Keperluan booking..." className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none" />
            </div>
          </div>
        )}
        <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-slate-100">
          <button onClick={() => setSelected(null)} className="px-4 py-2 text-sm rounded-lg border border-slate-300">Batal</button>
          <button onClick={handleBooking} disabled={submitting || !booking.tanggalMulai || !booking.keperluan}
            className="px-4 py-2 text-sm rounded-lg bg-blue-900 hover:bg-blue-800 disabled:bg-slate-300 text-white font-medium">
            {submitting ? 'Memproses...' : 'Ajukan Booking'}
          </button>
        </div>
      </Modal>
    </div>
  );
}