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

const pickRandom = (arr, n) => {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
};

const generateRandomSurvei = () => {
  const genderPool = ["q01-a01", "q01-a02"];                          // pria/wanita
  const agePool = ["q02-a02", "q02-a03"];                             // 20an/30an
  const chipsetPool = ["q06-a01", "q06-a02", "q06-a03"];              // device menengah-atas ke atas
  const playtimePool = ["q07-a03", "q07-a04", "q07-a05"];             // 2 jam ke atas (engaged player)
  const genrePool = ["q08-a08", "q08-a09", "q08-a10", "q08-a11"];     // subkultur genres
  const gamePool = ["q09-a05", "q09-a06", "q09-a07", "q09-a09", "q09-a10", "q09-a02"]; // gacha populer
  const importantPool = ["q10-a01", "q10-a02", "q10-a04", "q10-a09", "q10-a13"];       // story/char/graphic/collect/growth
  const storyStylePool = ["q11-a01", "q11-a02"];                      // baca teliti / santai
  const charFactorPool = ["q12-a01", "q12-a04"];                      // daya tarik karakter / peran cerita
  const spendingPool = ["q13-a02", "q13-a03"];                        // pass bulanan / kadang belanja char baru
  const activityPool = ["q14-a03", "q14-a04", "q14-a05", "q14-a06"];  // aktivitas subkultur wajar
  const influencePool = ["q15-a01", "q15-a02", "q15-a03"];            // pengaruh 2D tinggi-sedang

  return [
    { no: 1,  data: pickRandom(genderPool, 1) },
    { no: 2,  data: pickRandom(agePool, 1) },
    { no: 3,  data: ["q03-a01"] },                                    // Asia (fixed)
    { no: 4,  data: ["q04-a02"] },                                    // Android (fixed)
    { no: 5,  data: pickRandom(chipsetPool, 1) },
    { no: 6,  data: pickRandom(playtimePool, 1) },
    { no: 7,  data: pickRandom(genrePool, 3) },
    { no: 8,  data: pickRandom(gamePool, 3) },
    { no: 9,  data: pickRandom(importantPool, 3) },
    { no: 10, data: pickRandom(storyStylePool, 1) },
    { no: 11, data: pickRandom(charFactorPool, 1) },
    { no: 12, data: pickRandom(spendingPool, 1) },
    { no: 13, data: pickRandom(activityPool, 3) },
    { no: 14, data: pickRandom(influencePool, 1) },
  ];
};

const komentarPool = [
  "I hope i get the access",
  "Looking forward to testing this!",
  "Excited to try the CBT, thank you!",
  "Hope I can be part of this test.",
  "Would love to help test and give feedback.",
]; //optional comment text pool, can be empty string if not needed

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 80,
    args: ["--start-maximized"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 768 });

  const alurSurvei = generateRandomSurvei();
  const teksKomentar = komentarPool[Math.floor(Math.random() * komentarPool.length)];

  console.log("=== Jawaban yang akan diisi run ini ===");
  console.log(JSON.stringify(alurSurvei, null, 2));
  console.log(`Komentar: "${teksKomentar}"`);
  console.log("========================================\n");

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
      console.log(`Mengisi pertanyaan no. ${langkah.no}: [${langkah.data.join(', ')}]`);
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