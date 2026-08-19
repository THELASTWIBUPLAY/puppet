Gw cuma mau nuyul beta akses pake puppet😂

# Astrae Oratio — CBT Survey Auto-Fill Bot

Script Puppeteer untuk membantu mengisi otomatis formulir survei aplikasi CBT (Closed Beta Test) game **Astrae Oratio**. Karena proses pendaftaran CBT membutuhkan verifikasi email manual, script ini bekerja dalam **dua fase**: pendaftaran manual (kamu) lalu pengisian survei otomatis (bot).

> ⚠️ **Disclaimer**: Script ini dibuat untuk keperluan pribadi/edukasi. Gunakan dengan bijak dan sesuai Terms of Service platform terkait. Pemilik repo tidak bertanggung jawab atas penyalahgunaan script ini.

---

## 📋 Daftar Isi

- [Fitur](#-fitur)
- [Prasyarat](#-prasyarat)
- [Instalasi](#-instalasi)
- [Struktur File](#-struktur-file)
- [Cara Menjalankan](#-cara-menjalankan)
- [Versi Script](#-versi-script)
- [Kustomisasi Jawaban](#-kustomisasi-jawaban)
- [Troubleshooting](#-troubleshooting)

---

## ✨ Fitur

- Mengisi otomatis semua pertanyaan radio button & checkbox di form survei CBT
- Mendukung pertanyaan dengan batas maksimal pilihan (misal maks 3 checkbox)
- Mengisi kolom komentar bebas (opsional)
- Dua mode jawaban:
  - **Fixed** — jawaban tetap, kamu tentukan sendiri
  - **Random** — kombinasi jawaban acak tiap dijalankan (tetap logis/konsisten, cocok untuk multiple submission)
- Pause otomatis untuk konfirmasi sebelum submit final (mencegah submit tidak sengaja)

---

## 🔧 Prasyarat

- [Node.js](https://nodejs.org) versi LTS terbaru
- Akun email aktif (untuk verifikasi pendaftaran CBT)
- Koneksi internet stabil (Puppeteer akan mengunduh Chromium ~200MB saat instalasi)

---

## 📦 Instalasi

```bash
# 1. Clone atau download repo ini
git clone <url-repo-ini>
cd astrae-oratio-cbt-bot

# 2. Install dependencies
npm init -y
npm install puppeteer
```

---

## 📁 Struktur File

```
.
├── bot-fixed.js     # Versi jawaban tetap (kamu tentukan manual)
├── bot-random.js    # Versi jawaban acak (berbeda tiap run)
└── README.md
```

---

## 🚀 Cara Menjalankan

### 1. Jalankan script

```bash
node bot-fixed.js
# atau
node bot-random.js
```

Browser Chromium akan terbuka otomatis dan menuju halaman utama Astrae Oratio.

### 2. Fase 1 — Pendaftaran Manual

Script akan **pause** dan menunggu kamu menyelesaikan langkah berikut secara manual di browser yang terbuka:

1. Klik tombol **CBT応募 (CBT Application)**
2. Pilih platform: **Google Play** atau **App Store**
3. Masukkan alamat email
4. Klik **認証メール送信 (Kirim email verifikasi)**
5. Buka email, klik link verifikasi
6. Centang semua kotak persetujuan (usia, kebijakan privasi, dll.)
7. Klik **アンケートを始める (Mulai survei)**

> Proses verifikasi email terjadi di luar kendali browser otomatis, sehingga **wajib dilakukan manual**.

### 3. Lanjutkan Bot

Setelah form survei (pertanyaan bernomor) muncul di layar, kembali ke terminal dan tekan **ENTER**.

Bot akan otomatis:
- Mengisi seluruh jawaban survei
- Mengisi kolom komentar (jika ada)
- Menunggu konfirmasi kamu sebelum submit

### 4. Review & Submit

Sebelum submit final, bot akan pause sekali lagi. Periksa semua jawaban di layar, lalu tekan **ENTER** untuk submit.

---

## 🧩 Versi Script

### `bot-fixed.js` — Jawaban Tetap

Semua jawaban didefinisikan secara eksplisit di array `alurSurvei`. Cocok jika kamu ingin submission yang konsisten dan bisa diprediksi.

```javascript
const alurSurvei = [
  { no: 1,  data: ["q01-a01"] },   // Male
  { no: 2,  data: ["q02-a02"] },   // 20s
  // ...
];
```

### `bot-random.js` — Jawaban Acak

Setiap kali dijalankan, kombinasi jawaban berbeda tapi tetap masuk akal (profil gamer subkultur/gacha yang aktif). Cocok untuk multiple submission dengan akun berbeda.

Kombinasi jawaban yang dipilih akan ditampilkan di terminal sebelum bot mulai mengisi form:

```
=== Jawaban yang akan diisi run ini ===
[ ... ]
Komentar: "Looking forward to testing this!"
========================================
```

---

## ✏️ Kustomisasi Jawaban

### Mengubah jawaban fixed

Edit array `alurSurvei` di `bot-fixed.js`. Setiap `value` merujuk ke atribut `value` pada elemen `<input>` di HTML form. Contoh:

```javascript
{ no: 7, data: ["q08-a08", "q08-a09", "q08-a11"] }, // maksimal 3 pilihan
```

### Mengubah pool jawaban random

Edit variabel `*Pool` di `bot-random.js`, misalnya:

```javascript
const genrePool = ["q08-a08", "q08-a09", "q08-a10", "q08-a11"];
```

### Menambah pertanyaan baru

Jika Anthropic/developer mengubah struktur form (menambah pertanyaan baru), lakukan:

1. Buka DevTools (F12) di browser
2. Klik kanan pilihan jawaban yang baru → **Inspect**
3. Salin `outerHTML` dari elemen `<label class="cbt-layer__choice">`
4. Tambahkan `value` baru ke `alurSurvei` sesuai urutan nomor pertanyaan

---

## 🛠️ Troubleshooting

| Masalah | Solusi |
|---|---|
| `Waiting for selector .cbt-layer__survey failed` | Pastikan sudah menyelesaikan pendaftaran manual (Fase 1) sebelum menekan ENTER |
| `⚠️ Value tidak ditemukan / tidak terlihat` | Pertanyaan mungkin berubah struktur; cek HTML terbaru dan update `value` di script |
| Ada pertanyaan yang error "required" saat submit | Kemungkinan ada pertanyaan baru yang belum masuk ke `alurSurvei` — cek dengan DevTools dan tambahkan |
| Chromium gagal terbuka | Jalankan ulang `npm install puppeteer`, pastikan koneksi internet stabil |
| Ingin menghentikan proses paksa | Tekan `Ctrl + C` di terminal |

---

## 📄 Lisensi

Gunakan secara bebas untuk keperluan pribadi. Tidak untuk tujuan komersial atau penyalahgunaan terhadap sistem pihak ketiga.
