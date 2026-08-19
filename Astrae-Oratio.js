const puppeteer = require("puppeteer");
const readline = require("readline");

const pauseBot = (pesan) => {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    console.log(`\n⚠️  PAUSE: ${pesan}`);
    console.log("👉 Selesaikan manual di browser, lalu tekan ENTER untuk lanjut...");
    rl.question("", () => { rl.close(); resolve(); });
  });
};

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 80,
    args: ["--start-maximized"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 768 });

  const alurSurvei = [
  { no: 1,  data: ["q01-a01"] },                            // Male
  { no: 2,  data: ["q02-a02"] },                             // 20s
  { no: 3,  data: ["q03-a01"] },                             // Asia
  { no: 4,  data: ["q04-a02"] },                             // Android
  { no: 5,  data: ["q06-a01"] },                             // Snapdragon 8 Elite
  { no: 6,  data: ["q07-a05"] },                             // More than 4 hours
  { no: 7,  data: ["q08-a08", "q08-a11", "q08-a09"] },       // Subculture genres (max 3)
  { no: 8,  data: ["q09-a09", "q09-a10", "q09-a02"] },       // Blue Archive, Narushio, Uma Musume
  { no: 9,  data: ["q10-a02", "q10-a09", "q10-a01"] },       // Characters, Collection, Story
  { no: 10, data: ["q11-a01"] },                             // Take your time reading
  { no: 11, data: ["q12-a01"] },                             // Character appeal
  { no: 12, data: ["q13-a03"] },                             // Sometimes spend on new chars
  { no: 13, data: ["q14-a04", "q14-a05", "q14-a06"] },       // Anime, music, communities
  { no: 14, data: ["q15-a01"] },                             // 2D very important
];

const teksKomentar = "I hope i get the access"; // optional comment text, can be empty string if not needed

  const pilihValue = async (values) => {
    for (const val of values) {
      const found = await page.evaluate((v) => {
        const input = document.querySelector(`input[value="${v}"]`);
        if (input && input.offsetParent !== null) {
          input.click();
          if (!input.checked) {
            input.checked = true;
            input.dispatchEvent(new Event('change', { bubbles: true }));
          }
          return true;
        }
        return false;
      }, val);
      if (!found) console.log(`⚠️  Value "${val}" tidak ditemukan / tidak terlihat.`);
      await new Promise(r => setTimeout(r, 350));
    }
  };

  try {
    const url = "https://astraeoratio.plaync.com/ja-jp/index";
    await page.goto(url, { waitUntil: "networkidle2" });

    await pauseBot(
      "Silakan lakukan manual: pilih Google Play/App Store, isi email, " +
      "verifikasi via email, centang semua persetujuan, lalu klik 'アンケートを始める'. " +
      "Setelah form survei (pertanyaan no.1 dst) muncul, tekan ENTER di sini."
    );

    await page.waitForSelector('.cbt-layer__survey', { timeout: 15000 });
    console.log("Form survei terdeteksi, mulai mengisi otomatis...");

    for (const langkah of alurSurvei) {
      console.log(`Mengisi pertanyaan no. ${langkah.no}...`);
      await pilihValue(langkah.data);
    }

    if (teksKomentar.trim().length > 0) {
      await page.click('.cbt-layer__textarea');
      await page.type('.cbt-layer__textarea', teksKomentar, { delay: 25 });
    }

    console.log("Semua jawaban terisi.");
    await new Promise(r => setTimeout(r, 800));

    await pauseBot("Cek semua jawaban. Tekan ENTER untuk SUBMIT sekarang.");

    const submitClicked = await page.evaluate(() => {
      const btn = document.querySelector('.cbt-layer__primary-button');
      if (btn) { btn.click(); return true; }
      return false;
    });

    if (submitClicked) {
      console.log("✅ Survei berhasil di-submit!");
    } else {
      await pauseBot("Tombol submit tidak ditemukan, silakan klik manual.");
    }

    await new Promise(r => setTimeout(r, 2000));
  } catch (error) {
    console.error("Kesalahan Utama:", error.message);
    await pauseBot("Terjadi error fatal.");
  }
})();