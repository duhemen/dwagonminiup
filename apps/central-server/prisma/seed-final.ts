import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Final Sprint 19.9-19.12...');
  const emen = await prisma.user.findUnique({ where: { email: 'emen@dwagon.id' } });
  if (!emen) return;

  // ---- RekapKompetensi ----
  const exRekap = await prisma.rekapKompetensi.count({ where: { userId: emen.id } });
  if (exRekap === 0) {
    const rows = [
      { uraian: 'Webinar Series Kepatuhan Intern dan Tata Kelola Bina Konstruksi (KITABina)', sumberData: 'BPSDM', tglMulai: '2026-05-12', tglSelesai: '2026-05-12', jumlahJP: 3, noSertifikat: '17142/STF/KI/2026', lokasi: 'Jakarta', tahun: 2026 },
      { uraian: 'Manajemen Talenta', sumberData: 'EHRM', tglMulai: '2026-03-27', tglSelesai: '2026-03-27', jumlahJP: 2, noSertifikat: '8764463616MV/KMS/KRX/2025', lokasi: 'Online', tahun: 2026 },
      { uraian: 'Penghargaan PPPK', sumberData: 'EHRM', tglMulai: '2026-03-26', tglSelesai: '2026-03-26', jumlahJP: 2, noSertifikat: '2202329470MN/KMS/KRX/2025', lokasi: 'Online', tahun: 2026 },
      { uraian: 'Pengadaan PPPK', sumberData: 'EHRM', tglMulai: '2026-03-26', tglSelesai: '2026-03-26', jumlahJP: 2, noSertifikat: '5463616426M7/KMS/KRX/2025', lokasi: 'Online', tahun: 2026 },
      { uraian: 'Penggajian dan Tunjangan PPPK', sumberData: 'EHRM', tglMulai: '2026-03-26', tglSelesai: '2026-03-26', jumlahJP: 2, noSertifikat: '1385748299MY/KMS/KRX/2025', lokasi: 'Denpasar', tahun: 2026 },
      { uraian: 'KORPRI', sumberData: 'EHRM', tglMulai: '2026-03-27', tglSelesai: '2026-03-27', jumlahJP: 2, noSertifikat: '9406321203MD/KMS/KRX/2025', lokasi: 'Denpasar', tahun: 2026 },
      { uraian: 'E-learning #JadiPaham Gratifikasi Itu Bukan Rezeki', sumberData: 'EHRM', tglMulai: '2025-12-25', tglSelesai: '2025-12-25', jumlahJP: 2, noSertifikat: 'E-LRN/2025/GRF-128', lokasi: 'Jakarta', tahun: 2025 },
    ];
    for (const r of rows) {
      await prisma.rekapKompetensi.create({
        data: {
          userId: emen.id,
          uraian: r.uraian,
          sumberData: r.sumberData,
          tglMulai: new Date(r.tglMulai),
          tglSelesai: new Date(r.tglSelesai),
          jumlahJP: r.jumlahJP,
          noSertifikat: r.noSertifikat,
          lokasi: r.lokasi,
          tahun: r.tahun,
          region: 'jawa',
        },
      });
    }
    console.log(`  RekapKompetensi: ${rows.length}`);
  } else { console.log(`  RekapKompetensi: skipped`); }

  // ---- Karyasiswa ----
  const exKary = await prisma.karyasiswa.count({ where: { userId: emen.id } });
  if (exKary === 0) {
    const items = [
      { program: 'Magister Teknik Informatika', universitas: 'Institut Teknologi Bandung', jenjang: 'S2', lokasiStudi: 'Bandung', tanggalPengajuan: '2026-08-15', status: 'Disetujui', tahunAkademik: 2026, durasi: '2 tahun', catatan: 'Rekomendasi disetujui untuk semester ganjil 2026/2027.', isBeasiswa: true, pengirim: 'Admin Unit Organisasi' },
      { program: 'Short Course Data Science', universitas: 'National University of Singapore', jenjang: 'Non-Gelar', lokasiStudi: 'Singapore', tanggalPengajuan: '2026-09-10', status: 'Menunggu Validasi', tahunAkademik: 2026, durasi: '3 bulan', catatan: '', isBeasiswa: true, pengirim: 'Admin Unit Organisasi' },
      { program: 'Doctor of Philosophy in Civil Engineering', universitas: 'University of Melbourne', jenjang: 'S3', lokasiStudi: 'Melbourne', tanggalPengajuan: '2026-07-01', status: 'Draft', tahunAkademik: 2027, durasi: '4 tahun', catatan: 'Persiapan dokumen LPDP.', isBeasiswa: false, pengirim: 'Admin Unit Organisasi' },
    ];
    for (const k of items) {
      await prisma.karyasiswa.create({
        data: { userId: emen.id, ...k, tanggalPengajuan: new Date(k.tanggalPengajuan), region: 'jawa' },
      });
    }
    console.log(`  Karyasiswa: ${items.length}`);
  } else { console.log(`  Karyasiswa: skipped`); }

  // ---- Venue ----
  const exVenue = await prisma.venue.count();
  if (exVenue === 0) {
    const venues = [
      { nama: 'Asrama Peserta Diklat', slug: 'asrama-peserta-diklat', tipe: 'Asrama', unitId: '344', kapasitas: 24, deskripsi: 'Asrama Peserta merupakan fasilitas hunian yang nyaman dengan kapasitas 2 orang per kamar, dirancang untuk mendukung kegiatan pelatihan dan pengembangan kompetensi pegawai.', harga: 'Gratis', fasilitas: ['AC', 'WiFi', 'Kamar Mandi Dalam', 'Meja Kerja'], lokasi: 'Gedung Asrama Lt.2' },
      { nama: 'R. Wawancara 32', slug: 'r-wawancara-32', tipe: 'Ruang Wawancara', unitId: '399', kapasitas: 2, deskripsi: 'Ruang ini adalah ruang khusus untuk interaksi terstruktur. Ruangan biasa digunakan untuk wawancara antara Asesor dengan Asesi.', harga: 'Gratis', fasilitas: ['AC', 'Meja', 'Recorder'], lokasi: 'Gedung Utama Lt.3' },
      { nama: 'R. Wawancara 31', slug: 'r-wawancara-31', tipe: 'Ruang Wawancara', unitId: '399', kapasitas: 2, deskripsi: 'Ruang ini adalah ruang khusus untuk interaksi terstruktur. Ruangan biasa digunakan untuk wawancara antara Asesor dengan Asesi.', harga: 'Gratis', fasilitas: ['AC', 'Meja', 'Recorder'], lokasi: 'Gedung Utama Lt.3' },
      { nama: 'Ruang Kelas A', slug: 'ruang-kelas-a', tipe: 'Ruang Kelas', unitId: '401', kapasitas: 40, deskripsi: 'Ruang kelas standar untuk pelatihan tatap muka dengan kapasitas 40 peserta.', harga: 'Gratis', fasilitas: ['AC', 'Proyektor', 'Whiteboard', 'Sound System'], lokasi: 'Gedung Diklat Lt.1' },
      { nama: 'Aula Serbaguna', slug: 'aula-serbaguna', tipe: 'Aula', unitId: '402', kapasitas: 200, deskripsi: 'Aula besar untuk seminar, konferensi, dan acara resmi lainnya.', harga: 'Gratis', fasilitas: ['AC', 'Proyektor', 'Sound System', 'Panggung'], lokasi: 'Gedung Utama Lt.1' },
    ];
    for (const v of venues) {
      await prisma.venue.create({ data: { ...v, region: 'jawa' } });
    }
    console.log(`  Venue: ${venues.length}`);
  } else { console.log(`  Venue: skipped`); }

  // ---- Ticket ----
  const exTicket = await prisma.ticket.count({ where: { userId: emen.id } });
  if (exTicket === 0) {
    const year = new Date().getFullYear();
    const tickets = [
      { ticketNo: `TKT-${year}-0001`, judul: 'Laptop tidak bisa connect ke WiFi kantor', kategori: 'Jaringan', deskripsi: 'Laptop saya tidak bisa connect ke WiFi PUPR-Office sejak pagi ini. Sudah restart tapi tetap tidak bisa.', prioritas: 'Normal', status: 'Selesai', resolvedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
      { ticketNo: `TKT-${year}-0002`, judul: 'Email tidak bisa kirim attachment', kategori: 'Email', deskripsi: 'Setiap kali kirim email dengan attachment >5MB, muncul error.', prioritas: 'Normal', status: 'Diproses' },
      { ticketNo: `TKT-${year}-0003`, judul: 'Akses SIMPEG ditolak', kategori: 'Aplikasi', deskripsi: 'Tidak bisa login ke SIMPEG dengan akun NIP. Muncul "user not authorized".', prioritas: 'Tinggi', status: 'Terbuka' },
      { ticketNo: `TKT-${year}-0004`, judul: 'Printer lantai 3 error paper jam', kategori: 'Hardware', deskripsi: 'Printer HP LaserJet lantai 3 selalu paper jam setiap print.', prioritas: 'Rendah', status: 'Terbuka' },
    ];
    for (const t of tickets) {
      await prisma.ticket.create({ data: { userId: emen.id, ...t, region: 'jawa' } });
    }
    console.log(`  Ticket: ${tickets.length}`);
  } else { console.log(`  Ticket: skipped`); }

  console.log('Seeding selesai!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });