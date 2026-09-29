import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';

const dokumen = [
  { nama: 'Dokumen Mutu', status: 'Lengkap', skor: 95 },
  { nama: 'Evaluasi Diri', status: 'Revisi', skor: 78 },
  { nama: 'Bukti Kinerja', status: 'Lengkap', skor: 88 },
  { nama: 'Rencana Tindak', status: 'Pending', skor: 60 },
];

export default function Akreditasi() {
  return (
    <div>
      <PageHeader title="Akreditasi" subtitle="Status & dokumen akreditasi instansi" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Peringkat" value="A" />
        <StatCard label="Skor Total" value={92} />
        <StatCard label="Dokumen" value="45/50" />
        <StatCard label="Deadline" value="30 Hari" />
      </div>
      <div className="bg-white rounded-xl shadow p-4 border">
        <h2 className="font-semibold mb-3">Checklist Dokumen</h2>
        <ul className="space-y-2">
          {dokumen.map((d) => (
            <li key={d.nama} className="flex justify-between items-center border-b last:border-0 py-2">
              <span className="font-medium">{d.nama}</span>
              <div className="flex items-center gap-3">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${d.skor}%` }} />
                </div>
                <span className="text-xs text-gray-600 w-10">{d.skor}%</span>
                <span className={`text-xs px-2 py-0.5 rounded ${
                  d.status === 'Lengkap' ? 'bg-green-100 text-green-700'
                  : d.status === 'Revisi' ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-gray-100 text-gray-700'
                }`}>{d.status}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}