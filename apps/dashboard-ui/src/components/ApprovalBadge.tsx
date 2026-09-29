interface ApprovalBadgeProps {
  status: 'Menunggu' | 'Disetujui' | 'Ditolak' | 'Belum';
}

export default function ApprovalBadge({ status }: ApprovalBadgeProps) {
  const colors: Record<string, string> = {
    Menunggu: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    Disetujui: 'bg-green-100 text-green-700 border-green-300',
    Ditolak: 'bg-red-100 text-red-700 border-red-300',
    Belum: 'bg-slate-100 text-slate-500 border-slate-300',
  };
  return (
    <span className={`inline-block px-2 py-0.5 text-xs rounded border ${colors[status]}`}>
      {status}
    </span>
  );
}