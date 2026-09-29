import { UsulanApproval, STAGE_LABELS } from '../../api/approval';

interface Props {
  usulan: UsulanApproval;
  myStage: string;
  onClick: () => void;
}

export default function ApprovalCard({ usulan, myStage, onClick }: Props) {
  const myApproval = usulan.approvals.find((a) => a.stage === myStage);
  const statusColor = {
    menunggu: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    disetujui: 'bg-green-100 text-green-700 border-green-300',
    ditolak: 'bg-red-100 text-red-700 border-red-300',
    belum: 'bg-slate-100 text-slate-500 border-slate-300',
  }[myApproval?.status ?? 'belum'];

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md hover:border-blue-300 transition"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <span className="text-[10px] font-mono text-slate-400">
            #{usulan.id.substring(0, 8).toUpperCase()}
          </span>
          <h3 className="font-semibold text-slate-800 mt-1">{usulan.pelatihan.nama}</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {usulan.pelatihan.kategori} · {usulan.pelatihan.jp} JP
          </p>
        </div>
        <span className={`text-[10px] px-2 py-0.5 rounded border whitespace-nowrap ${statusColor}`}>
          {myApproval?.status ?? 'belum'}
        </span>
      </div>

      <div className="bg-slate-50 rounded-lg p-3 mb-3">
        <p className="text-xs font-medium text-slate-700">{usulan.user.name}</p>
        <p className="text-[10px] text-slate-500">
          {usulan.user.nip ?? '-'} · {usulan.user.unitKerja ?? '-'}
        </p>
      </div>

      <div className="flex items-center justify-between text-[10px] text-slate-400">
        <span>Diajukan {new Date(usulan.tanggal).toLocaleDateString('id-ID')}</span>
        <span className="text-blue-600 font-medium group-hover:underline">
          Lihat Detail →
        </span>
      </div>
    </button>
  );
}