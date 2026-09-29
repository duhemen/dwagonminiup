import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').slice(0, 80);
}

// ============ JURNAL DATA ============
const JURNALS = [
  { title: 'Jurnal Teknik Hidraulik', bidang: 'Sumber Daya Air', publisher: 'Pusat Litbang Sumber Daya Air', issn: '1907-1043', eissn: '2807-6556', coverColor: '#1e40af', year: 2024, volume: 'Vol. 15', edition: 'No. 1', frequency: 'Semesteran', articlesCount: 8, views: 1245, downloads: 342, description: 'Jurnal ilmiah bidang teknik hidraulik, hidrologi, dan rekayasa sumber daya air.' },
  { title: 'Jurnal Irigasi', bidang: 'Sumber Daya Air', publisher: 'Direktorat Irigasi dan Rawa', issn: '1907-1043', eissn: '2807-6556', coverColor: '#06b6d4', year: 2024, volume: 'Vol. 19', edition: 'No. 1', frequency: 'Semesteran', articlesCount: 6, views: 987, downloads: 234, description: 'Jurnal ilmiah bidang irigasi, drainase, dan pengelolaan air pertanian.' },
  { title: 'Jurnal Jalan - Jembatan', bidang: 'Bina Marga', publisher: 'Pusat Litbang Jalan dan Jembatan', issn: '2087-3516', eissn: '2807-6556', coverColor: '#facc15', year: 2023, volume: 'Vol. 40', edition: 'No. 2', frequency: 'Semesteran', articlesCount: 10, views: 1456, downloads: 456, description: 'Jurnal ilmiah bidang jalan, jembatan, dan teknologi bahan konstruksi jalan.' },
  { title: 'Jurnal Permukiman', bidang: 'Cipta Karya', publisher: 'Pusat Litbang Permukiman', issn: '1907-4352', eissn: '2807-6556', coverColor: '#dc2626', year: 2023, volume: 'Vol. 18', edition: 'No. 2', frequency: 'Semesteran', articlesCount: 12, views: 876, downloads: 234, description: 'Jurnal ilmiah bidang permukiman, perkotaan, dan infrastruktur wilayah.' },
  { title: 'Jurnal Sumber Daya Air', bidang: 'Sumber Daya Air', publisher: 'Direktorat Jenderal Sumber Daya Air', issn: '1907-1043', eissn: '2807-6556', coverColor: '#0891b2', year: 2025, volume: 'Vol. 20', edition: 'No. 1', frequency: 'Semesteran', articlesCount: 7, views: 1123, downloads: 345, description: 'Jurnal ilmiah bidang sumber daya air terpadu dan konservasi.' },
];

// ============ COMMUNITY WORKS ============
const WORKS = [
  { title: 'Inovasi Monitoring Kualitas Air dengan IoT', description: 'Sistem IoT untuk pemantauan kualitas air sungai secara real-time', type: 'Dokumen', status: 'Published', category: 'Sumber Daya Air', views: 234, likes: 45, published: true },
  { title: 'Video Tutorial QGIS untuk Perencanaan Wilayah', description: 'Tutorial lengkap penggunaan QGIS untuk analisis spasial', type: 'Video', status: 'Published', category: 'Pengembangan Infrastruktur Wilayah', views: 178, likes: 34, published: true },
  { title: 'Database Material Konstruksi Ramah Lingkungan', description: 'Kompilasi material konstruksi berkelanjutan untuk proyek PUPR', type: 'Dokumen', status: 'Published', category: 'Bina Konstruksi', views: 456, likes: 78, published: true },
  { title: 'Dashboard Interaktif Statistik Infrastruktur', description: 'Visualisasi data infrastruktur Kementerian PUPR 2024', type: 'Dokumen', status: 'Published', category: 'Manajemen', views: 567, likes: 89, published: true },
  { title: 'Panduan BIM untuk Proyek Jalan', description: 'Panduan implementasi Building Information Modeling di proyek jalan', type: 'Dokumen', status: 'Menunggu Validasi', category: 'Bina Marga', views: 123, likes: 12, published: false },
  { title: 'Foto Dokumentasi Proyek Bendungan Tapin', description: 'Kumpulan foto progres pembangunan Bendungan Tapin', type: 'Foto', status: 'Menunggu Validasi', category: 'Prasarana Strategis', views: 89, likes: 15, published: false },
  { title: 'Podcast Wawancara Ahli SDA', description: 'Wawancara dengan pakar sumber daya air tentang konservasi', type: 'YouTube', status: 'Draft', category: 'Sumber Daya Air', views: 0, likes: 0, published: false },
  { title: 'Slide Presentasi Standardisasi Jembatan', description: 'Materi presentasi standardisasi desain jembatan', type: 'Dokumen', status: 'Draft', category: 'Bina Marga', views: 0, likes: 0, published: false },
];

