import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';

const pelatihan = [
  { nama: 'Kepemimpinan Dasar', tanggal: '10 Okt 2026', status: 'Terdaftar' },
  { nama: 'Data Analytics', tanggal: '15 Okt 2026', status: 'Selesai' },
  { nama: 'Public Speaking', tanggal: '20 Okt 2026', status: 'Menunggu' },
];

export default function Karir() {
  return (
    <div>
      <PageHeader title="Karir" subtitle="Pengembangan karir & kompetensi" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Level Saat Ini" value="III-B" />
        <StatCard label="Poin Kompetensi" value={185} trend="+12 bulan ini" />
        <StatCard label="Pelatihan" value="12/15" />
        <StatCard label="Next Assessment" value="Q4 2026" />
      </div>
      <div className="bg-white rounded-xl shadow p-4 border">
        <h2 className="font-semibold mb-3">Jadwal Pelatihan</h2>
        <table className="w-full text-sm">
          <thead className="text-left text-gray-500 border-b">
            <tr>
              <th className="py-2">Nama Pelatihan</th>
              <th>Tanggal</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {pelatihan.map((p) => (
              <tr key={p.nama} className="border-b last:border-0">
                <td className="py-2 font-medium">{p.nama}</td>
                <td>{p.tanggal}</td>
                <td>
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    p.status === 'Selesai' ? 'bg-green-100 text-green-700'
                    : p.status === 'Terdaftar' ? 'bg-blue-100 text-blue-700'
                    : 'bg-yellow-100 text-yellow-700'
                  }`}>{p.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}