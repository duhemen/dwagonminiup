import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Pembinaan Kinerja...');

  const emen = await prisma.user.findUnique({ where: { email: 'emen@dwagon.id' } });
  const pimpinan = await prisma.user.findUnique({ where: { email: 'pimpinan@dwagon.id' } });
  if (!emen || !pimpinan) { console.log('Users not found'); return; }

  const existing = await prisma.pembinaanKinerja.count({ where: { userId: emen.id } });
  if (existing > 0) { console.log(`  Skipped (${existing} exist)`); return; }

  const year = new Date().getFullYear();

  const records = [
    {
      tipe: 'Bimbingan',
      teknik: 'Coaching',
      rencanaHasilKerja: 'Tersusunnya Laporan Kinerja Bulanan Tepat Waktu',
      periode: `${year}-01-01 s/d ${year}-03-31`,
      tanggal: new Date(`${year}-02-15`),
      catatan: 'Bimbingan terkait proses penyusunan laporan bulanan menggunakan template baru.',
      hasil: 'Pegawai memahami alur penyusunan laporan dan mampu menyelesaikan laporan lebih cepat.',
      tindakLanjut: 'Monitoring setiap akhir bulan.',
      status: 'Selesai',
    },
    {
      tipe: 'Bimbingan',
      teknik: 'Mentoring/Training',
      rencanaHasilKerja: 'Terlaksananya Digitalisasi Dokumen Kepegawaian',
      periode: `${year}-01-01 s/d ${year}-06-30`,
      tanggal: new Date(`${year}-04-10`),
      catatan: 'Mentoring penggunaan scanner dan aplikasi arsip digital.',
      hasil: 'Pegawai mampu melakukan digitalisasi dokumen secara mandiri dengan kualitas baik.',
      status: 'Berlangsung',
    },
    {
      tipe: 'Konseling',
      teknik: 'Counseling/Motivating',
      rencanaHasilKerja: 'Terkelolanya arsip dengan baik sesuai standar pengelolaan arsip',
      periode: `${year}-01-01 s/d ${year}-12-31`,
      tanggal: new Date(`${year}-05-20`),
      catatan: 'Sesi konseling terkait beban kerja dan manajemen waktu.',
      status: 'Selesai',
      hasil: 'Pegawai merasa lebih termotivasi dan memiliki rencana kerja yang lebih terstruktur.',
    },
    {
      tipe: 'Konseling',
      teknik: 'Directing',
      rencanaHasilKerja: 'Terpenuhinya Pengembangan Kompetensi Diri',
      periode: `${year}-01-01 s/d ${year}-12-31`,
      tanggal: new Date(`${year}-06-15`),
      catatan: 'Diskusi rencana pengembangan kompetensi tahun berikutnya.',
      status: 'Terjadwal',
    },
  ];

  for (const r of records) {
    await prisma.pembinaanKinerja.create({
      data: {
        userId: emen.id,
        pembinaId: pimpinan.id,
        pembinaNama: pimpinan.name,
        pembinaJabatan: pimpinan.jabatan,
        tahun: year,
        region: 'jawa',
        ...r,
      },
    });
  }

  console.log(`  PembinaanKinerja: ${records.length}`);
  console.log('Seeding selesai!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });