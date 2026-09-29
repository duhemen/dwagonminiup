import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding E-Kinerja extensions...');

  const emen = await prisma.user.findUnique({ where: { email: 'emen@dwagon.id' } });
  if (!emen) { console.log('User not found'); return; }

  const year = new Date().getFullYear();

  // ---- SKPDocument ----
  const exDoc = await prisma.sKPDocument.count({ where: { userId: emen.id } });
  if (exDoc === 0) {
    const docs = [
      { kategori: 'Perencanaan', title: 'SKP Perencanaan 2026', fileName: 'SKP-Perencanaan-2026.pdf', fileSize: '245 KB' },
      { kategori: 'Perencanaan', title: 'Matriks Peran dan Hasil', fileName: 'Matriks-Peran-Hasil-2026.pdf', fileSize: '178 KB' },
      { kategori: 'Perencanaan', title: 'Lampiran SKP 2026', fileName: 'Lampiran-SKP-2026.pdf', fileSize: '98 KB' },
      { kategori: 'Pelaksanaan', subKategori: 'Tw1', title: 'Rencana Aksi Triwulan I', fileName: 'Rencana-Aksi-Tw1.pdf', fileSize: '156 KB' },
      { kategori: 'Pelaksanaan', subKategori: 'Tw2', title: 'Rencana Aksi Triwulan II', fileName: 'Rencana-Aksi-Tw2.pdf', fileSize: '162 KB' },
      { kategori: 'Evaluasi', subKategori: 'Tw1', title: 'Form Evaluasi Triwulan 1', fileName: 'Form-Eval-Tw1.pdf', fileSize: '112 KB' },
      { kategori: 'Evaluasi', subKategori: 'Tw1', title: 'Dokumen Evaluasi Triwulan 1', fileName: 'Dok-Eval-Tw1.pdf', fileSize: '234 KB' },
      { kategori: 'Evaluasi', subKategori: 'Tw2', title: 'Form Evaluasi Triwulan 2', fileName: 'Form-Eval-Tw2.pdf', fileSize: '115 KB' },
      { kategori: 'Evaluasi', subKategori: 'Tw2', title: 'Dokumen Evaluasi Triwulan 2', fileName: 'Dok-Eval-Tw2.pdf', fileSize: '238 KB' },
    ];
    for (const d of docs) {
      await prisma.sKPDocument.create({
        data: { userId: emen.id, ...d, status: 'Tersedia' },
      });
    }
    console.log(`  SKPDocument: ${docs.length}`);
  } else { console.log(`  SKPDocument: skipped`); }

  // ---- HKPengajuan ----
  const exHK = await prisma.hKPengajuan.count({ where: { userId: emen.id } });
  if (exHK === 0) {
    await prisma.hKPengajuan.create({
      data: {
        userId: emen.id, tahun: year, periode: '01-01 s/d 31-12',
        alasan: 'Nilai kinerja triwulan 2 belum sesuai dengan capaian yang dilaporkan. Mohon ditinjau kembali.',
        kategori: 'Nilai Tidak Sesuai', status: 'Diajukan',
        submittedAt: new Date(),
        region: 'jawa',
      },
    });
    await prisma.hKPengajuan.create({
      data: {
        userId: emen.id, tahun: year - 1, periode: '01-10 s/d 31-12',
        alasan: 'Keterlambatan penilaian SKP triwulan 4.',
        kategori: 'Keterlambatan', status: 'Selesai',
        tanggapan: 'Penilaian telah diselesaikan pada 15 Januari 2026.',
        catatanAtasan: 'Mohon maaf atas keterlambatan.',
        submittedAt: new Date('2025-12-15'),
        resolvedAt: new Date('2026-01-15'),
        region: 'jawa',
      },
    });
    console.log(`  HKPengajuan: 2`);
  } else { console.log(`  HKPengajuan: skipped`); }

  // ---- TTEDocument ----
  const exTte = await prisma.tTEDocument.count({ where: { userId: emen.id } });
  if (exTte === 0) {
    await prisma.tTEDocument.create({
      data: {
        userId: emen.id, fileName: 'SKP-Perencanaan-2026.pdf', fileSize: '245 KB',
        status: 'Signed', mode: 'single', certificate: 'BSrE-2026-A1B2C3D4',
        signedAt: new Date(), docHash: 'a1b2c3d4e5f6...',
        region: 'jawa',
      },
    });
    console.log(`  TTEDocument: 1`);
  } else { console.log(`  TTEDocument: skipped`); }

  // ---- PengaturanAtasan ----
  const exPa = await prisma.pengaturanAtasan.count({ where: { userId: emen.id } });
  if (exPa === 0) {
    await prisma.pengaturanAtasan.create({
      data: {
        userId: emen.id, tahun: year,
        periode: `${year}-01-01 s/d ${year}-12-31`,
        jabatan: 'Analis Sistem Informasi',
        unitKerja: 'Pusat Data dan Teknologi Informasi',
        atasanNama: 'Kalimadun Ns.T., M.Kom.', atasanNip: '198505152010011001', atasanJabatan: 'Kepala Bidang',
        pejabatNama: 'Dr. Ir. Bambang Sutrisno, M.T.', pejabatNip: '197505201999031001', pejabatJabatan: 'Kepala Pusat',
        pejabatTtdNama: 'Dr. Ir. Bambang Sutrisno, M.T.', pejabatTtdNip: '197505201999031001', pejabatTtdJabatan: 'Kepala Pusat',
      },
    });
    await prisma.pengaturanAtasan.create({
      data: {
        userId: emen.id, tahun: year - 1,
        periode: `${year-1}-10-01 s/d ${year-1}-12-31`,
        jabatan: 'Analis Sistem Informasi',
        unitKerja: 'Pusat Data dan Teknologi Informasi',
        atasanNama: 'Kalimadun Ns.T., M.Kom.', atasanNip: '198505152010011001', atasanJabatan: 'Kepala Bidang',
      },
    });
    console.log(`  PengaturanAtasan: 2`);
  } else { console.log(`  PengaturanAtasan: skipped`); }

  // ---- DownloadDoc ----
  const exDl = await prisma.downloadDoc.count();
  if (exDl === 0) {
    const docs = [
      { title: 'Panduan E-KINERJA MENPANRB No.6 Tahun 2022', category: 'Panduan', fileName: 'Panduan-Ekinerja-2022.pdf', fileSize: '1.2 MB', year: 2022 },
      { title: 'Form Excel SKP 2023', category: 'Form', fileName: 'Form-SKP-2023.xlsx', fileSize: '245 KB', year: 2023 },
      { title: 'Form Excel SKP TUGAS BELAJAR 2023', category: 'Form', fileName: 'Form-SKP-TB-2023.xlsx', fileSize: '238 KB', year: 2023 },
      { title: 'Form Excel SKP CPNS 2023', category: 'Form', fileName: 'Form-SKP-CPNS-2023.xlsx', fileSize: '232 KB', year: 2023 },
      { title: 'Form Penyampaian Penilaian SKP 2023 JPT Madya ke Menteri', category: 'Form', fileName: 'Form-JPT-Madya-2023.pdf', fileSize: '178 KB', year: 2023 },
      { title: 'SE PUPR No.08 Tahun 2024 - Pengelolaan Kinerja Pegawai ASN', category: 'Peraturan', fileName: 'SE-PUPR-08-2024.pdf', fileSize: '892 KB', year: 2024 },
      { title: 'Panduan Penilaian Perilaku Kerja 2025', category: 'Panduan', fileName: 'Panduan-Perilaku-2025.pdf', fileSize: '1.5 MB', year: 2025 },
      { title: 'Panduan Penyusunan SKP CPNS 2025', category: 'Panduan', fileName: 'Panduan-CPNS-2025.pdf', fileSize: '1.1 MB', year: 2025 },
      { title: 'Panduan Penyusunan SKP JAF 2025', category: 'Panduan', fileName: 'Panduan-JAF-2025.pdf', fileSize: '1.3 MB', year: 2025 },
    ];
    for (const d of docs) {
      await prisma.downloadDoc.create({ data: { ...d, views: Math.floor(Math.random() * 500) + 50, downloads: Math.floor(Math.random() * 200) + 20 } });
    }
    console.log(`  DownloadDoc: ${docs.length}`);
  } else { console.log(`  DownloadDoc: skipped`); }

  // ---- VideoTutorial ----
  const exVid = await prisma.videoTutorial.count();
  if (exVid === 0) {
    const vids = [
      { title: 'Video Tutorial Penilaian Perilaku BerAKHLAK 2025', youtubeId: 'dQw4w9WgXcQ', duration: '12:34', order: 1, views: 342 },
      { title: 'Video Tutorial Penyusunan SKP CPNS 2025', youtubeId: 'dQw4w9WgXcQ', duration: '15:20', order: 2, views: 456 },
      { title: 'Video Tutorial Penyusunan SKP JA/FJ 2025', youtubeId: 'dQw4w9WgXcQ', duration: '18:45', order: 3, views: 234 },
      { title: 'Tutorial Tagging Ulang RHK Atasan Baru', youtubeId: 'dQw4w9WgXcQ', duration: '08:12', order: 4, views: 178 },
    ];
    for (const v of vids) {
      await prisma.videoTutorial.create({ data: { ...v, category: 'Tutorial' } });
    }
    console.log(`  VideoTutorial: ${vids.length}`);
  } else { console.log(`  VideoTutorial: skipped`); }

  console.log('Seeding selesai!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });