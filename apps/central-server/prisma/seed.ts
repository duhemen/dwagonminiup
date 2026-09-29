import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const DEMO_PASSWORD = 'demo123';

// ============ 8 KATEGORI KLOP ============
const CATEGORIES = [
  { slug: 'sumber-daya-air',              name: 'Sumber Daya Air',              icon: '💧', color: 'orange', order: 1, description: 'Informasi seputar pengelolaan sumber daya air' },
  { slug: 'bina-marga',                   name: 'Bina Marga',                   icon: '🛣️', color: 'orange', order: 2, description: 'Jalan, jembatan, dan infrastruktur jalan' },
  { slug: 'permukiman',                   name: 'Permukiman',                   icon: '🏘️', color: 'orange', order: 3, description: 'Pengembangan kawasan permukiman' },
  { slug: 'pembiayaan-infrastruktur',     name: 'Pembiayaan Infrastruktur',     icon: '💰', color: 'orange', order: 4, description: 'Skema pembiayaan proyek infrastruktur' },
  { slug: 'bina-konstruksi',              name: 'Bina Konstruksi',              icon: '🏗️', color: 'orange', order: 5, description: 'Pembinaan jasa konstruksi nasional' },
  { slug: 'prasarana-strategis',          name: 'Prasarana Strategis',          icon: '📦', color: 'orange', order: 6, description: 'Proyek prasarana strategis nasional' },
  { slug: 'pengembangan-infrastruktur-wilayah', name: 'Pengembangan Infrastruktur Wilayah', icon: '🏙️', color: 'orange', order: 7, description: 'Pengembangan infrastruktur berbasis wilayah' },
  { slug: 'manajemen',                    name: 'Manajemen',                    icon: '⚙️', color: 'orange', order: 8, description: 'Manajemen organisasi dan SDM' },
];

// ============ 15 KNOWLEDGE ITEMS ============
const KNOWLEDGE_TEMPLATE = [
  { title: 'Panduan Teknis Penyusunan Soal Ujian e-Learning', type: 'Dokumen', categorySlug: 'manajemen', tags: ['Panduan', 'E-Learning', 'Ujian'], views: 28, likes: 1, comments: 0 },
  { title: 'Panduan Teknis Penyusunan Video e-Learning', type: 'Dokumen', categorySlug: 'manajemen', tags: ['Panduan', 'Video', 'E-Learning'], views: 26, likes: 1, comments: 0 },
  { title: 'Panduan Teknis Penyusunan Bahan Tayang e-Learning', type: 'Dokumen', categorySlug: 'manajemen', tags: ['Panduan', 'Bahan Tayang', 'E-Learning'], views: 14, likes: 0, comments: 0 },
  { title: 'Panduan Teknis Penyusunan Modul e-Learning', type: 'Dokumen', categorySlug: 'manajemen', tags: ['Panduan', 'Modul', 'E-Learning'], views: 10, likes: 0, comments: 0 },
  { title: 'Pengelolaan Sumber Daya Air Terpadu di Wilayah Sungai', type: 'Dokumen', categorySlug: 'sumber-daya-air', tags: ['SDA', 'Wilayah Sungai', 'Pengelolaan'], views: 156, likes: 24, comments: 5 },
  { title: 'Standar Konstruksi Jalan dan Jembatan 2024', type: 'Dokumen', categorySlug: 'bina-marga', tags: ['Jalan', 'Jembatan', 'Standar'], views: 342, likes: 56, comments: 12 },
  { title: 'Tutorial Video: Perencanaan Pembangunan Permukiman', type: 'Video', categorySlug: 'permukiman', tags: ['Tutorial', 'Permukiman', 'Perencanaan'], views: 89, likes: 15, comments: 3 },
  { title: 'Skema KPBU untuk Proyek Infrastruktur', type: 'Dokumen', categorySlug: 'pembiayaan-infrastruktur', tags: ['KPBU', 'Pembiayaan', 'Infrastruktur'], views: 78, likes: 12, comments: 2 },
  { title: 'Webinar: Masa Depan Konstruksi Indonesia', type: 'YouTube', categorySlug: 'bina-konstruksi', tags: ['Webinar', 'Konstruksi', 'Masa Depan'], views: 234, likes: 42, comments: 8 },
  { title: 'Foto Dokumentasi Proyek Bendungan Strategis', type: 'Foto', categorySlug: 'prasarana-strategis', tags: ['Dokumentasi', 'Bendungan', 'Proyek'], views: 67, likes: 8, comments: 1 },
  { title: 'Masterplan Pengembangan Infrastruktur Wilayah 2025-2030', type: 'Dokumen', categorySlug: 'pengembangan-infrastruktur-wilayah', tags: ['Masterplan', 'Wilayah', 'RPJMN'], views: 198, likes: 34, comments: 6 },
  { title: 'Panduan Penilaian Kinerja Pegawai BerAKHLAK', type: 'Dokumen', categorySlug: 'manajemen', tags: ['Kinerja', 'BerAKHLAK', 'Penilaian'], views: 421, likes: 68, comments: 15 },
  { title: 'Tutorial: Membuat Laporan Proyek dengan Excel', type: 'Video', categorySlug: 'manajemen', tags: ['Tutorial', 'Excel', 'Laporan'], views: 156, likes: 28, comments: 4 },
  { title: 'E-Book: Rekayasa Gempa untuk Bangunan Gedung', type: 'Dokumen', categorySlug: 'bina-konstruksi', tags: ['E-Book', 'Gempa', 'Struktur'], views: 112, likes: 19, comments: 3 },
  { title: 'Infografis: Statistik Infrastruktur Indonesia 2025', type: 'Foto', categorySlug: 'pengembangan-infrastruktur-wilayah', tags: ['Infografis', 'Statistik', 'Indonesia'], views: 187, likes: 31, comments: 5 },
];

// ============ E-LEARNING CATEGORIES ============
const ELEARNING_CATS = [
  { slug: 'sumber-daya-air',   name: 'Sumber Daya Air',   icon: '💧', order: 1 },
  { slug: 'bina-marga',        name: 'Bina Marga',        icon: '🛣️', order: 2 },
  { slug: 'cipta-karya',       name: 'Cipta Karya',       icon: '🏘️', order: 3 },
  { slug: 'bina-konstruksi',   name: 'Bina Konstruksi',   icon: '🏗️', order: 4 },
  { slug: 'manajemen',         name: 'Manajemen',         icon: '⚙️', order: 5 },
  { slug: 'kepegawaian',       name: 'Kepegawaian',       icon: '👥', order: 6 },
  { slug: 'tata-kelola',       name: 'Tata Kelola',       icon: '📋', order: 7 },
  { slug: 'teknis-umum',       name: 'Teknis Umum',       icon: '🔧', order: 8 },
];

// ============ E-LEARNING COURSES ============
const COURSES = [
  // SUDAH BERAKHIR
  { title: 'Orientasi Pegawai Pemerintah dengan Perjanjian Kerja (PPPK)', categorySlug: 'kepegawaian', penyelenggara: 'Balai Pengembangan Kompetensi PU Wilayah VI Surabaya', type: 'Pelatihan Jarak Jauh (Distance Learning)', accessType: 'Terbuka', status: 'Sudah Berakhir', startDate: '2026-04-10', endDate: '2026-04-16', year: 2026, totalJP: 32, totalHours: 40, kuota: 100, enrolled: 87, rating: 4.7 },
  { title: 'Webinar Series KITABina - Menjaga Diri dari Perilaku Berisiko dengan Patuh Kode Etik, Kode Perilaku, dan Disiplin Pegawai', categorySlug: 'bina-konstruksi', penyelenggara: 'Direktorat Kepahaman Intern Direktorat Jenderal Bina Konstruksi', type: 'Seminar, Konferensi, Sarasehan', accessType: 'Terbuka', status: 'Sudah Berakhir', startDate: '2026-06-03', endDate: '2026-06-03', year: 2026, totalJP: 4, totalHours: 4, kuota: 200, enrolled: 156, rating: 4.8 },
  { title: 'Webinar Series Kepatuhan Intern dan Tata Kelola Bina Konstruksi (KITABina) dengan tema Membangun Ekosistem Anti Suap Melalui Penerapan Sistem Manajemen Anti Penyuapan (SMAP)', categorySlug: 'bina-konstruksi', penyelenggara: 'Direktorat Kepahaman Intern Direktorat Jenderal Bina Konstruksi', type: 'Seminar, Konferensi, Sarasehan', accessType: 'Terbuka', status: 'Sudah Berakhir', startDate: '2026-05-12', endDate: '2026-05-12', year: 2026, totalJP: 3, totalHours: 3, kuota: 200, enrolled: 178, rating: 4.9 },
  { title: 'Pelatihan Pengadaan Barang/Jasa Pemerintah Level Dasar', categorySlug: 'tata-kelola', penyelenggara: 'Lembaga Kebijakan Pengadaan Barang/Jasa Pemerintah', type: 'Pelatihan Teknis', accessType: 'Pengajuan', status: 'Sudah Berakhir', startDate: '2026-03-26', endDate: '2026-03-28', year: 2026, totalJP: 24, totalHours: 32, kuota: 50, enrolled: 48, rating: 4.6 },
  { title: 'Pelatihan Manajemen Talenta ASN', categorySlug: 'manajemen', penyelenggara: 'Lembaga Administrasi Negara', type: 'Blended Learning', accessType: 'Pengajuan', status: 'Sudah Berakhir', startDate: '2026-03-27', endDate: '2026-03-27', year: 2026, totalJP: 16, totalHours: 20, kuota: 40, enrolled: 38, rating: 4.7 },
  // DIBUKA
  { title: 'Spatial Corners PU Episode 09: Apa yang Tidak Terlihat di Peta? Menggali Pola dan Hubungan Data Spasial untuk Menentukan Prioritas Kawasan dengan QGIS (Edisi 2)', categorySlug: 'teknis-umum', penyelenggara: 'Kementerian Pekerjaan Umum', type: 'Seminar, Konferensi, Sarasehan', accessType: 'Terbuka', status: 'Dibuka', startDate: '2026-09-29', endDate: '2026-09-29', year: 2026, totalJP: 4, totalHours: 4, kuota: 500, enrolled: 234, rating: 4.8 },
  { title: 'Bimbingan Teknis Pencegahan dan Penanggulangan Dini Bencana Gempa Bumi dan Kebakaran', categorySlug: 'teknis-umum', penyelenggara: 'Badan Penanggulangan Bencana Daerah', type: 'Pelatihan Teknis', accessType: 'Terbuka', status: 'Dibuka', startDate: '2026-09-29', endDate: '2026-09-29', year: 2026, totalJP: 8, totalHours: 8, kuota: 100, enrolled: 45, rating: 4.5 },
  // DIMULAI
  { title: 'Tata Persuratan dan Kearsipan', categorySlug: 'tata-kelola', penyelenggara: 'BPSDM Kementerian PUPR', type: 'E-Learning', accessType: 'Pengajuan', status: 'Dimulai', startDate: '2026-09-28', endDate: '2026-10-02', year: 2026, totalJP: 16, totalHours: 16, kuota: 300, enrolled: 156, rating: 4.6 },
  { title: 'Manajemen Proyek Konstruksi dengan Microsoft Project', categorySlug: 'bina-konstruksi', penyelenggara: 'BPSDM Kementerian PUPR', type: 'E-Learning', accessType: 'Pengajuan', status: 'Dimulai', startDate: '2026-09-28', endDate: '2026-10-02', year: 2026, totalJP: 24, totalHours: 24, kuota: 200, enrolled: 123, rating: 4.7 },
  { title: 'Pelatihan E-Learning Pencegahan Korupsi untuk ASN', categorySlug: 'tata-kelola', penyelenggara: 'Komisi Pemberantasan Korupsi', type: 'E-Learning', accessType: 'Undangan', status: 'Dimulai', startDate: '2026-09-25', endDate: '2026-10-15', year: 2026, totalJP: 20, totalHours: 20, kuota: 1000, enrolled: 567, rating: 4.9 },
  // AKAN DATANG
  { title: 'Workshop Kepemimpinan Transformasional untuk Pejabat Struktural', categorySlug: 'manajemen', penyelenggara: 'Lembaga Administrasi Negara', type: 'Blended Learning', accessType: 'Pengajuan', status: 'Akan Datang', startDate: '2026-10-15', endDate: '2026-10-18', year: 2026, totalJP: 32, totalHours: 40, kuota: 40, enrolled: 12, rating: 0 },
  { title: 'Pelatihan Data Analytics untuk ASN dengan Python', categorySlug: 'teknis-umum', penyelenggara: 'Badan Siber dan Sandi Negara', type: 'Pelatihan Teknis', accessType: 'Pengajuan', status: 'Akan Datang', startDate: '2026-11-05', endDate: '2026-11-08', year: 2026, totalJP: 32, totalHours: 40, kuota: 30, enrolled: 8, rating: 0 },
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 80);
}