async function main() {
  console.log('Seeding Klop Jurnal + Komunitas...');

  // ---- JURNAL ----
  const existingJurnal = await prisma.jurnal.count();
  if (existingJurnal === 0) {
    for (const j of JURNALS) {
      const jurnal = await prisma.jurnal.create({
        data: {
          title: j.title,
          slug: slugify(j.title),
          bidang: j.bidang,
          publisher: j.publisher,
          issn: j.issn,
          eissn: j.eissn,
          coverColor: j.coverColor,
          description: j.description,
          frequency: j.frequency,
          year: j.year,
          volume: j.volume,
          edition: j.edition,
          articlesCount: j.articlesCount,
          views: j.views,
          downloads: j.downloads,
          region: 'jawa',
        },
      });

      // Sample articles
      for (let i = 1; i <= Math.min(3, j.articlesCount); i++) {
        await prisma.jurnalArticle.create({
          data: {
            jurnalId: jurnal.id,
            title: `Analisis ${j.bidang} pada Studi Kasus ${i} - ${j.year}`,
            authors: [`Penulis ${i}A, S.T., M.T.`, `Penulis ${i}B, S.T., M.Sc.`],
            abstract: `Artikel ini membahas analisis mendalam tentang ${j.bidang.toLowerCase()} dengan fokus pada studi kasus terkini. Metodologi penelitian menggunakan pendekatan kuantitatif dan kualitatif. Hasil menunjukkan implikasi signifikan terhadap praktik ke-PUPR-an.`,
            keywords: ['analisis', j.bidang.toLowerCase().split(' ')[0], 'studi kasus', String(j.year)],
            pages: `${i * 10 + 1}-${i * 10 + 15}`,
            doi: `10.1234/${jurnal.slug}.${i}.${j.year}`,
            views: Math.floor(Math.random() * 200) + 50,
            downloads: Math.floor(Math.random() * 100) + 20,
          },
        });
      }
    }
    console.log(`  Jurnal: ${JURNALS.length}`);
    console.log(`  Articles: ${JURNALS.reduce((a, b) => a + Math.min(3, b.articlesCount), 0)}`);
  } else {
    console.log(`  Jurnal: skipped (${existingJurnal} exist)`);
  }

  // ---- KOMUNITAS ----
  const emen = await prisma.user.findUnique({ where: { email: 'emen@dwagon.id' } });
  if (!emen) return;

  const existingWorks = await prisma.communityWork.count();
  if (existingWorks === 0) {
    for (const w of WORKS) {
      await prisma.communityWork.create({
        data: {
          title: w.title,
          slug: slugify(w.title) + '-' + Date.now().toString(36),
          description: w.description,
          content: `# ${w.title}\n\n${w.description}\n\n## Latar Belakang\n\nKarya ini dibuat untuk memenuhi kebutuhan...\n\n## Manfaat\n\n- Efisiensi proses\n- Peningkatan kualitas\n- Dokumentasi pengetahuan`,
          type: w.type,
          status: w.status,
          category: w.category,
          authorId: emen.id,
          authorName: emen.name,
          authorUnit: emen.unitKerja,
          views: w.views,
          likes: w.likes,
          publishedAt: w.published ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) : null,
          region: 'jawa',
        },
      });
    }
    console.log(`  Community Works: ${WORKS.length}`);
  } else {
    console.log(`  Community Works: skipped (${existingWorks} exist)`);
  }

  console.log('Seeding selesai!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });