const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch({ headless: false, slowMo: 100 });
  const page = await browser.newPage();

  await page.goto("URL_SURVEI_ANDA", { waitUntil: "networkidle2" });

  // Fungsi untuk memilih jawaban secara acak di halaman saat ini
  const isiRandomDanNext = async () => {
    await page.evaluate(() => {
      // 1. Cari semua kontainer pertanyaan (biasanya dalam class tertentu atau div)
      // Jika strukturnya adalah list pilihan, kita ambil elemen radio-nya
      const radioGroups = document.querySelectorAll(
        ".survey-question-container, .question-item, fieldset"
      );

      // Jika tidak ditemukan container spesifik, kita cari semua radio button yang ada
      const allRadios = Array.from(
        document.querySelectorAll('input[type="radio"], .radio-label, label')
      );

      // Logika: Jika ada banyak pilihan, kita pilih satu secara acak
      // Kita bisa mengelompokkan berdasarkan nama input jika ada
      if (allRadios.length > 0) {
        const randomIdx = Math.floor(Math.random() * allRadios.length);
        allRadios[randomIdx].click();
      }
    });

    console.log("Jawaban acak dipilih.");

    // 2. Klik tombol Next
    await page.evaluate(() => {
      // 1. Cari semua checkbox di halaman
      const checkboxes = Array.from(
        document.querySelectorAll('input[type="checkbox"], .checkbox-label')
      );

      if (checkboxes.length > 0) {
        // Tentukan berapa banyak yang ingin dicentang (misal: 2 pilihan)
        const jumlahPilihan = 2;

        // Acak urutan array checkbox
        const shuffled = checkboxes.sort(() => 0.5 - Math.random());

        // Klik N elemen pertama dari hasil acak
        shuffled.slice(0, jumlahPilihan).forEach((el) => el.click());
      }
    });
  };

  // Jalankan fungsi ini berulang kali (misal untuk 10 halaman)
  for (let i = 0; i < 10; i++) {
    await isiRandomDanNext();
    await new Promise((r) => setTimeout(r, 2000)); // Tunggu loading halaman
  }
})();
