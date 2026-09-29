import { useState } from 'react';
import Modal from '../../components/Modal';
import ApprovalBadge from '../../components/ApprovalBadge';
import { UsulanApproval, decideApproval, STAGE_LABELS } from '../../api/approval';

interface Props {
  usulan: UsulanApproval | null;
  myStage: string;
  onClose: () => void;
  onDone: () => void;
}

function toLabel(status: string): 'Menunggu' | 'Disetujui' | 'Ditolak' | 'Belum' {
  if (status === 'menunggu') return 'Menunggu';
  if (status === 'disetujui') return 'Disetujui';
  if (status === 'ditolak') return 'Ditolak';
  return 'Belum';
}

export default function ApprovalModal({ usulan, myStage, onClose, onDone }: Props) {
  const [action, setAction] = useState<'setujui' | 'tolak' | null>(null);
  const [catatan, setCatatan] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!usulan) return null;

  const myApproval = usulan.approvals.find((a) => a.stage === myStage);
  const isPending = myApproval?.status === 'menunggu';

  const handleSubmit = async () => {
    if (!action) return;
    if (action === 'tolak' && !catatan.trim()) {
      setError('Catatan wajib diisi saat menolak usulan');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await decideApproval(usulan.id, myStage, action, catatan || undefined);
      onDone();
      onClose();
    } catch (e: any) {
      setError(e?.response?.data?.error ?? e?.message ?? 'Gagal memproses approval');
    } finally {
      setLoading(false);
    }
  };

  const stages = ['pimpinan', 'upt', 'kepegawaian'];

  return (
    <Modal open={!!usulan} onClose={onClose} title="Detail Usulan">
      <div className="space-y-4 text-sm max-h-[70vh] overflow-y-auto pr-1">
        {/* Info Pelatihan */}
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
          <p className="text-[10px] text-slate-500 uppercase tracking-wide">Pelatihan</p>
          <p className="font-semibold text-slate-800 mt-0.5">{usulan.pelatihan.nama}</p>
          <p className="text-xs text-slate-500 mt-0.5">
            {usulan.pelatihan.kategori} · {usulan.pelatihan.jp} JP · {usulan.pelatihan.penyelenggara}
          </p>
        </div>

        {/* Info Pemohon */}
        <div className="border border-slate-200 rounded-lg p-3">
          <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-2">Pemohon</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <p className="text-slate-400">Nama</p>
              <p className="font-medium">{usulan.user.name}</p>
            </div>
            <div>
              <p className="text-slate-400">NIP</p>
              <p className="font-medium">{usulan.user.nip ?? '-'}</p>
            </div>
            <div className="col-span-2">
              <p className="text-slate-400">Jabatan</p>
              <p className="font-medium">{usulan.user.jabatan ?? '-'}</p>
            </div>
            <div className="col-span-2">
              <p className="text-slate-400">Unit Kerja</p>
              <p className="font-medium">{usulan.user.unitKerja ?? '-'}</p>
            </div>
          </div>
        </div>

        {/* Riwayat Approval */}
        <div className="border border-slate-200 rounded-lg p-3">
          <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-2">Status Approval</p>
          <div className="space-y-2">
            {stages.map((stage) => {
              const ap = usulan.approvals.find((a) => a.stage === stage);
              const isMine = stage === myStage;
              return (
                <div
                  key={stage}
                  className={`flex items-start justify-between py-2 border-b last:border-0 ${
                    isMine ? 'bg-blue-50 -mx-3 px-3 rounded' : ''
                  }`}
                >
                  <div className="flex-1">
                    <p className="text-xs font-medium text-slate-700">
                      {STAGE_LABELS[stage]}
                      {isMine && <span className="ml-2 text-[9px] bg-blue-600 text-white px-1.5 py-0.5 rounded">Tahap Anda</span>}
                    </p>
                    {ap?.catatan && (
                      <p className="text-[10px] text-slate-500 italic mt-0.5">"{ap.catatan}"</p>
                    )}
                    {ap?.decidedAt && (
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {new Date(ap.decidedAt).toLocaleString('id-ID')}
                      </p>
                    )}
                  </div>
                  <ApprovalBadge status={toLabel(ap?.status ?? 'belum')} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Form */}
        {isPending && (
          <div className="border-2 border-dashed border-blue-200 rounded-lg p-3">
            <p className="text-xs font-medium text-slate-700 mb-2">Tindakan Anda</p>
            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={() => setAction('setujui')}
                className={`flex-1 py-2 text-xs rounded-lg border transition ${
                  action === 'setujui'
                    ? 'bg-green-600 text-white border-green-600'
                    : 'bg-white text-green-700 border-green-300 hover:bg-green-50'
                }`}
              >
                ✓ Setujui
              </button>
              <button
                type="button"
                onClick={() => setAction('tolak')}
                className={`flex-1 py-2 text-xs rounded-lg border transition ${
                  action === 'tolak'
                    ? 'bg-red-600 text-white border-red-600'
                    : 'bg-white text-red-700 border-red-300 hover:bg-red-50'
                }`}
              >
                ✕ Tolak
              </button>
            </div>

            {action && (
              <>
                <label className="block text-[11px] text-slate-500 mb-1">
                  Catatan {action === 'tolak' && <span className="text-red-500">*wajib</span>}
                  {action === 'setujui' && <span className="text-slate-400">(opsional)</span>}
                </label>
                <textarea
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  rows={3}
                  placeholder={action === 'tolak' ? 'Alasan penolakan...' : 'Catatan tambahan (opsional)'}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </>
            )}

            {error && (
              <div className="mt-2 bg-red-50 border border-red-200 text-red-700 rounded p-2 text-xs">{error}</div>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-slate-100">
        <button
          onClick={onClose}
          disabled={loading}
          className="px-4 py-2 text-sm rounded-lg border border-slate-300 hover:bg-slate-100 disabled:opacity-50"
        >
          Tutup
        </button>
        {isPending && action && (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`px-4 py-2 text-sm rounded-lg text-white disabled:opacity-50 ${
              action === 'setujui' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {loading ? 'Memproses...' : action === 'setujui' ? 'Setujui Usulan' : 'Tolak Usulan'}
          </button>
        )}
      </div>
    </Modal>
  );
}