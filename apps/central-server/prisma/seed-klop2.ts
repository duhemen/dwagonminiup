import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').slice(0, 80);
}

// ============ TALKSHOW EPISODES ============
const TALKSHOWS = [
  { episodeNo: 80, title: 'Menghubungkan Harapan, Membangun Masa Depan Papua', description: 'Percepatan Pembangunan Koridor Jalan Strategis Jayapura - Wamena', host: 'Kanaya Pramudita', narasumber: ['Ir. Usman Affan Latuconsina, S.T., M.T.', 'Denny Rinanda Adhiguna, S.T.'], category: 'Bina Marga', duration: '120 menit', airedAt: '2026-09-23', views: 234, likes: 42, commentsCount: 8 },
  { episodeNo: 79, title: 'Peringatan Dini: Kekeringan Deteksi Cepat, Respons Tepat', description: 'Deteksi Cepat, Respons Tepat untuk Ketahanan Nasional', host: 'Asti Ramadhani', narasumber: ['Dr. Suaidi Ahadi, S.T., M.T.', 'Dr. Ir. Indra Kertati, M.Si.'], category: 'Sumber Daya Air', duration: '90 menit', airedAt: '2026-08-28', views: 189, likes: 35, commentsCount: 5 },
  { episodeNo: 78, title: 'Darurat Sampah: Saatnya Mengelola dengan Bijak', description: 'Diskusi serius tentang krisis pengelolaan sampah di Indonesia', host: 'Anisa Sopandi', narasumber: ['Dr. Muhammad Reva, S.T., M.Sc.'], category: 'Cipta Karya', duration: '90 menit', airedAt: '2026-08-22', views: 156, likes: 28, commentsCount: 4 },
  { episodeNo: 77, title: 'Irigasi Andal, Pangan Berdaulat', description: 'Peran Unit Pengelola Irigasi dalam Mendukung Ketahanan Pangan Nasional', host: 'Asti Sopandi', narasumber: ['Roy Panagom Pardede, S.T., M.Tech.'], category: 'Sumber Daya Air', duration: '90 menit', airedAt: '2026-07-17', views: 178, likes: 31, commentsCount: 6 },
  { episodeNo: 76, title: 'Sinergi Tiga Pilar Pembelajaran Orang Dewasa', description: 'Menggali Lesson Learned dari Kebijakan, Praktik, dan Akademisi', host: 'Aan Abdullah Ramadhan', narasumber: ['H. Natsir Pramana, M.Pd.'], category: 'Manajemen', duration: '90 menit', airedAt: '2026-06-15', views: 145, likes: 22, commentsCount: 3 },
  { episodeNo: 75, title: 'Membangun dari Timur', description: 'Mengelola Duta di Wilayah Indonesia Timur', host: 'Prita Maharani', narasumber: ['Ir. Bambang Widodo, M.T.'], category: 'Pengembangan Infrastruktur Wilayah', duration: '90 menit', airedAt: '2026-05-20', views: 198, likes: 34, commentsCount: 7 },
  { episodeNo: 74, title: 'Dari Teori ke Lapangan: Seberapa Siap Lulusan Magister Super Spesialis Menghadapi Dunia Nyata?', description: 'Kesiapan lulusan magister spesialis di dunia kerja', host: 'Dewi Anggraini', narasumber: ['Prof. Dr. Ir. Sutanto, M.Sc.'], category: 'Manajemen', duration: '90 menit', airedAt: '2026-04-25', views: 267, likes: 48, commentsCount: 12 },
  { episodeNo: 73, title: 'Pemberdayaan Masyarakat Jasa Konstruksi', description: 'Jalan Penguatan Kapasitas Pembangunan Infrastruktur yang Berkelanjutan', host: 'Fatimah Az-Zahra', narasumber: ['Dr. Ahmad Sutrisno, S.T., M.T.'], category: 'Bina Konstruksi', duration: '90 menit', airedAt: '2026-03-18', views: 134, likes: 19, commentsCount: 2 },
];

// ============ FORUM TOPICS ============
const FORUM_TOPICS = [
  { title: 'Ep.16_Ivan_PUPR (LPJK)', content: 'Diskusi seputar peran LPJK dalam pengembangan jasa konstruksi nasional.', category: 'Bina Konstruksi', authorName: 'Ivan Kaleb Benedict, S.T.', views: 16692, likes: 7, replies: 12, daysAgo: 30 },
  { title: 'Short course', content: 'Pengalaman mengikuti short course di luar negeri sebagai bekal peningkatan kompetensi.', category: 'Manajemen', authorName: 'Nadya Dwitri Prameswari, S.E., M.I.Kom.', views: 14078, likes: 3, replies: 8, daysAgo: 90 },
  { title: 'Analisa harga satuan untuk pekerjaan mekanikal elektrikal', content: 'Sharing terkait analisa harga satuan (AHSP) untuk pekerjaan M&E.', category: 'Prasarana Strategis', authorName: 'Subardan', views: 3798, likes: 5, replies: 1, daysAgo: 45 },
  { title: 'Talkshow - Menghubungkan Harapan, Membangun Masa Depan Papua - Percepatan Penuntasan Koridor Jalan Strategis Jayapura - Wamena', content: 'Diskusi lanjutan dari talkshow episode 80.', category: 'Bina Marga', authorName: 'Admin Forum', views: 876, likes: 12, replies: 4, daysAgo: 5 },
  { title: 'Tips menghadapi sertifikasi keahlian konstruksi', content: 'Sharing tips dan pengalaman mengikuti SKK Konstruksi.', category: 'Bina Konstruksi', authorName: 'Rini Astuti, S.T.', views: 1234, likes: 22, replies: 15, daysAgo: 12 },
  { title: 'Rekomendasi software untuk perhitungan struktur bangunan', content: 'Minta rekomendasi software analisis struktur yang banyak dipakai di PUPR.', category: 'Manajemen', authorName: 'Andi Pratama, S.T.', views: 2341, likes: 18, replies: 24, daysAgo: 20 },
  { title: 'Info pelatihan yang akan datang di tahun 2026', content: 'Kumpulan info pelatihan eksternal dan internal yang sedang dibuka.', category: 'Manajemen', authorName: 'Budi Santoso, S.H.', views: 987, likes: 31, replies: 18, daysAgo: 8 },
  { title: 'Pengalaman magang di Balai Besar Wilayah Sungai', content: 'Cerita pengalaman pertama kali terjun ke lapangan.', category: 'Sumber Daya Air', authorName: 'Dewi Lestari, S.T.', views: 654, likes: 15, replies: 7, daysAgo: 25 },
  { title: 'Cara sync data e-HRD ke KinERJA', content: 'Ada yang tahu step-by-step sync data dari e-HRD ke e-Kinerja?', category: 'Manajemen', authorName: 'Hendra Wijaya', views: 1876, likes: 9, replies: 11, daysAgo: 15 },
  { title: 'Diskusi regulasi terbaru UU Jasa Konstruksi', content: 'Pembahasan perubahan UU 2/2017 dan dampaknya ke industri.', category: 'Bina Konstruksi', authorName: 'Rina Kartika, S.Sos.', views: 3210, likes: 26, replies: 32, daysAgo: 18 },
  { title: 'Pelaporan hasil pengawasan lapangan terintegrasi', content: 'Best practice penggunaan aplikasi SIMWAS dalam pelaporan.', category: 'Bina Marga', authorName: 'Setiawan, S.T.', views: 1456, likes: 11, replies: 9, daysAgo: 10 },
  { title: 'Open discussion: IKN dan masa depan konstruksi Indonesia', content: 'Apa pendapat teman-teman tentang pembangunan IKN Nusantara?', category: 'Pengembangan Infrastruktur Wilayah', authorName: 'Fajar Maulana', views: 4532, likes: 42, replies: 56, daysAgo: 3 },
];

async function main() {
  console.log('Seeding Klop Talkshow + Forum...');

  // ---- TALKSHOW ----
  const existingTalkshow = await prisma.talkshowEpisode.count();
  if (existingTalkshow === 0) {
    for (const t of TALKSHOWS) {
      await prisma.talkshowEpisode.create({
        data: {
          episodeNo: t.episodeNo,
          title: t.title,
          slug: slugify(`episode-${t.episodeNo}-${t.title}`),
          description: t.description,
          host: t.host,
          narasumber: t.narasumber,
          category: t.category,
          duration: t.duration,
          airedAt: new Date(t.airedAt),
          views: t.views,
          likes: t.likes,
          commentsCount: t.commentsCount,
          region: 'jawa',
        },
      });
    }
    console.log(`  Talkshow Episodes: ${TALKSHOWS.length}`);
  } else {
    console.log(`  Talkshow Episodes: skipped (${existingTalkshow} exist)`);
  }

  // ---- FORUM ----
  const emen = await prisma.user.findUnique({ where: { email: 'emen@dwagon.id' } });
  if (!emen) {
    console.log('  ⚠ User emen not found, skip forum');
    return;
  }

  const existingForum = await prisma.forumTopic.count();
  if (existingForum === 0) {
    for (const t of FORUM_TOPICS) {
      const lastReplyDate = new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000);
      const topic = await prisma.forumTopic.create({
        data: {
          title: t.title,
          slug: slugify(t.title),
          content: t.content,
          category: t.category,
          authorId: emen.id,
          authorName: t.authorName,
          views: t.views,
          likes: t.likes,
          repliesCount: t.replies,
          lastReplyAt: lastReplyDate,
          createdAt: new Date(Date.now() - t.daysAgo * 24 * 60 * 60 * 1000),
          region: 'jawa',
        },
      });

      // Sample replies (2-3 per topic)
      const replyCount = Math.min(3, t.replies);
      for (let i = 0; i < replyCount; i++) {
        await prisma.forumReply.create({
          data: {
            topicId: topic.id,
            authorId: emen.id,
            authorName: `Pegawai ${i + 1}`,
            content: `Terima kasih sharingnya! Sangat membantu untuk pekerjaan saya. (reply ${i + 1})`,
            likes: Math.floor(Math.random() * 5),
          },
        });
      }
    }
    console.log(`  Forum Topics: ${FORUM_TOPICS.length}`);
  } else {
    console.log(`  Forum Topics: skipped (${existingForum} exist)`);
  }

  console.log('Seeding selesai!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });