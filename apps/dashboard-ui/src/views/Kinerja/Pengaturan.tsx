import { useEffect, useState } from 'react';
import { getPengaturan, savePengaturan, deletePengaturan, PengaturanAtasan } from '../../api/kinerja-ext';
import Modal from '../../components/Modal';

export default function Pengaturan() {
  const [items, setItems] = useState<PengaturanAtasan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [edit, setEdit] = useState<PengaturanAtasan | null>(null);
  const [form, setForm] = useState<any>({
    tahun: new Date().getFullYear(),
    periode: '',
    jabatan: '',
    unitKerja: '',
    atasanNama: '', atasanNip: '', atasanJabatan: '',
    pejabatNama: '', pejabatNip: '', pejabatJabatan: '',
    pejabatTtdNama: '', pejabatTtdNip: '', pejabatTtdJabatan: '',
  });
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    getPengaturan().then(setItems).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const openForm = (item?: PengaturanAtasan) => {
    if (item) {
      setEdit(item);
      setForm({ ...item });
    } else {
      setEdit(null);
      setForm({ tahun: new Date().getFullYear(), periode: '', jabatan: '', unitKerja: '', atasanNama: '', atasanNip: '', atasanJabatan: '', pejabatNama: '', pejabatNip: '', pejabatJabatan: '', pejabatTtdNama: '', pejabatTtdNip: '', pejabatTtdJabatan: '' });
    }
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.tahun) return;
    setSaving(true);
    try {
      await savePengaturan(form);
      setShowForm(false);
      load();
    } catch (e: any) { alert(e?.response?.data?.error ?? 'Gagal'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus pengaturan ini?')) return;
    await deletePengaturan(id); load();
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden mb-4">
        <div className="bg-blue-900 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-bold text-lg">⚙️ Pengaturan Atasan & Pejabat Penandatangan</h1>
            <p className="text-xs text-blue-200 mt-0.5">Kelola dan sesuaikan pejabat penilai maupun penandatangan SKP Anda</p>
          </div>
          <button onClick={() => openForm()}
            className="text-xs bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium">
            + Tambah Pengaturan
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 py-12 text-center text-slate-500">Memuat...</div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 py-12 text-center">
          <p className="text-4xl mb-3 opacity-30">⚙️</p>
          <p className="text-slate-500">Belum ada pengaturan</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-blue-900 text-white">
                <tr>
                  <th className="px-3 py-3 text-left">No</th>
                  <th className="px-3 py-3 text-left">Jabatan & Periode</th>
                  <th className="px-3 py-3 text-left">Unit Kerja</th>
                  <th className="px-3 py-3 text-center">Tahun</th>
                  <th className="px-3 py-3 text-left">Atasan Langsung</th>
                  <th className="px-3 py-3 text-left">Pejabat TTD</th>
                  <th className="px-3 py-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {items.map((p, i) => (
                  <tr key={p.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-3 py-3 text-slate-500">{i + 1}</td>
                    <td className="px-3 py-3">
                      <p className="font-medium text-slate-800">{p.jabatan}</p>
                      <p className="text-[10px] text-slate-500">{p.periode}</p>
                    </td>
                    <td className="px-3 py-3 text-slate-600">{p.unitKerja}</td>
                    <td className="px-3 py-3 text-center font-medium">{p.tahun}</td>
                    <td className="px-3 py-3">
                      {p.atasanNama ? (
                        <>
                          <p className="text-slate-800">{p.atasanNama}</p>
                          <p className="text-[10px] text-slate-500">{p.atasanJabatan}</p>
                        </>
                      ) : <span className="text-slate-300">-</span>}
                    </td>
                    <td className="px-3 py-3">
                      {p.pejabatTtdNama ? (
                        <>
                          <p className="text-slate-800">{p.pejabatTtdNama}</p>
                          <p className="text-[10px] text-slate-500">{p.pejabatTtdJabatan}</p>
                        </>
                      ) : <span className="text-slate-300">-</span>}
                    </td>
                    <td className="px-3 py-3 text-center">
                      <div className="flex gap-1 justify-center">
                        <button onClick={() => openForm(p)}
                          className="text-[10px] bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded font-medium">
                          ✏️ Ubah
                        </button>
                        <button onClick={() => handleDelete(p.id)}
                          className="text-[10px] bg-red-50 hover:bg-red-100 text-red-600 px-2 py-1.5 rounded">
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title={edit ? 'Edit Pengaturan' : 'Tambah Pengaturan'}>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-700 mb-1 block">Tahun</label>
              <input type="number" value={form.tahun} onChange={(e) => setForm({ ...form, tahun: Number(e.target.value) })}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 mb-1 block">Periode</label>
              <input type="text" value={form.periode} onChange={(e) => setForm({ ...form, periode: e.target.value })}
                placeholder="01-01 s/d 31-12" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-700 mb-1 block">Jabatan</label>
              <input type="text" value={form.jabatan} onChange={(e) => setForm({ ...form, jabatan: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 mb-1 block">Unit Kerja</label>
              <input type="text" value={form.unitKerja} onChange={(e) => setForm({ ...form, unitKerja: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="border-t border-slate-100 pt-3">
            <p className="text-xs font-bold text-slate-700 mb-2">👔 Atasan Langsung</p>
            <input type="text" value={form.atasanNama} onChange={(e) => setForm({ ...form, atasanNama: e.target.value })} placeholder="Nama"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mb-2" />
            <input type="text" value={form.atasanNip} onChange={(e) => setForm({ ...form, atasanNip: e.target.value })} placeholder="NIP"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mb-2" />
            <input type="text" value={form.atasanJabatan} onChange={(e) => setForm({ ...form, atasanJabatan: e.target.value })} placeholder="Jabatan"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div className="border-t border-slate-100 pt-3">
            <p className="text-xs font-bold text-slate-700 mb-2">✍️ Pejabat TTD</p>
            <input type="text" value={form.pejabatTtdNama} onChange={(e) => setForm({ ...form, pejabatTtdNama: e.target.value })} placeholder="Nama"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mb-2" />
            <input type="text" value={form.pejabatTtdNip} onChange={(e) => setForm({ ...form, pejabatTtdNip: e.target.value })} placeholder="NIP"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mb-2" />
            <input type="text" value={form.pejabatTtdJabatan} onChange={(e) => setForm({ ...form, pejabatTtdJabatan: e.target.value })} placeholder="Jabatan"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-slate-100">
          <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm rounded-lg border border-slate-300">Batal</button>
          <button onClick={handleSave} disabled={saving}
            className="px-4 py-2 text-sm rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-medium">
            {saving ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </Modal>
    </div>
  );
}