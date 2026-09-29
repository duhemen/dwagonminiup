import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';

const karya = [
  { judul: 'Sistem Monitoring IoT', jenis: 'Inovasi', tahun: 2026 },
  { judul: 'Jurnal AI Terapan', jenis: 'Publikasi', tahun: 2025 },
  { judul: 'Aplikasi Mobile Layanan', jenis: 'Produk', tahun: 2026 },
  { judul: 'Dashboard Analitik Publik', jenis: 'Inovasi', tahun: 2026 },
];

export default function Karya() {
  return (
    <div>
      <PageHeader title="Karya" subtitle="Inovasi, karya ilmiah & publikasi" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Karya" value={24} />
        <StatCard label="Publikasi" value={12} />
        <StatCard label="Inovasi" value={8} />
        <StatCard label="Poin Karya" value={480} trend="+40 bulan ini" />
      </div>
      <div className="bg-white rounded-xl shadow p-4 border">
        <h2 className="font-semibold mb-3">Daftar Karya</h2>
        <ul className="space-y-2">
          {karya.map((k) => (
            <li key={k.judul} className="flex justify-between items-center border-b last:border-0 py-2">
              <div>
                <p className="font-medium">{k.judul}</p>
                <p className="text-xs text-gray-500">{k.jenis} - {k.tahun}</p>
              </div>
              <button className="text-xs text-blue-600 hover:underline">Lihat</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}