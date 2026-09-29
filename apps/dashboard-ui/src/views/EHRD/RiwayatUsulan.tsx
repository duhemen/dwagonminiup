import { useState } from 'react';
import Modal from '../../components/Modal';
import ApprovalBadge from '../../components/ApprovalBadge';
import { Usulan } from '../../api/ehrd';

interface Props {
  usulan: Usulan[];
}

function statusToLabel(status: string): 'Menunggu' | 'Disetujui' | 'Ditolak' | 'Belum' {
  if (status === 'menunggu') return 'Menunggu';
  if (status === 'disetujui') return 'Disetujui';
  if (status === 'ditolak') return 'Ditolak';
  return 'Belum';
}

export default function RiwayatUsulan({ usulan }: Props) {
  const [detail, setDetail] = useState<Usulan | null>(null);

  if (usulan.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow border p-8 text-center text-slate-500 text-sm">
        Belum ada usulan pelatihan. Buka tab Kompetensi 10 untuk mulai mengusulkan.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow border p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="font-semibold text-slate-800">Riwayat Usulan Pelatihan</h2>
          <p className="text-xs text-slate-500">Total {usulan.length} usulan tersimpan di database.</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-slate-500 border-b">
            <tr>
              <th className="py-2">Tanggal</th>
              <th>Nama Pelatihan</th>
              <th>Pimpinan</th>
              <th>UPT</th>
              <th>Kepegawaian</th>
              <th className="text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {usulan.map((u) => {
              const ap = (stage: string) => u.approvals.find((a) => a.stage === stage);
              return (
                <tr key={u.id} className="border-b last:border-0 hover:bg-slate-50">
                  <td className="py-2 text-slate-600 text-xs">
                    {new Date(u.tanggal).toLocaleDateString('id-ID')}
                  </td>
                  <td className="font-medium">{u.pelatihan.nama}</td>
                  <td><ApprovalBadge status={statusToLabel(ap('pimpinan')?.status ?? 'belum')} /></td>
                  <td><ApprovalBadge status={statusToLabel(ap('upt')?.status ?? 'belum')} /></td>
                  <td><ApprovalBadge status={statusToLabel(ap('kepegawaian')?.status ?? 'belum')} /></td>
                  <td className="text-center">
                    <button
                      onClick={() => setDetail(u)}
                      className="text-blue-600 hover:underline text-xs"
                    >
                      Detail
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Modal open={!!detail} onClose={() => setDetail(null)} title="Detail Usulan">
        <div className="space-y-3 text-sm">
          <div>
            <p className="text-slate-500 text-xs">Nama Pelatihan</p>
            <p className="font-medium">{detail?.pelatihan.nama}</p>
          </div>
          <div>
            <p className="text-slate-500 text-xs">Kategori</p>
            <p>{detail?.pelatihan.kategori} · {detail?.pelatihan.jp} JP</p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <p className="text-slate-500 text-xs mb-1">Pimpinan</p>
              <ApprovalBadge status={statusToLabel(detail?.approvals.find((a) => a.stage === 'pimpinan')?.status ?? 'belum')} />
            </div>
            <div>
              <p className="text-slate-500 text-xs mb-1">UPT</p>
              <ApprovalBadge status={statusToLabel(detail?.approvals.find((a) => a.stage === 'upt')?.status ?? 'belum')} />
            </div>
            <div>
              <p className="text-slate-500 text-xs mb-1">Kepegawaian</p>
              <ApprovalBadge status={statusToLabel(detail?.approvals.find((a) => a.stage === 'kepegawaian')?.status ?? 'belum')} />
            </div>
          </div>
          {detail?.catatan && (
            <div className="bg-slate-50 rounded p-3 border">
              <p className="text-slate-500 text-xs mb-1">Catatan</p>
              <p className="text-sm italic">{detail.catatan}</p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}