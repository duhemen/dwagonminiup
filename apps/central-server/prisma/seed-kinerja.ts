import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding E-Kinerja SKP...');

  const emen = await prisma.user.findUnique({ where: { email: 'emen@dwagon.id' } });
  if (!emen) { console.log('User not found'); return; }

  const existing = await prisma.sKP.count({ where: { userId: emen.id } });
  if (existing > 0) {
    console.log(`  SKP: skipped (${existing} exist)`);
    return;
  }

  // ============ SKP 2026 (aktif) ============
  const skp2026 = await prisma.sKP.create({
    data: {
      userId: emen.id,
      tahun: 2026,
      periodeMulai: new Date('2026-01-01'),
      periodeSelesai: new Date('2026-12-31'),
      jabatan: 'Analis Sistem Informasi',
      unitKerja: 'Pusat Data dan Teknologi Informasi',
      atasanNama: 'Kalimadun Ns.T., M.Kom.',
      atasanNip: '198505152010011001',
      atasanJabatan: 'Kepala Bidang',
      pejabatNama: 'Dr. Ir. Bambang Sutrisno, M.T.',
      pejabatNip: '197505201999031001',
      pejabatJabatan: 'Kepala Pusat Data dan Teknologi Informasi',
      status: 'Disetujui',
      region: 'jawa',
      rhkList: {
        create: [
          {
            urutan: 1,
            rencanaHasilKerja: 'Terkelolanya arsip dengan baik sesuai dengan standar pengelolaan arsip',
            indikator: ['Akurasi pengelolaan arsip 100%', 'Waktu penyelesaian ≤ 2 hari kerja'],
            target: '100',
            satuan: '%',
            cascading: 0,
          },
          {
            urutan: 2,
            rencanaHasilKerja: 'Terpenuhinya Pengembangan Kompetensi Diri',
            indikator: ['Jumlah JP minimal 20 JP/tahun', 'Sertifikat pelatihan minimal 2'],
            target: '20',
            satuan: 'JP',
            cascading: 0,
          },
          {
            urutan: 3,
            rencanaHasilKerja: 'Tersusunnya Laporan Kinerja Bulanan Tepat Waktu',
            indikator: ['Laporan diserahkan sebelum tanggal 5', 'Akurasi data 100%'],
            target: '12',
            satuan: 'laporan',
            cascading: 1,
          },
          {
            urutan: 4,
            rencanaHasilKerja: 'Terlaksananya Digitalisasi Dokumen Kepegawaian',
            indikator: ['Jumlah dokumen terdigitalisasi', 'Kualitas scan ≥ 300 DPI'],
            target: '500',
            satuan: 'dokumen',
            cascading: 2,
          },
        ],
      },
      evaluasi: {
        create: [
          { triwulan: 1, status: 'sudah', predikat: 'Baik', nilai: 87.5, dinilaiOleh: 'Kalimadun Ns.T., M.Kom.', dinilaiAt: new Date('2026-04-15'), catatan: 'Kinerja memuaskan, pertahankan.' },
          { triwulan: 2, status: 'sudah', predikat: 'Baik', nilai: 88.2, dinilaiOleh: 'Kalimadun Ns.T., M.Kom.', dinilaiAt: new Date('2026-07-20'), catatan: 'Konsisten dengan capaian triwulan 1.' },
          { triwulan: 3, status: 'belum' },
          { triwulan: 4, status: 'belum' },
        ],
      },
    },
  });
  console.log(`  SKP 2026: ${skp2026.id}`);

  // ============ SKP 2025 (selesai) ============
  const skp2025 = await prisma.sKP.create({
    data: {
      userId: emen.id,
      tahun: 2025,
      periodeMulai: new Date('2025-10-01'),
      periodeSelesai: new Date('2025-12-31'),
      jabatan: 'Analis Sistem Informasi',
      unitKerja: 'Pusat Data dan Teknologi Informasi',
      atasanNama: 'Kalimadun Ns.T., M.Kom.',
      atasanNip: '198505152010011001',
      atasanJabatan: 'Kepala Bidang',
      pejabatNama: 'Dr. Ir. Bambang Sutrisno, M.T.',
      pejabatNip: '197505201999031001',
      pejabatJabatan: 'Kepala Pusat Data dan Teknologi Informasi',
      status: 'Disetujui',
      predikatAkhir: 'Baik',
      region: 'jawa',
      rhkList: {
        create: [
          {
            urutan: 1,
            rencanaHasilKerja: 'Terkelolanya infrastruktur jaringan kantor',
            indikator: ['Uptime jaringan ≥ 99%', 'Response time ≤ 24 jam'],
            target: '99',
            satuan: '%',
          },
          {
            urutan: 2,
            rencanaHasilKerja: 'Terlaksananya maintenance sistem informasi',
            indikator: ['Jadwal maintenance terlaksana 100%', 'Downtime minimal'],
            target: '100',
            satuan: '%',
          },
        ],
      },
      evaluasi: {
        create: [
          { triwulan: 1, status: 'belum' },
          { triwulan: 2, status: 'belum' },
          { triwulan: 3, status: 'belum' },
          { triwulan: 4, status: 'sudah', predikat: 'Baik', nilai: 88.0, dinilaiOleh: 'Kalimadun Ns.T., M.Kom.', dinilaiAt: new Date('2026-01-15'), catatan: 'Capaian sesuai target.' },
        ],
      },
    },
  });
  console.log(`  SKP 2025: ${skp2025.id}`);

  console.log('Seeding selesai!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });