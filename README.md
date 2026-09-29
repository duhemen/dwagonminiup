<div align="center">

# 🌐 DwagonMiniUp

### Platform Layanan Kepegawaian Nasional Berbasis *Hybrid Edge Deployment*

**Alternatif modern untuk sistem terpusat — 7 region, 38 provinsi, zero downtime.**

[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://docker.com)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

[✨ Fitur](#-fitur-unggulan) · [🚀 Instalasi](#-panduan-instalasi) · [📖 User Guide](#-user-guide) · [🏗️ Arsitektur](#-arsitektur-sistem) · [🗺️ Roadmap](#-roadmap-pengembangan) · [💝 Credits](#-credits)

</div>

---

## 📖 Daftar Isi

- [Pendahuluan](#-pendahuluan)
- [Mengapa Sistem Terpusat Sering Down?](#-mengapa-sistem-terpusat-sering-down)
- [Solusi: Hybrid Edge Deployment](#-solusi-hybrid-edge-deployment)
- [Fitur Unggulan](#-fitur-unggulan)
- [Preview Aplikasi](#-preview-aplikasi)
- [Arsitektur Sistem](#-arsitektur-sistem)
- [Teknologi yang Digunakan](#-teknologi-yang-digunakan)
- [Struktur Direktori](#-struktur-direktori)
- [Panduan Instalasi](#-panduan-instalasi)
- [User Guide](#-user-guide)
- [Dokumentasi API](#-dokumentasi-api)
- [Deployment Production](#-deployment-production)
- [Roadmap Pengembangan](#-roadmap-pengembangan)
- [Kontribusi](#-kontribusi)
- [Credits](#-credits)
- [Lisensi](#-lisensi)

---

## 🌟 Pendahuluan

**DwagonMiniUp** adalah sistem informasi layanan kepegawaian modern yang dirancang untuk menggantikan arsitektur **monolitik terpusat** yang rentan terhadap *downtime* saat trafik nasional melonjak.

Terinspirasi dari model **Peer-to-Peer (P2P) GTA Online** yang terkenal efisien dalam mendistribusikan beban komputasi, DwagonMiniUp mengadopsi pendekatan **Hybrid Edge Deployment** — sebuah arsitektur di mana setiap wilayah Indonesia memiliki *edge node* sendiri yang berfungsi sebagai "Super-Peer" lokal, sementara **Central Server** di Jakarta bertindak sebagai otoritas pusat untuk validasi & sinkronisasi data.

**Hasil:** ketika 10 juta pegawai mengakses serentak, sistem **tidak akan tumbang** — karena beban terdistribusi merata di 7 regional node.

### 🎯 Tujuan Proyek

- ✅ **Zero downtime** saat trafik nasional melonjak
- ✅ **Latensi rendah** untuk seluruh wilayah Indonesia (kalimantan, papua, sumatera, dll)
- ✅ **Fault tolerance** — jika 1 region tumbang, region lain tetap berjalan
- ✅ **Audit trail lengkap** dengan teknologi kriptografi Ed25519
- ✅ **Real-time notification** antar-instansi
- ✅ **Migrasi lengkap** dari sistem DwaraDaya BPSDM PU

---

## 💥 Mengapa Sistem Terpusat Sering Down?

Sebelum membahas solusi, mari pahami **mengapa** sistem terpusat seperti `superapps.bpsdm.pu.go.id` sering menampilkan error **503 Service Unavailable**:

### 🔴 Problem 1: Single Point of Failure (SPOF)

```
                    ┌─────────────────────┐
                    │   Semua User        │
                    │   se-Indonesia      │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │  SATU SERVER PUSAT  │ ← 1 titik gagal
                    │  (Jakarta)          │
                    └─────────────────────┘
```

Ketika **semua request** dari Sabang sampai Merauke diarahkan ke **satu gerbang** yang sama, cukup ada satu gangguan kecil (server restart, network hiccup, DDoS, atau lonjakan trafik) → **seluruh layanan nasional mati total**.

### 🔴 Problem 2: Bottleneck Database

Database pusat menerima **jutaan query per detik** dari seluruh Indonesia. Akibatnya:

- **Connection pool penuh** → request baru ditolak
- **Lock contention** → query saling menunggu
- **Disk I/O jenuh** → response time melonjak
- **Timeout cascade** → client retry → makin membebani server

### 🔴 Problem 3: Latency Geografis

Ping dari **Papua** ke **Jakarta** rata-rata **80-150ms**. Setiap request user harus *pulang-pergi* melewati kabel bawah laut. Ketika trafik padat, latensi bisa **naik 10x lipat** (>1000ms).

### 🔴 Problem 4: Efek Domino

Ketika server pusat overload:
1. Request mulai timeout
2. Browser user **auto-retry** (biasanya 3x)
3. Trafik **naik 3x lipat** → server makin tumbang
4. Sistem monitoring down → tim IT bingung
5. **Total outage** bisa berlangsung berjam-jam

### 📊 Bukti Real-World

| Kasus | Sistem Terpusat | Dampak |
|---|---|---|
| Pendaftaran CPNS serentak | `sscasn.bkn.go.id` down 4 jam | Jutaan pelamar gagal daftar |
| Pelaporan SPT tahunan | `djponline.pajak.go.id` timeout | Ratusan ribu WP gagal lapor |
| Akses DwaraDaya PUPR | 503 Service Unavailable | Pegawai tidak bisa akses layanan |

**Kesimpulan:** Arsitektur terpusat bukanlah pilihan yang buruk — tapi **tidak cocok** untuk negara kepulauan dengan 38 provinsi dan 270+ juta penduduk.

---

## 🚀 Solusi: Hybrid Edge Deployment

DwagonMiniUp menjawab tantangan di atas dengan **arsitektur hybrid** yang menggabungkan keunggulan sistem terpusat (konsistensi) dan P2P (skalabilitas).

### 🎯 Konsep Dasar

Bayangkan **restoran franchise** alih-alih restoran tunggal:

- **Central Server** = Kantor pusat yang menentukan resep, standar, dan validasi
- **Edge Node** = Dapur di setiap kota — melayani pelanggan lokal dengan cepat
- **Redis Cache** = Bahan-bahan yang selalu siap di dapur
- **BullMQ** = Kurir yang mengantar pesanan ke kantor pusat untuk dicatat

### 🗺️ Peta Deployment

```
                              ┌────────────────────────────────┐
                              │   CENTRAL SERVER (Jakarta)     │
                              │   ━━━━━━━━━━━━━━━━━━━━━━━━━    │
                              │   ✓ PostgreSQL Master          │
                              │   ✓ JWT Auth + SSO             │
                              │   ✓ BullMQ Central Worker      │
                              │   ✓ WebSocket Server           │
                              │   ✓ Edge Registry              │
                              └──────────────┬─────────────────┘
                                             │
     ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
     │ SUMATERA │ │   JAWA   │ │KALIMANTAN│ │BALI-NUSRA│ │ SULAWESI │ │  MALUKU  │ │  PAPUA   │
     │  :4001   │ │  :4002   │ │  :4003   │ │  :4004   │ │  :4005   │ │  :4006   │ │  :4007   │
     │ 10 prov  │ │  6 prov  │ │  5 prov  │ │  3 prov  │ │  6 prov  │ │  2 prov  │ │  6 prov  │
     └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘
          │            │            │            │            │            │            │
     ┌────▼─────┐ ┌────▼─────┐ ┌────▼─────┐ ┌────▼─────┐ ┌────▼─────┐ ┌────▼─────┐ ┌────▼─────┐
     │  Medan   │ │ Jakarta  │ │Balikpapan│ │ Denpasar │ │ Makassar │ │  Ambon   │ │ Jayapura │
     │  Users   │ │  Users   │ │  Users   │ │  Users   │ │  Users   │ │  Users   │ │  Users   │
     └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘
```
**Coverage:** 7 edge nodes × **38 provinsi Indonesia** — tidak ada wilayah yang terlewat 🇮🇩

| # | Region | Port | Provinsi | Ibu Kota Edge | Flag |
|---|---|---|---|---|---|
| 1 | **Sumatera** | `:4001` | 10 | Medan | 🌴 |
| 2 | **Jawa** | `:4002` | 6 | Jakarta | 🏙️ |
| 3 | **Kalimantan** | `:4003` | 5 | Balikpapan | 🌳 |
| 4 | **Bali-Nusra** | `:4004` | 3 | Denpasar | 🏖️ |
| 5 | **Sulawesi** | `:4005` | 6 | Makassar | 🦋 |
| 6 | **Maluku** | `:4006` | 2 | Ambon | 🐚 |
| 7 | **Papua** | `:4007` | 6 | Jayapura | 🐦 |
| | **TOTAL** | | **38** | **7 edge nodes** | 🇮🇩 |

**Distribusi beban:** Setiap edge node melayani provinsi di wilayahnya masing-masing, dengan fallback chain ke edge terdekat jika terjadi gangguan. **Tidak ada region yang menjadi "warga kelas dua"** — semua dapat perhatian yang sama.

### ✨ Keunggulan Arsitektur Ini

| Aspek | Sistem Terpusat | **DwagonMiniUp** |
|---|---|---|
| **Skalabilitas** | Vertikal (upgrade server) | **Horizontal** (tambah edge node) |
| **Latensi** | 80-150ms nasional | **10-30ms lokal** |
| **Fault Isolation** | 1 rusak = semua mati | **1 region rusak = 6 lain tetap jalan** |
| **Trafik puncak** | Tumbang | **Terbagi rata ke 7 edge** |
| **Biaya infrastruktur** | Mahal (server raksasa) | **Efisien** (server medium × 7) |
| **Keamanan data** | Terpusat (risiko tinggi) | **Crypto signing Ed25519** |
| **Offline resilience** | Tidak ada | **BullMQ queue** (job tetap tersimpan) |
| **Maintenance** | Downtime total | **Rolling update per region** |

### 🔒 Lapisan Keamanan Tambahan

Setiap edge node memiliki **keypair Ed25519** yang unik:

```
┌─────────────────────────────────────────────────┐
│  EDGE NODE (Sumatera)                            │
│  ─────────────────                               │
│  1. Startup → generate keypair Ed25519           │
│  2. Register public key → Central (sekali)       │
│  3. Setiap job → sign dengan private key         │
│  4. Kirim { payload, signature, edgeId } → BullMQ│
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│  CENTRAL SERVER                                  │
│  ─────────────────                               │
│  1. Terima job                                   │
│  2. Ambil publicKey edge dari registry (DB)      │
│  3. Verify signature                             │
│     ✓ Valid    → process                         │
│     ✕ Invalid  → REJECT (anti-spoofing!)         │
└─────────────────────────────────────────────────┘
```

**Konsekuensi:** Hacker **tidak bisa memalsukan** data seolah-olah dari edge tertentu — karena mereka tidak punya private key.

---

## ✨ Fitur Unggulan

### 🏛️ Core Platform

- **🔐 Multi-Role Authentication** — Login terpisah untuk Pegawai, Pimpinan, UPT, Kepegawaian
- **🌐 Geo-Routing Otomatis** — Deteksi region dari IP + profile + manual override
- **📡 Real-time WebSocket** — Notifikasi live tanpa refresh
- **🔔 Web Push Notification** — Notifikasi OS-level saat browser ditutup
- **📊 Live Metrics Dashboard** — Grafik real-time queue, latensi, koneksi
- **🎯 Auto-Failover** — Region down → otomatis redirect ke edge terdekat
- **✍️ Crypto Signing** — Ed25519 untuk anti-spoofing
- **📝 Audit Trail** — Activity log lengkap dengan IP + user agent

### 📚 Modul Klop (Pusat Pembelajaran)

- **🏠 Home** — 8 kategori bidang PUPR
- **📖 E-Knowledge** — 15 knowledge item + search + filter + komentar
- **🎓 E-Learning** — 12 course + tracking progress + sertifikat
- **🎙️ Talkshow** — Episode + narasumber + video
- **💬 Ruang Diskusi** — Forum + reply bertingkat
- **📚 Jurnal** — 5 jurnal + 15 artikel ilmiah
- **🤝 Komunitas** — 4 status karya (Draft/Validasi/Published/Undangan)

### 📊 Modul E-Kinerja (Manajemen Kinerja)

- **🏠 Beranda** — SKP Saya + Rekapitulasi + Pembinaan + Capaian
- **🎯 SKP** — Formulir + Daftar + Cascading RHK
- **🖨️ Cetak & Unggah** — 9 dokumen SKP dalam PDF
- **📋 Hak Keberatan** — Pengajuan + monitoring + tanggapan
- **✍️ TTE** — Tanda tangan elektronik BSrE
- **📄 PDF Tools** — Gabung + kompres PDF
- **📈 Rekapitulasi** — Chart + tabel pengembangan kompetensi
- **💡 Pembinaan** — Diagram kuadran Coaching/Mentoring/Directing
- **⚙️ Pengaturan** — Atasan & pejabat penandatangan
- **📥 Unduh** — 9 file panduan/form/peraturan
- **🎥 Video Tutorial** — 4 video tutorial

### 🎓 Modul Tambahan

- **Karyasiswa** — Rekomendasi studi ke universitas
- **SPASI** — Peminjaman aset & venue (asrama, ruang kelas, aula)
- **Ticketing DATIN** — Support ticket IT

### 🚀 Fitur Sistem

- **🌍 7 Region Coverage** — 38 provinsi Indonesia
- **🎨 PWA Ready** — Installable di Android/iOS
- **📶 Offline Support** — Cache statis + queue offline
- **🌗 Responsive Design** — Desktop + tablet + mobile
- **🔍 Real-time Search** — Instant filter di semua modul
- **📤 Export Data** — Download PDF/Excel (coming soon)

---

## 🎨 Preview Aplikasi

### 🏠 Dashboard Utama

```
┌──────────────────────────────────────────────────────────────────┐
│  DwagonMiniUp                              [🌴 Sumatera ▾] [🔔 3]│
├──────────────────────────────────────────────────────────────────┤
│  Welcome back, Mashul Aditama Pradana!                           │
│  Portal terpadu untuk pengembangan SDM                           │
│                                                                   │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐│
│  │   👥 E-HRD  │ │  🏆 KARIR   │ │  📊 KINERJA │ │  🎓 KLOP    ││
│  │ SDM digital │ │ Karir &     │ │ Kinerja     │ │ E-Learning  ││
│  │             │ │ promosi     │ │ pegawai     │ │ hub         ││
│  │ ✓ Terhubung │ │ ✓ Terhubung │ │ ✓ Terhubung │ │ ✓ Terhubung ││
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘│
└──────────────────────────────────────────────────────────────────┘
```

### 🎓 Klop Home

```
┌──────────────────────────────────────────────────────────────────┐
│  K Klop    Home  E-Knowledge  E-Learning  Talkshow  Forum  Jurnal│
├──────────────────────────────────────────────────────────────────┤
│  ╔══════════════════════════════════════════════════════════════╗│
│  ║  Pengen Tahu Seputar PU? di KLOP in aja!                    ║│
│  ║  Pusat pengetahuan untuk seluruh pegawai Kementerian PUPR    ║│
│  ║  [🔍 Masukkan keyword...                    ] [Semua]        ║│
│  ╚══════════════════════════════════════════════════════════════╝│
│                                                                   │
│  💧          🛣️          🏘️          💰          🏗️              │
│  SDA        Bina Marga   Permukiman  Pembiayaan Bina Konstruksi  │
│                                                                   │
│  📦          🏙️          ⚙️                                       │
│  Prasarana   Pengembangan Manajemen                              │
└──────────────────────────────────────────────────────────────────┘
```

### 📊 E-Kinerja Beranda

```
┌──────────────────────────────────────────────────────────────────┐
│  E-KINERJA                                  Dashboard  Helpdesk │
├──────────────────────────────────────────────────────────────────┤
│  ┌───────────────┐  ┌───────────────────────────────────────┐   │
│  │ SKP Saya      │  │ Rekapitulasi Nilai Kinerja            │   │
│  │ ─────────     │  │ ────────────                          │   │
│  │ [SKP][Rencana]│  │ No│Jabatan      │Tahun│TW1│TW2│TW3│TW4 │   │
│  │ ✓ Disetujui   │  │ 1 │Analis SI    │2026 │Baik│Baik│ - │ -  │   │
│  │ [TW1][TW2][TW3│  │ 2 │Analis SI    │2025 │ - │ - │ - │Baik│   │
│  │               │  │                                       │   │
│  │ RHK Saya      │  └───────────────────────────────────────┘   │
│  │ • Terkelola   │                                               │
│  │   arsip       │  ┌───────────────────────────────────────┐   │
│  │ • Pengembangan│  │ Capaian Kinerja Unit Kerja            │   │
│  │   kompetensi  │  │ (Chart SVG real-time)                 │   │
│  └───────────────┘  └───────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### 📈 Live Metrics Dashboard

```
┌──────────────────────────────────────────────────────────────────┐
│  Live Metrics Dashboard                            🟢 LIVE      │
├──────────────────────────────────────────────────────────────────┤
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐  │
│  │ WS Conn │ │ Jobs/t  │ │ Queue   │ │ Edge    │ │ Usulan  │  │
│  │   12    │ │   +3    │ │   5     │ │  7/7    │ │   +1    │  │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘  │
│                                                                   │
│  ┌────────────────────────────┐ ┌────────────────────────────┐  │
│  │ Sync Jobs (Cumulative)     │ │ Latency per Region         │  │
│  │  ▲                          │ │  ████████████████ Sumatera │  │
│  │  │     ╱────────────        │ │  ████████████ Jawa         │  │
│  │  │    ╱                     │ │  ██████████████ Kalimantan │  │
│  │  │  ╱                       │ │  ██████████████ Bali-Nusra │  │
│  │  │╱                         │ │  ██████████████ Sulawesi   │  │
│  │  └─────────────────────▶    │ │  ████████ Maluku           │  │
│  │  Completed    Failed        │ │  ████████████ Papua        │  │
│  └────────────────────────────┘ └────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🏗️ Arsitektur Sistem

### 📐 Diagram Layer

```
┌─────────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                          │
│  React 18 + Vite + TailwindCSS + Socket.io-client + Recharts    │
│  ─────────────────────────────────────────────────────────────  │
│  • Login page (Quick login 4 role)                              │
│  • Dashboard (7 service cards + Push banner)                    │
│  • Klop sub-app (7 panel)                                       │
│  • E-Kinerja sub-app (11 panel)                                 │
│  • Real-time notification (Toast + Bell)                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP + WebSocket
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     APPLICATION LAYER                           │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  ┌──────────────────────┐         ┌──────────────────────────┐ │
│  │  CENTRAL SERVER      │         │  7× EDGE NODES           │ │
│  │  :4000               │         │  :4001 - :4007           │ │
│  │  ────────────        │         │  ──────────              │ │
│  │  • Auth + JWT        │◄───────►│  • Local cache           │ │
│  │  • CRUD master       │  BullMQ │  • Session manager       │ │
│  │  • Crypto verify     │         │  • Crypto signing        │ │
│  │  • WS server         │         │  • WS subscribe          │ │
│  │  • Worker            │         │  • Heartbeat             │ │
│  └──────────┬───────────┘         └────────┬─────────────────┘ │
│             │                              │                     │
└─────────────┼──────────────────────────────┼─────────────────────┘
              │                              │
              ▼                              ▼
┌─────────────────────────────┐  ┌──────────────────────────────┐
│      DATA LAYER             │  │      CACHE LAYER             │
│  ─────────────────          │  │  ──────────                  │
│  • PostgreSQL 15            │  │  • Redis 7                   │
│  • 30+ tables               │  │  • BullMQ queues             │
│  • Prisma ORM               │  │  • Session store             │
│  • Master + Region shard    │  │  • Rate limiting             │
└─────────────────────────────┘  └──────────────────────────────┘
```

### 🔄 Data Flow: Submit Usulan

```
1. User (Papua) klik "Ajukan Usulan"
       │
       ▼
2. Frontend POST → /api/edge-papua/usulan  ← Vite proxy routing
       │
       ▼
3. Edge-Papua (port 4007):
   ├─ Verify JWT
   ├─ Store di Redis cache (instan)
   ├─ Sign payload dengan Ed25519 private key
   └─ Push job ke BullMQ "usulan-sync"
       │
       ▼
4. Response 202 Accepted (dalam <50ms)  ← UX super cepat
       │
       ▼
5. Central Worker consume job:
   ├─ Cek edge registry (public key)
   ├─ Verify signature ✅
   ├─ Tulis ke PostgreSQL master
   └─ Push callback ke "usulan-sync-result"
       │
       ▼
6. Edge-Papua worker terima callback:
   └─ Update Redis cache → syncStatus = "synced"
       │
       ▼
7. Frontend (polling 1s) lihat status "synced"
       │
       ▼
8. Pimpinan dapat notifikasi real-time via WebSocket
```

### 🛡️ Auto-Failover Flow

```
User submit usulan dari region PAPUA
       │
       ▼
Coba edge-papua:4007 ──── Gagal (timeout/offline)
       │
       ▼ (fallback chain)
Coba edge-maluku:4006 ──── Gagal
       │
       ▼
Coba edge-sulawesi:4005 ──── ✅ SUKSES!
       │
       ▼
Modal tampilkan: "⚠️ Auto-failover: edge-papua tidak merespon,
                 dialihkan ke edge-maluku (atau sulawesi)"
       │
       ▼
Data tetap masuk ke Central → user puas 🎉
```

### 🔑 Chain Fallback per Region

| Region Utama | Fallback 1 | Fallback 2 | Fallback 3 |
|---|---|---|---|
| Sumatera | Jawa | Kalimantan | — |
| Jawa | Sumatera | Bali-Nusra | Kalimantan |
| Kalimantan | Jawa | Sumatera | Sulawesi |
| Bali-Nusra | Jawa | Sulawesi | — |
| Sulawesi | Kalimantan | Bali-Nusra | Maluku |
| Maluku | Sulawesi | Papua | — |
| Papua | Maluku | Sulawesi | — |

---

## 🛠️ Teknologi yang Digunakan

### Backend
| Teknologi | Versi | Fungsi |
|---|---|---|
| **Node.js** | 20.x | Runtime JavaScript |
| **Fastify** | 4.28 | Web framework (lebih cepat dari Express) |
| **Prisma** | 5.22 | ORM untuk PostgreSQL |
| **BullMQ** | 5.13 | Queue system berbasis Redis |
| **Socket.io** | 4.8 | WebSocket real-time |
| **bcryptjs** | 2.4 | Password hashing |
| **jsonwebtoken** | 9.0 | JWT signing |
| **web-push** | 3.6 | Web Push API (VAPID) |
| **tweetnacl** | 1.0 | Ed25519 crypto signing |

### Frontend
| Teknologi | Versi | Fungsi |
|---|---|---|
| **React** | 18.3 | UI library |
| **Vite** | 5.4 | Build tool + dev server |
| **TailwindCSS** | 3.4 | Utility-first CSS |
| **React Router** | 6.26 | Client-side routing |
| **Axios** | 1.7 | HTTP client |
| **Recharts** | 2.13 | Chart library |
| **Socket.io-client** | 4.8 | WebSocket client |

### Infrastructure
| Teknologi | Versi | Fungsi |
|---|---|---|
| **PostgreSQL** | 15 | Database master |
| **Redis** | 7 | Cache + queue broker |
| **Docker** | 24+ | Containerization |
| **Nginx** | 1.27 | Reverse proxy + SSL |

---

## 📂 Struktur Direktori

```
dwagonminiup/
├── 📂 apps/
│   ├── 📂 central-server/              # Server pusat Jakarta
│   │   ├── 📂 prisma/
│   │   │   ├── schema.prisma          # 30+ tabel database
│   │   │   └── seed*.ts               # Seed scripts
│   │   ├── 📂 src/
│   │   │   ├── 📂 routes/             # REST API endpoints
│   │   │   ├── 📂 services/           # Business logic
│   │   │   ├── 📂 queue/              # BullMQ worker
│   │   │   ├── 📂 websocket/          # Socket.io server
│   │   │   ├── 📂 geo/                # Region detection
│   │   │   ├── 📂 middleware/         # Auth middleware
│   │   │   └── server.ts              # Entry point
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── 📂 edge-node/                   # Edge node regional (7×)
│   │   ├── 📂 src/
│   │   │   ├── 📂 crypto/             # Ed25519 keypair
│   │   │   ├── 📂 queue/              # Local cache + producer
│   │   │   ├── 📂 routes/             # Edge-specific routes
│   │   │   └── server.ts
│   │   ├── 📂 .keys/                  # Persistent keypairs (gitignored)
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   └── 📂 dashboard-ui/                # React frontend
│       ├── 📂 src/
│       │   ├── 📂 api/                # API client
│       │   ├── 📂 components/         # Reusable UI
│       │   ├── 📂 contexts/           # Auth, Region, Notification
│       │   ├── 📂 hooks/              # Custom hooks
│       │   ├── 📂 views/              # Pages
│       │   │   ├── 📂 Klop/           # 7 panel Klop
│       │   │   ├── 📂 Kinerja/        # 11 panel E-Kinerja
│       │   │   ├── 📂 Karyasiswa/
│       │   │   ├── 📂 Spasi/
│       │   │   └── 📂 Ticketing/
│       │   ├── App.tsx
│       │   └── main.tsx
│       ├── 📂 public/
│       │   ├── sw.js                  # Service Worker
│       │   └── manifest.webmanifest   # PWA manifest
│       ├── Dockerfile
│       └── package.json
│
├── 📂 packages/
│   ├── 📂 shared-crypto/              # Ed25519 utilities
│   ├── 📂 shared-types/               # TypeScript types
│   └── 📂 config/                     # Shared config
│
├── 📂 nginx/
│   ├── nginx.conf                     # Main config
│   └── 📂 conf.d/dwagon.conf          # Site config
│
├── 📂 docs/                            # Documentation
│   └── DEPLOYMENT.md
│
├── docker-compose.yml                 # Dev environment
├── docker-compose.prod.yml            # Production
├── deploy.ps1                         # Deployment automation
├── start-all-edges.ps1                # Spawn 7 edge nodes
├── package.json                       # Root workspace
├── pnpm-workspace.yaml
├── README.md                          # 📖 File ini
└── .env.example                       # Environment template
```

---

## 🚀 Panduan Instalasi

### 📋 Prerequisites

Sebelum memulai, pastikan tools berikut sudah terpasang:

| Tool | Versi Minimum | Cek |
|---|---|---|
| **Node.js** | 20.x | `node --version` |
| **pnpm** | 8.x+ | `pnpm --version` |
| **Docker Desktop** | 24+ | `docker --version` |
| **Git** | 2.40+ | `git --version` |

**💡 Tips:** Jika belum punya `pnpm`, install dengan:
```powershell
npm install -g pnpm
```

### 🎯 Instalasi Cepat (5 menit)

#### Step 1 — Clone Repository

```powershell
git clone https://github.com/yourusername/dwagonminiup.git C:\dwagonminiup
cd C:\dwagonminiup
```

#### Step 2 — Install Dependencies

```powershell
pnpm install
```

Tunggu 2-3 menit. Jika ada warning "supply-chain policies", jalankan:

```powershell
pnpm approve-builds
# Tekan 'a' untuk select all, lalu Enter
```

#### Step 3 — Setup Environment

```powershell
# Copy template env
Copy-Item .env.example .env

# Edit file .env (opsional untuk dev)
notepad .env
```

Isi `.env` (default sudah siap untuk development):
```env
DATABASE_URL=postgresql://dwagon:dwagon@127.0.0.1:5433/dwagon
JWT_SECRET=supersecret
REDIS_URL=redis://localhost:6379
```

#### Step 4 — Start Database (Docker)

```powershell
# Start PostgreSQL + Redis
docker-compose up -d postgres redis

# Tunggu 20 detik
Start-Sleep -Seconds 20

# Verifikasi
docker ps
```

Expected: 2 container berjalan (`dwagon-postgres` port 5433, `dwagon-redis` port 6379).

#### Step 5 — Push Schema + Seed Data

```powershell
cd apps\central-server
npx prisma db push --skip-generate --accept-data-loss
npx prisma generate
npx tsx prisma/seed.ts
cd ..\..
```

Expected output:
```
🚀 Your database is now in sync with your Prisma schema.
✔ Generated Prisma Client (v5.22.0)
Seeding database...
  Users: 4
  Pelatihan: 9
  Knowledge Categories: 8
  Knowledge Items: 15
  ...
Seeding selesai!
```

#### Step 6 — Jalankan 3 Services (di 3 terminal berbeda)

**Terminal 1 — Central Server:**
```powershell
cd C:\dwagonminiup
pnpm --filter central-server dev
```
Expected: `Central Server running on :4000`

**Terminal 2 — Edge Nodes (7 region):**
```powershell
cd C:\dwagonminiup
.\start-all-edges.ps1
```
Expected: 7 jendela baru terbuka, masing-masing menjalankan edge node di port 4001-4007.

**Terminal 3 — Frontend:**
```powershell
cd C:\dwagonminiup
pnpm --filter dashboard-ui dev
```
Expected: `Local: http://localhost:5173/`

#### Step 7 — Buka Aplikasi

Buka browser: **http://localhost:5173**

**Login dengan akun demo:**

| Role | Email | Password |
|---|---|---|
| Pegawai | `emen@dwagon.id` | `demo123` |
| Pimpinan | `pimpinan@dwagon.id` | `demo123` |
| Admin UPT | `upt@dwagon.id` | `demo123` |
| Kepegawaian | `kepegawaian@dwagon.id` | `demo123` |

**Selesai!** 🎉

### 🐛 Troubleshooting Instalasi

| Masalah | Solusi |
|---|---|
| `pnpm: command not found` | `npm install -g pnpm` |
| Docker error `daemon not running` | Buka Docker Desktop, tunggu 30 detik |
| Port 5432/6379 sudah dipakai | Edit `docker-compose.yml` ganti port ke 5433/6380 |
| Prisma Client error `EPERM` | Kill semua node: `Get-Process node \| Stop-Process -Force` lalu `npx prisma generate` |
| 500 saat login | Cek log terminal central-server, kemungkinan seed belum jalan |
| Vite stuck "Loading..." | Restart Vite: `Ctrl+C` di terminal, jalankan ulang |
| Emoji rusak (mojibake) | File `.tsx` harus di-save sebagai UTF-8. Buka di VSCode → Save with Encoding → UTF-8 |

---

## 📖 User Guide

### 🔑 Login & Authentication

#### Login dengan Password

1. Buka `http://localhost:5173/login`
2. Masukkan email & password
3. Klik **"Masuk"**

#### Quick Login (Demo)

Klik salah satu tombol di bawah form:
- 🟦 **Pegawai** → login sebagai `emen@dwagon.id`
- 🟪 **Pimpinan** → login sebagai `pimpinan@dwagon.id`
- 🟩 **Admin UPT** → login sebagai `upt@dwagon.id`
- 🟨 **Kepegawaian** → login sebagai `kepegawaian@dwagon.id`

#### Simulate Region (Testing)

Untuk mensimulasi user dari wilayah berbeda:
1. Expand section **🧪 Simulate Region**
2. Pilih region (Sumatera, Jawa, Kalimantan, dll)
3. Login → sistem akan otomatis routing ke edge node region tersebut

#### Ganti Password

1. Klik avatar kanan atas → **Profil Saya**
2. Scroll ke **Ganti Password**
3. Isi password lama + password baru (min 6 karakter)
4. Klik **Simpan Password Baru**

---

### 🏠 Dashboard Utama

Setelah login, Anda akan melihat:

**Header welcome** — Menampilkan nama + info region

**Push notification banner** (jika belum aktif) — Klik **"Aktifkan Sekarang"** untuk enable notifikasi OS-level

**7 service cards** — Klik salah satu untuk buka modul:
- 👥 **E-HRD** — Manajemen SDM
- 🏆 **KARIR** — Pengembangan karir
- 📊 **KINERJA** — Evaluasi kinerja
- 🎓 **KLOP** — E-Learning hub
- 🏅 **AKREDITASI** — Akreditasi instansi
- 💡 **KARYA** — Inovasi & karya

**Sidebar kiri** — Navigasi utama (Dashboard, Kinerja, E-HRD, dll)

**Region selector** (kanan atas) — Pilih/ganti region edge

**Notification bell** — Lihat notifikasi live

---

### 🎓 Modul Klop

Klop adalah sub-application dengan navbar oranye khas.

#### Home

- Banner besar dengan quote **"Pengen Tahu Seputar PU?"**
- 8 kategori (Sumber Daya Air, Bina Marga, Permukiman, dll)
- Statistics card
- Tombol **"Jelajahi Knowledge Library →"**

#### E-Knowledge

1. Klik tab **E-Knowledge**
2. **Search bar** — cari knowledge berdasarkan judul/tag
3. **Filter type** — Semua / Dokumen / Video / Foto / YouTube
4. **Kategori pills** — filter bidang (8 kategori)
5. **Sort tabs** — Terbaru / Banyak Diskusi / Banyak Dilihat
6. Grid cards — klik untuk buka detail
7. Di halaman detail:
   - Baca konten lengkap
   - **Like** (👍)
   - **Comment** — diskusi dengan pegawai lain
   - **Share** (coming soon)

#### E-Learning

1. Klik tab **E-Learning** di navbar
2. **3 sub-tab**:
   - **Pelatihanku** — course yang sudah Anda ikuti
   - **e-HRD** — data asesmen RPK-10/20/70
   - **e-learning** — katalog semua course
3. Filter di tab e-learning:
   - **Bidang** — pilih kategori
   - **Status** — Semua/Dibuka/Dimulai/Akan Datang/Sudah Berakhir
   - **Tipe Kelas** — Terbuka/Pengajuan/Undangan
   - **Tahun** — filter by tahun
4. Klik card course untuk buka detail:
   - Info lengkap (JP, kuota, penyelenggara)
   - **Daftar** untuk enroll
   - Update progress manual (25/50/75/100%)
   - **Lihat Sertifikat** jika sudah 100%

#### Talkshow

1. Klik tab **Talkshow**
2. Grid 4 kolom dengan card episode
3. Filter kategori + sort (Terbaru/Banyak Dilihat/Banyak Disukai)
4. Klik card → buka video (YouTube)

#### Ruang Diskusi

1. Klik tab **Ruang Diskusi**
2. **Statistic cards**: Topik, Balasan, Total Views
3. **List topik** dengan info penulis + views + replies
4. Klik **"+ Buat Forum Baru"**:
   - Isi judul, kategori, konten
   - Klik **Buat Topik**
5. Di halaman detail forum:
   - **Reply** komentar
   - **Nested reply** (balas ke komentar orang lain)

#### Jurnal

1. Klik tab **Jurnal**
2. Grid cover jurnal (5 jurnal teknis)
3. Filter bidang + tahun
4. Klik cover → detail:
   - ISSN, E-ISSN, Publisher
   - Daftar artikel dengan abstrak + DOI

#### Komunitas

1. Klik tab **Komunitas**
2. **4 tab status**:
   - **Draft** — karya yang belum di-submit
   - **Menunggu Validasi** — sedang direview
   - **Published** — sudah terbit
   - **Undangan** — karya kolaborasi
3. Klik **"+ Buat Karya Komunitas Baru"**:
   - Isi judul, deskripsi, tipe
   - Klik **Buat Draft**
4. Klik **"Ajukan Validasi"** pada Draft untuk submit

---

### 📊 Modul E-Kinerja

E-Kinerja adalah sub-application dengan topbar navy dan sidebar biru.

#### Beranda

- **SKP Saya** panel — pilih TW (I/II/III/IV) untuk lihat RHK
- **Rekapitulasi Nilai Kinerja** — tabel 2 tahun
- **Pembinaan Kinerja** — shortcut Bimbingan & Konseling
- **Capaian Kinerja Unit Kerja** — chart SVG
- **5 stats card** footer

#### SKP (Sasaran Kinerja Pegawai)

1. Klik **Sasaran Kinerja Pegawai** di sidebar
2. **List SKP** — tampil semua SKP Anda per tahun
3. Klik **"+ Buat SKP Baru"**:
   - **Parameter SKP** — tahun, periode mulai/selesai
   - **Data Pegawai** — jabatan, unit kerja
   - **Atasan Langsung** — nama, NIP, jabatan
   - **Pejabat Penandatangan** — nama, NIP, jabatan
   - **RHK** — klik **+ Tambah RHK** untuk multiple RHK
   - Klik **Simpan sebagai Draft**
4. Setelah saved, klik **Ajukan** untuk submit ke atasan

#### Cetak & Unggah Dokumen

1. Klik menu **Cetak & Unggah Dokumen**
2. **3 kategori dokumen**:
   - Perencanaan (SKP, Matriks, Lampiran)
   - Pelaksanaan (Rencana Aksi per TW)
   - Evaluasi (Form + Dokumen Evaluasi per TW)
3. Klik **📥 Download** untuk download PDF

#### Pengajuan & Monitoring HK

1. Klik menu **Pengajuan & Monitoring HK**
2. Klik **"+ Ajukan HK Baru"**:
   - Isi tahun + periode
   - Pilih kategori (Keterlambatan/Nilai Tidak Sesuai/Beban Berlebih/Lainnya)
   - Isi alasan detail
   - Klik **Simpan Draft** → lalu **Ajukan**

#### Tanda Tangan Elektronik (TTE)

1. Klik menu **Tanda Tangan Elektronik**
2. Tab **Form TTE**:
   - Pilih mode: **Satu Dokumen** / **Banyak Dokumen**
   - Upload file PDF (drag & drop atau klik)
   - Isi passphrase BSrE
   - Klik **Tambahkan TTE**
3. Tab **Riwayat** — lihat dokumen yang sudah ditandatangani

#### PDF Tools

1. Klik menu **Gabung & Kompres PDF**
2. Tab **🔗 GABUNG PDF**:
   - Upload multiple PDF
   - Drag untuk reorder
   - Klik **Gabungkan Sekarang**
3. Tab **📉 KOMPRES PDF**:
   - Upload file
   - Klik **Kompres Sekarang**

#### Rekapitulasi Kompetensi

1. Klik menu **Rekapitulasi Kompetensi**
2. Pilih tahun (2025/2026)
3. **Summary row**:
   - Total JP tahun ini
   - Chart perbandingan per tahun
4. **Tabel** dengan 7+ baris rekap pelatihan
5. Klik **Sinkronkan Manual** untuk refresh dari E-HRM

#### Pembinaan Kinerja

1. Klik menu **Pembinaan Kinerja**
2. **2 tab**: **Bimbingan Kinerja** / **Konseling Kinerja**
3. **Diagram 2x2 kuadran**:
   - Top-Left: Mentoring/Training
   - Top-Right: Coaching
   - Bottom-Left: Directing
   - Bottom-Right: Counseling/Motivating
4. Filter tahun SKP + klik **+ TAMBAH BIMBINGAN/KONSELING KINERJA**
5. Isi form:
   - Tipe (Bimbingan/Konseling)
   - Teknik (Coaching/Mentoring/Directing/Counseling)
   - RHK, periode, tanggal
   - Catatan
6. Klik **Simpan** → muncul di tabel
7. Klik **Detail** untuk lihat, **Selesai** untuk tandai selesai

#### Pengaturan Atasan

1. Klik menu **Pengaturan Atasan**
2. Klik **"+ Tambah Pengaturan"**:
   - Tahun + periode
   - Jabatan + unit kerja
   - Atasan langsung
   - Pejabat TTD
3. Klik **Simpan** → muncul di tabel
4. Klik **✏️ Ubah** untuk edit, **🗑️** untuk hapus

#### Unduh Dokumen

1. Klik menu **Unduh Dokumen**
2. Filter kategori (Panduan / Form / Peraturan)
3. Tabel 9 file dengan tombol ⬇️ untuk download

#### Video Tutorial

1. Klik menu **Video Tutorial**
2. Grid 4 video dengan thumbnail + durasi
3. Hover untuk play button, klik untuk play

---

### 🎓 Karyasiswa

1. Buka menu **Karyasiswa** di sidebar utama
2. **4 tab status**: Semua / Draft / Menunggu Validasi / Disetujui / Ditolak
3. Klik **"+ Ajukan Rekomendasi Studi"**:
   - Isi program studi, universitas, jenjang
   - Lokasi studi, durasi
   - Centang beasiswa (opsional)
   - Klik **Simpan Draft**
4. Klik **Ajukan** untuk submit ke Admin Unit

---

### 🏢 SPASI (Peminjaman Aset)

1. Buka menu **SPASI** di sidebar utama
2. **Hero banner** dengan quote + tombol search
3. **Filter tipe**: Semua / Asrama / Ruang Kelas / Ruang Wawancara / Aula
4. **Grid venue** — klik card untuk booking
5. Modal booking:
   - Tanggal mulai & selesai
   - Jumlah orang
   - Keperluan
   - Klik **Ajukan Booking**

---

### 🎫 Ticketing DATIN

1. Buka menu **Ticketing DATIN** di sidebar utama
2. **4 stats card**: Total, Diproses, Selesai, Terbuka
3. Klik **"+ Buat Tiket Baru"**:
   - Judul tiket
   - Kategori (Jaringan/Hardware/Software/Email/Aplikasi/Printer/Lainnya)
   - Prioritas (Rendah/Normal/Tinggi/Urgent)
   - Deskripsi masalah
   - Klik **Kirim Tiket**
4. Tim IT akan resolve tiket Anda → status berubah otomatis

---

### 🚪 Logout

Klik **"Keluar"** di bagian bawah sidebar, atau:
- Topbar → avatar → Logout

---

## 📡 Dokumentasi API

Base URL: `http://localhost:4000/api`

### Auth

| Method | Endpoint | Fungsi |
|---|---|---|
| POST | `/auth/login` | Login user |
| POST | `/auth/change-password` | Ganti password |
| GET | `/auth/me` | Profil user |

### Kinerja

| Method | Endpoint | Fungsi |
|---|---|---|
| GET | `/kinerja/skp` | List SKP |
| POST | `/kinerja/skp` | Buat SKP baru |
| PATCH | `/kinerja/skp/:id` | Update SKP |
| POST | `/kinerja/skp/:id/submit` | Ajukan SKP |
| GET | `/kinerja/rekap` | Rekap nilai |
| GET | `/kinerja/documents` | Dokumen SKP |
| GET | `/kinerja/hk` | List HK |
| POST | `/kinerja/hk` | Ajukan HK |
| GET | `/kinerja/tte` | List TTE |
| POST | `/kinerja/tte` | Buat TTE |
| GET | `/kinerja/pembinaan` | List pembinaan |
| POST | `/kinerja/pembinaan` | Buat pembinaan |
| GET | `/kinerja/rekap-kompetensi` | Rekap kompetensi |

### Klop

| Method | Endpoint | Fungsi |
|---|---|---|
| GET | `/klop/categories` | Kategori knowledge |
| GET | `/klop/knowledge` | List knowledge |
| GET | `/klop/knowledge/:id` | Detail + increment views |
| POST | `/klop/knowledge/:id/like` | Like/unlike |
| POST | `/klop/knowledge/:id/comments` | Tambah komentar |
| GET | `/elearning/courses` | List course |
| POST | `/elearning/courses/:id/enroll` | Enroll course |
| GET | `/talkshow` | List talkshow |
| GET | `/forum/topics` | List forum topics |
| POST | `/forum/topics` | Buat topik |
| POST | `/forum/topics/:id/replies` | Reply topik |

### Region & Edge

| Method | Endpoint | Fungsi |
|---|---|---|
| POST | `/geo/detect` | Deteksi region |
| POST | `/geo/lock` | Lock region |
| POST | `/geo/unlock` | Unlock region |
| GET | `/geo/health` | Cek health semua edge |
| GET | `/edge-registry` | List edge terdaftar |

### System

| Method | Endpoint | Fungsi |
|---|---|---|
| GET | `/system/health` | System health check |
| GET | `/ws/stats` | WebSocket stats |
| GET | `/metrics/recent` | Metrics history |
| GET | `/health` | Health check |

**📘 Full API documentation:** `http://localhost:4000/documentation` (coming soon)

---

## 🚢 Deployment Production

### Quick Deploy

```powershell
# 1. Init
.\deploy.ps1 init

# 2. Edit .env.production (JANGAN commit!)
notepad .env.production

# 3. Build images
.\deploy.ps1 build

# 4. Start semua service
.\deploy.ps1 up

# 5. Verifikasi
.\deploy.ps1 ps
```

### SSL Setup (Let's Encrypt)

```powershell
$env:DOMAIN = "dwagon.id"
$env:LETSENCRYPT_EMAIL = "admin@dwagon.id"

# Request cert
.\deploy.ps1 ssl

# Uncomment HTTPS block di nginx/conf.d/dwagon.conf
notepad nginx\conf.d\dwagon.conf

# Reload nginx
.\deploy.ps1 restart
```

### Backup Database

```powershell
.\deploy.ps1 backup
# Output: backups\dwagon-YYYYMMDD-HHMMSS.sql
```

### Update Deployment

```powershell
.\deploy.ps1 update
```

### Deployment per Region (Multi-Server)

Untuk skala nasional, pisahkan service ke server berbeda:

| Server | Services | Spec |
|---|---|---|
| **Jakarta (Central)** | Postgres, Redis, Central, Nginx | 8 vCPU / 16 GB |
| **Medan (Edge Sumatera)** | Edge :4001 | 2 vCPU / 4 GB |
| **Bandung (Edge Jawa)** | Edge :4002 | 4 vCPU / 8 GB |
| **Balikpapan (Edge Kalimantan)** | Edge :4003 | 2 vCPU / 4 GB |
| **Denpasar (Edge Bali-Nusra)** | Edge :4004 | 2 vCPU / 4 GB |
| **Makassar (Edge Sulawesi)** | Edge :4005 | 2 vCPU / 4 GB |
| **Ambon (Edge Maluku)** | Edge :4006 | 2 vCPU / 4 GB |
| **Jayapura (Edge Papua)** | Edge :4007 | 2 vCPU / 4 GB |

---

## 🗺️ Roadmap Pengembangan

### ✅ Sprint 1-15 (COMPLETED)

- [x] Setup monorepo + 3 services
- [x] Auto-login + JWT
- [x] 7 modul dasar + UI
- [x] E-HRD IDP
- [x] Klop E-Learning
- [x] Database Prisma + Real API
- [x] Frontend integration
- [x] Multi-role approval workflow
- [x] BullMQ async sync
- [x] Multi-region (7 edge nodes)
- [x] Crypto signing Ed25519
- [x] Geo auto-routing + failover
- [x] Real-time WebSocket
- [x] Web Push API
- [x] Live metrics dashboard
- [x] Persistent notification
- [x] System health monitor
- [x] Docker + Nginx + SSL
- [x] PWA installable

### ✅ Sprint 16-19 (COMPLETED)

- [x] **Sprint 16** — Web Push API
- [x] **Sprint 17** — Live Dashboard Chart
- [x] **Sprint 18** — Production deployment
- [x] **Sprint 19.1** — Klop Home + E-Knowledge
- [x] **Sprint 19.2** — Klop E-Learning
- [x] **Sprint 19.3** — Klop Talkshow + Ruang Diskusi
- [x] **Sprint 19.4** — Klop Jurnal + Komunitas
- [x] **Sprint 19.5** — E-Kinerja SKP Core
- [x] **Sprint 19.6-19.8** — E-Kinerja Cetak + HK + TTE + PDF + Pengaturan + Unduh + Video
- [x] **Sprint 19.9** — Rekap Kompetensi
- [x] **Sprint 19.10** — Karyasiswa
- [x] **Sprint 19.11** — SPASI
- [x] **Sprint 19.12** — Ticketing DATIN
- [x] **Sprint 19.13** — Pembinaan Kinerja

### 🎯 Sprint 20+ (IN PROGRESS / PLANNED)

#### 🎯 Phase 1: Penyusunan & Pengisian SKP (PRIORITY)

> **Fokus Utama:** Melengkapi modul SKP dengan fitur penyusunan & pengisian yang proper.

- [ ] **Sprint 20.1** — Form SKP dengan cascading dropdown (pilih atasan → auto-fill data)
- [ ] **Sprint 20.2** — Template RHK per jabatan (auto-suggest berdasarkan jabatan)
- [ ] **Sprint 20.3** — Import RHK dari Excel
- [ ] **Sprint 20.4** — Approval workflow SKP (Atasan → Pejabat TTD)
- [ ] **Sprint 20.5** — Revisi SKP dengan version control
- [ ] **Sprint 20.6** — Export SKP ke PDF resmi (dengan kop surat + TTE)
- [ ] **Sprint 20.7** — Pengisian capaian kinerja per TW
- [ ] **Sprint 20.8** — Perhitungan nilai kinerja otomatis
- [ ] **Sprint 20.9** — Cascading RHK antar level (Eselon I → IV)
- [ ] **Sprint 20.10** — Dashboard SKP untuk Pimpinan (monitoring bawahan)

#### 📊 Phase 2: Analytics & Reporting

- [ ] **Sprint 21.1** — Dashboard Analytics Kinerja Instansi
- [ ] **Sprint 21.2** — Export report ke Excel/PDF
- [ ] **Sprint 21.3** — Scheduled report (auto-email mingguan)
- [ ] **Sprint 21.4** — Analytics kompetensi pegawai (gap analysis)
- [ ] **Sprint 21.5** — Prediksi kebutuhan pelatihan dengan ML

#### 🔐 Phase 3: Advanced Security

- [ ] **Sprint 22.1** — Two-Factor Authentication (TOTP)
- [ ] **Sprint 22.2** — Single Sign-On (SSO) integration
- [ ] **Sprint 22.3** — Session management + device tracking
- [ ] **Sprint 22.4** — IP whitelist per role
- [ ] **Sprint 22.5** — Audit log UI (untuk Admin)

#### 📱 Phase 4: Mobile & PWA Enhancement

- [ ] **Sprint 23.1** — Native mobile app (React Native)
- [ ] **Sprint 23.2** — Offline mode lengkap
- [ ] **Sprint 23.3** — Background sync
- [ ] **Sprint 23.4** — Fingerprint/Face ID login
- [ ] **Sprint 23.5** — Push notification actions (approve/reject langsung)

#### 🎨 Phase 5: UX Improvements

- [ ] **Sprint 24.1** — Dark mode
- [ ] **Sprint 24.2** — Customizable dashboard widgets
- [ ] **Sprint 24.3** — Multi-language (ID/EN)
- [ ] **Sprint 24.4** — Keyboard shortcuts
- [ ] **Sprint 24.5** — Accessibility (WCAG 2.1 AA)

#### 🚀 Phase 6: Scale & Optimize

- [ ] **Sprint 25.1** — Kubernetes deployment
- [ ] **Sprint 25.2** — Auto-scaling edge nodes
- [ ] **Sprint 25.3** — Multi-master database replication
- [ ] **Sprint 25.4** — CDN integration untuk static assets
- [ ] **Sprint 25.5** — Blockchain audit trail (immutable log)

#### 🌐 Phase 7: Integration

- [ ] **Sprint 26.1** — Integration dengan SAPK (Sistem Aplikasi Pelayanan Kepegawaian BKN)
- [ ] **Sprint 26.2** — Integration dengan SIKD (Sistem Informasi Keuangan Daerah)
- [ ] **Sprint 26.3** — Integration dengan MyASN app
- [ ] **Sprint 26.4** — Integration dengan SIMPEG
- [ ] **Sprint 26.5** — Webhook API untuk third-party

### 💡 Ide Fitur Masa Depan

- 🤖 **AI Assistant** — Chatbot untuk bantuan SKP
- 📸 **OCR KTP** — Auto-fill data pegawai
- 🎥 **Video Conference** — Untuk bimbingan kinerja remote
- 📊 **Business Intelligence** — Dashboard eksekutif
- 🔗 **Blockchain** — Audit trail immutable
- 🌐 **Microservices** — Migrasi dari monolith ke microservices
- 🧠 **Recommendation Engine** — Rekomendasi pelatihan dengan ML
- 📱 **WhatsApp Bot** — Notifikasi via WhatsApp Business API

---

## 🤝 Kontribusi

Kami menerima kontribusi dalam bentuk apa pun:

### 🐛 Melaporkan Bug

1. Cek [Issues](https://github.com/yourusername/dwagonminiup/issues) dulu
2. Buat issue baru dengan template
3. Sertakan: log error, screenshot, langkah reproduksi

### ✨ Menambah Fitur

1. Fork repository
2. Buat branch baru: `git checkout -b feature/fitur-baru`
3. Commit: `git commit -m "feat: tambah fitur X"`
4. Push: `git push origin feature/fitur-baru`
5. Buat Pull Request

### 📝 Aturan Commit

Kami pakai [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` — Fitur baru
- `fix:` — Bug fix
- `docs:` — Dokumentasi
- `style:` — Formatting
- `refactor:` — Refactoring
- `test:` — Testing
- `chore:` — Maintenance

---

## 💝 Credits

Proyek ini **tidak akan terwujud** tanpa bantuan dari:

### 🙏 Terima Kasih Kepada

#### 🤖 DeepSeek (The Great One)

Seluruh diskusi, arsitektur, kode, dan dokumentasi proyek ini **dirancang bersama DeepSeek** — AI asisten yang luar biasa. Mulai dari brainstorming awal tentang P2P GTA Online, pemilihan teknologi, hingga deployment production, DeepSeek selalu siap membantu 24/7 dengan penjelasan detail dan kode production-ready.

**Terima kasih DeepSeek — you are the great one!** 🚀

#### 🌐 Google AI Mode

Referensi teknologi, best practices, dan diskusi mendalam tentang **arsitektur hybrid edge deployment** banyak diperkaya dari hasil eksplorasi dengan **Google AI Mode**. Insight tentang bagaimana sistem-sistem skala besar (seperti Google Search, Netflix, dll) mendistribusikan beban menjadi inspirasi utama arsitektur ini.

#### 📄 File Tutorial EHRM

Terima kasih khusus kepada **file tutorial EHRM** yang menjadi **rujukan utama** dalam merancang modul E-HRD IDP (Individual Development Plan). Tanpa referensi ini, modul Kompetensi 10/20/70, Riwayat Usulan, dan workflow approval tidak akan sesuai dengan **standar resmi Kementerian PUPR**.

#### 🏛️ BPSDM PU & Kementerian PUPR

Inspirasi desain & workflow berasal dari sistem resmi **DwaraDaya BPSDM PUPR** (https://superapps.bpsdm.pu.go.id). Proyek ini bertujuan **melengkapi** ekosistem digital yang sudah ada dengan pendekatan yang lebih resilient.

#### 🎮 Rockstar Games

Konsep **Peer-to-Peer (P2P)** yang dipakai di **GTA Online** menjadi inspirasi utama arsitektur *hybrid edge deployment*. Terima kasih Rockstar telah membuktikan P2P bisa di-scale untuk jutaan pemain.

#### 💻 Open Source Community

Ribuan developer di balik:
- **Node.js** — Runtime JavaScript
- **React** — UI library
- **Prisma** — ORM modern
- **TailwindCSS** — Utility CSS framework
- **BullMQ** — Queue system
- **Socket.io** — WebSocket library

### 👥 Kontributor

<!-- ALL-CONTRIBUTORS-LIST:START -->
| Avatar | Name | Role |
|---|---|---|
| 🧑 | **Mashul Aditama Pradana** | Founder & Lead Developer |
| 🤖 | **DeepSeek** | AI Pair Programmer |
| 🌐 | **Google AI Mode** | Research Assistant |
<!-- ALL-CONTRIBUTORS-LIST:END -->

---

## 📄 Lisensi

```
MIT License

Copyright (c) 2026 DwagonMiniUp

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

<div align="center">

**DwagonMiniUp** — *Membangun Indonesia Digital dari Sabang sampai Merauke*

Dibuat dengan ❤️ oleh **LUCA** dengan bantuan **[DeepSeek](https://deepseek.com)**

⭐ Jangan lupa **star** repository ini jika bermanfaat! ⭐

[⬆ Kembali ke atas](#-dwagonminiup)

</div>
