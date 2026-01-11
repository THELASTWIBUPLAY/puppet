const puppeteer = require("puppeteer");
const readline = require("readline");

const pauseBot = (pesan) => {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    console.log(`\n⚠️  PAUSE: ${pesan}`);
    console.log("👉 Selesaikan di browser atau cek terminal, lalu tekan ENTER untuk lanjut...");
    rl.question("", () => { rl.close(); resolve(); });
  });
};

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 100,
    args: ["--start-maximized"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 768 });

  const alurSurvei = [
    { tipe: "klik", data: ["Confirm"] },
    { tipe: "klik", data: ["PC"] },
    { tipe: "klik", data: ["NVIDIA RTX50 Series or equivalent graphics card (such as RTX 5080/5070)", "Intel Core i5 12th Gen or equivalent processor (such as i5-12600K, i5-12400F)", "32GB"] },
    { tipe: "klik", data: ["No"] },
    { tipe: "klik", data: ["PC"] }, 
    { tipe: "score", data: "1" }, 
    { tipe: "klik", data: ["[Social with Friends] Interacting with known friends and family in the game, playing in teams", "[Character] Obtaining and using your favorite game characters", "[Appearance] Obtaining favorite outfits, mounts, accessories and other cosmetic items"] },
    { tipe: "klik", data: ["Shooter (Counter-Strike 2, Valorant, Call of Duty series, Overwatch 2)", "Visual Novel (Steins;Gate, Danganronpa series, 428: Shibuya Scramble)", "Open World (Cyberpunk 2077, Red Dead Redemption 2, Grand Theft Auto V)"] },
    { tipe: "matrix_score", data: "5" },
    { tipe: "klik", data: ["Playing anime games", "Watching Japanese anime", "Listening to anime music (anime songs, VOCALOID music)"] },
    { tipe: "klik", data: ["ACGN is the center of my life; I'm always immersed in it", "I'm a dedicated enthusiast who enjoys appreciating and recommending quality works to friends"] },
    { tipe: "klik", data: ["Friend recommendations"] },
    { tipe: "klik", data: ["Likes playing games with anime art style", "Interested in open-world urban settings", "High-quality visuals and seamless loading powered by Unreal Engine"] },
    { tipe: "klik", data: ["Friend Recommendations", "Instagram", "YouTube", "Facebook", "X (Twitter)"] },
    { tipe: "klik", data: ["Official physical merchandise (figurines, badges, acrylic stands, etc.)", "Brand crossover collabs (IP collabs, hardware collabs, food & beverage collabs, consumer goods collabs, etc.)", "Player meetups/community collaboration events"] },
    { tipe: "klik", data: ["Male", "2003", "Student", "ikkikurogame371@gmail.com"] },
  ];

  const klikNextPage = async () => {
    const success = await page.evaluate(() => {
      const nextBtn = document.querySelector("div.next-page.control-bar");
      if (nextBtn) {
        nextBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
        ['mousedown', 'mouseup', 'click'].forEach(ev => 
          nextBtn.dispatchEvent(new MouseEvent(ev, { bubbles: true }))
        );
        return true;
      }
      return false;
    });
    if (!success) await pauseBot("Tombol Next tidak ditemukan.");
    else await new Promise(r => setTimeout(r, 2500));
  };

  try {
    const url = "https://survey.pwsdk.com/survey/VjUnUn?uid=2000865396&sign=96290f0db1a57b9070897cb8a2eace4a&timestamp=1767976601&lang=en";
    await page.goto(url, { waitUntil: "networkidle2" });

    for (const langkah of alurSurvei) {
      if (langkah.tipe === "klik") {
        for (const jawaban of langkah.data) {
          const isEmail = jawaban.includes("@");
          if (isEmail) {
            await page.waitForSelector('input', { timeout: 5000 }).catch(() => {});
            await page.click('input[type="email"], input[type="text"]', { clickCount: 3 }).catch(() => {});
            await page.keyboard.press('Backspace');
            await page.type('input[type="email"], input[type="text"]', jawaban, { delay: 30 });
          } else {
            console.log(`Mencari: ${jawaban}`);
            const found = await page.evaluate((text) => {
              const targetTxt = text.toLowerCase().trim();
              
              // --- BAGIAN BARU: MAPPING ID KHUSUS ---
              const specialIds = {
                "pc": ["oid_6", "oid_96"],
                "friend recommendations": ["oid_110"] // Tambahkan ID lain di sini jika gagal
              };

              // Cek apakah jawaban ini ada di mapping ID
              if (specialIds[targetTxt]) {
                for (const id of specialIds[targetTxt]) {
                  const el = document.getElementById(id) || document.querySelector(`label[for="${id}"]`);
                  // Hanya klik jika elemennya terlihat (tidak null)
                  if (el && el.offsetParent !== null) {
                    el.click();
                    if (el.tagName === 'INPUT') {
                      el.checked = true;
                      el.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                    return true;
                  }
                }
              }

              // --- LOGIKA STANDAR (Cari Teks) ---
              const els = Array.from(document.querySelectorAll("label, span, p, div, option, li"));
              const targets = els.filter(el => el.innerText.toLowerCase().trim() === targetTxt);
              
              if (targets.length > 0) {
                targets.forEach(t => { 
                  t.click();
                  const input = t.querySelector('input') || document.getElementById(t.getAttribute('for'));
                  if (input) { 
                    input.checked = true; 
                    input.dispatchEvent(new Event('change', { bubbles: true })); 
                  }
                });
                return true;
              }
              return false;
            }, jawaban);

            if (!found) await pauseBot(`Jawaban "${jawaban}" tidak ditemukan.`);
          }
          await new Promise(r => setTimeout(r, 800));
        }
      } else if (langkah.tipe === "score") {
        const scoreFound = await page.evaluate((s) => {
          const target = document.querySelector(`td[data-score="${s}"] i.score_i, td[data-score="${s}"]`);
          if (target) { target.click(); return true; }
          return false;
        }, langkah.data);
        if (!scoreFound) await pauseBot(`Rating score "${langkah.data}" tidak ditemukan.`);
      } else if (langkah.tipe === "matrix_score") {
        await page.evaluate((s) => {
          const rows = document.querySelectorAll("tr, .matrix-row, .survey-item");
          rows.forEach(row => {
            const cell = row.querySelector(`td[data-score="${s}"]`);
            if (cell) {
              cell.click();
              const input = cell.querySelector('input');
              if (input) input.dispatchEvent(new Event('change', { bubbles: true }));
            }
          });
        }, langkah.data);
      }
      await klikNextPage();
    }
    console.log("Survei Selesai!");
  } catch (error) {
    console.error("Kesalahan Utama:", error.message);
    await pauseBot("Terjadi error fatal.");
  }
})();