async function main() {
  console.log('Seeding database...');
  const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 10);

  // ---- USERS ----
  const users = [
    { email: 'emen@dwagon.id',         password: hashedPassword, name: 'Mashul Aditama Pradana, S.Kom.', nip: '199610112022031007', jabatan: 'Analis Sistem Informasi', unitKerja: 'Pusat Data dan Teknologi Informasi', pendidikan: 'S1 - Teknik Informatika', role: 'pegawai',     region: 'jawa', assignedRegion: 'jawa', regionLocked: false },
    { email: 'pimpinan@dwagon.id',     password: hashedPassword, name: 'Kalimadun Ns.T., M.Kom.',        nip: '198505152010011001', jabatan: 'Kepala Bidang',           unitKerja: 'Pusat Data dan Teknologi Informasi', pendidikan: 'S2 - Ilmu Komputer',    role: 'pimpinan',    region: 'jawa', assignedRegion: 'jawa', regionLocked: false },
    { email: 'upt@dwagon.id',          password: hashedPassword, name: 'Rina Kartika, S.Sos.',           nip: '198807202012022002', jabatan: 'Admin UPT',               unitKerja: 'Unit Pelaksana Teknis',              pendidikan: 'S1 - Administrasi Publik', role: 'upt',     region: 'jawa', assignedRegion: 'jawa', regionLocked: false },
    { email: 'kepegawaian@dwagon.id',  password: hashedPassword, name: 'Budi Santoso, S.H.',             nip: '198203102008011003', jabatan: 'Admin Kepegawaian',       unitKerja: 'Biro Kepegawaian',                    pendidikan: 'S1 - Hukum',            role: 'kepegawaian', region: 'jawa', assignedRegion: 'jawa', regionLocked: false },
  ];

  for (const u of users) {
    await prisma.user.upsert({ where: { email: u.email }, update: u, create: u });
  }
  console.log(`  Users: ${users.length}`);

  // ---- PELATIHAN ----
  const pelatihan = [
    { nama: 'Aparatur Sipil Negara (ASN) Berintegritas',       kategori: 'Pelatihan Teknis',  jp: 32, penyelenggara: 'BPSDM PU',        rating: 4.8, totalPeserta: 1240 },
    { nama: 'Manajemen Risiko Tingkat Dasar',                  kategori: 'E-Learning',         jp: 16, penyelenggara: 'LAN RI',          rating: 4.6, totalPeserta: 890 },
    { nama: 'Data Analytics untuk ASN',                        kategori: 'Pelatihan Teknis',  jp: 32, penyelenggara: 'BSSN',            rating: 4.9, totalPeserta: 340 },
    { nama: 'Public Speaking untuk Pejabat Publik',            kategori: 'Pelatihan di Kelas', jp: 16, penyelenggara: 'LAN RI',          rating: 4.7, totalPeserta: 560 },
    { nama: 'Kepemimpinan Transformasional',                   kategori: 'Blended Learning',   jp: 24, penyelenggara: 'BPSDM PU',        rating: 4.5, totalPeserta: 720 },
    { nama: 'Penyusunan Kebijakan Publik Berbasis Data',       kategori: 'Pelatihan Teknis',  jp: 40, penyelenggara: 'KemenPAN-RB',     rating: 4.8, totalPeserta: 280 },
    { nama: 'Coaching & Mentoring Fundamental',                kategori: 'Coaching',           jp: 24, penyelenggara: 'BPSDM PU',        rating: 4.7, totalPeserta: 420 },
    { nama: 'Patok Banding (Benchmarking) Pelayanan Publik',   kategori: 'Benchmarking',       jp: 40, penyelenggara: 'KemenPAN-RB',     rating: 4.9, totalPeserta: 180 },
    { nama: 'E-Learning Executive Workshop Manajemen Risiko',  kategori: 'E-Learning',         jp: 16, penyelenggara: 'LAN RI',          rating: 4.5, totalPeserta: 650 },
  ];

  for (const p of pelatihan) {
    const existing = await prisma.pelatihan.findFirst({ where: { nama: p.nama } });
    if (!existing) await prisma.pelatihan.create({ data: p });
  }
  console.log(`  Pelatihan: ${pelatihan.length}`);

  // ---- KNOWLEDGE CATEGORIES ----
  for (const c of CATEGORIES) {
    await prisma.knowledgeCategory.upsert({
      where: { slug: c.slug },
      update: { name: c.name, icon: c.icon, color: c.color, description: c.description, order: c.order },
      create: c,
    });
  }
  console.log(`  Knowledge Categories: ${CATEGORIES.length}`);

  // ---- KNOWLEDGE ITEMS ----
  const emen = await prisma.user.findUnique({ where: { email: 'emen@dwagon.id' } });
  const pimpinan = await prisma.user.findUnique({ where: { email: 'pimpinan@dwagon.id' } });

  if (emen && pimpinan) {
    const existingCount = await prisma.knowledgeItem.count();
    if (existingCount === 0) {
      for (const k of KNOWLEDGE_TEMPLATE) {
        const cat = await prisma.knowledgeCategory.findUnique({ where: { slug: k.categorySlug } });
        if (!cat) continue;

        const slug = slugify(k.title);
        await prisma.knowledgeItem.create({
          data: {
            title: k.title,
            slug,
            description: `Referensi lengkap dan terbaru untuk topik ${cat.name.toLowerCase()}. Disusun oleh tim ahli untuk kebutuhan operasional sehari-hari.`,
            content: `# ${k.title}\n\nDokumen ini merupakan referensi komprehensif untuk topik ${cat.name}. Silakan unduh lampiran untuk melihat isi lengkapnya.\n\n## Ruang Lingkup\n\n- Perencanaan\n- Pelaksanaan\n- Monitoring & Evaluasi\n\n## Manfaat\n\nMembantu pelaksanaan tugas dengan standar yang berlaku.`,
            type: k.type,
            categoryId: cat.id,
            authorId: Math.random() > 0.5 ? emen.id : pimpinan.id,
            thumbnail: null,
            tags: k.tags,
            views: k.views,
            likes: k.likes,
            commentsCount: k.comments,
            region: 'jawa',
            publishedAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
          },
        });
      }
      console.log(`  Knowledge Items: ${KNOWLEDGE_TEMPLATE.length}`);
    } else {
      console.log(`  Knowledge Items: skipped (${existingCount} already exist)`);
    }
  }

  // ---- ELEARNING CATEGORIES ----
  for (const c of ELEARNING_CATS) {
    await prisma.elearningCategory.upsert({
      where: { slug: c.slug },
      update: { name: c.name, icon: c.icon, order: c.order },
      create: c,
    });
  }
  console.log(`  Elearning Categories: ${ELEARNING_CATS.length}`);

  // ---- ELEARNING COURSES ----
  const existingCourses = await prisma.elearningCourse.count();
  if (existingCourses === 0) {
    for (const c of COURSES) {
      const cat = await prisma.elearningCategory.findUnique({ where: { slug: c.categorySlug } });
      if (!cat) continue;

      const slug = slugify(c.title);
      await prisma.elearningCourse.create({
        data: {
          title: c.title,
          slug,
          description: `Pelatihan ${c.type.toLowerCase()} yang diselenggarakan oleh ${c.penyelenggara}. Cocok untuk pengembangan kompetensi ASN di bidang ${cat.name}.`,
          categoryId: cat.id,
          penyelenggara: c.penyelenggara,
          type: c.type,
          accessType: c.accessType,
          status: c.status,
          poster: null,
          totalJP: c.totalJP,
          totalHours: c.totalHours,
          startDate: new Date(c.startDate),
          endDate: new Date(c.endDate),
          year: c.year,
          kuota: c.kuota,
          enrolled: c.enrolled,
          rating: c.rating,
          region: 'jawa',
        },
      });
    }
    console.log(`  Elearning Courses: ${COURSES.length}`);
  } else {
    console.log(`  Elearning Courses: skipped (${existingCourses} already exist)`);
  }

  // ---- SAMPLE ENROLLMENT untuk pegawai ----
  if (emen) {
    const existing = await prisma.elearningEnrollment.count({ where: { userId: emen.id } });
    if (existing === 0) {
      const sampleCourses = await prisma.elearningCourse.findMany({
        where: { status: { in: ['Dimulai', 'Sudah Berakhir'] } },
        take: 3,
      });
      for (let i = 0; i < sampleCourses.length; i++) {
        const progress = i === 0 ? 100 : i === 1 ? 45 : 0;
        await prisma.elearningEnrollment.create({
          data: {
            courseId: sampleCourses[i].id,
            userId: emen.id,
            progress,
            status: progress === 100 ? 'selesai' : 'aktif',
            score: progress === 100 ? 88.5 : null,
            hasCert: progress === 100,
            completedAt: progress === 100 ? new Date() : null,
          },
        });
      }
      console.log(`  Sample Enrollments: ${sampleCourses.length}`);
    }
  }

  console.log('Seeding selesai!');
  console.log('');
  console.log('  Login demo (password: ' + DEMO_PASSWORD + '):');
  users.forEach(u => console.log('    - ' + u.email + ' (' + u.role + ')'));
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });