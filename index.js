// index.js - Gelişmiş Bot Sürü Yönetimi (Login/Register Kaldırıldı)

// Gerekli Kütüphaneleri İçeri Aktar
const mineflayer = require("mineflayer");
const pathfinder = require("mineflayer-pathfinder").pathfinder;
const Movements = require("mineflayer-pathfinder").Movements;
const { goals } = require("mineflayer-pathfinder");

// --- GENEL AYARLAR ---
// ÖNEMLİ: TEST İÇİN BOT SAYISINI DÜŞÜK TUTUN!
const BOT_COUNT = 1;
const BASE_USERNAME = "Taha";
// const botPassword = 'P1345707'; // Artık gerekli değil
const BOT_START_DELAY = 5000; // Her botun arasında 5 saniye bekleme (Bot Algılamayı Azaltır)

const botOptionsTemplate = {
    host: "emiroc.aternos.me",
    port: 25565,
    version: "1.20.1",
};

// --- ANA BOT OLUŞTURMA FONKSİYONU ---

/**
 * Belirtilen isimle bir bot oluşturur ve sunucuya bağlar.
 * @param {number} id - Botun benzersiz numarası
 */
function createBot(id) {
    const paddedId = String(id).padStart(3, "0"); // Örnek: 001, 002
    const username = BASE_USERNAME + paddedId;

    const botOptions = {
        ...botOptionsTemplate,
        username: username,
    };

    const bot = mineflayer.createBot(botOptions);
    const log = (message) => console.log(`[BOT ${paddedId}] ${message}`);

    // --- OLAY İŞLEYİCİLERİ ---

    bot.on("inject_allowed", () => {
        // Pathfinder eklentisini yükle
        bot.loadPlugin(pathfinder);
    });

    bot.on("login", () => {
        log(`✅ Sunucuya katıldı.`);
    });

    // Rastgele hareket döngüsü başlat (Bot haritaya yüklendiğinde)
    bot.on("spawn", () => {
        log("Bot spawn oldu, rastgele hareketlere başlıyor.");
        startMovementLoop(bot, log);

        // Hoş geldin/hazır mesajı (artık girişten bağımsız)
        setTimeout(() => {
            bot.chat(`Sunucudayım! Benim ID'im: ${paddedId}`);
        }, 3000);
    });

    bot.on("chat", (username, message) => {
        if (username === bot.username) return;

        // --- Giriş/Kayıt MANTIKLARI KALDIRILDI ---
        // Sadece komut işleyici kalıyor

        // Komut İşleyici
        if (message === `!koordinat ${paddedId}`) {
            const pos = bot.entity.position;
            const coords = `X: ${pos.x.toFixed(1)}, Y: ${pos.y.toFixed(1)}, Z: ${pos.z.toFixed(1)}`;
            bot.chat(`Şu anki koordinatlarım: ${coords}`);
        }
    });

    bot.on("end", (reason) => {
        log(`❌ Sunucudan ayrıldı. Sebep: ${reason}`);

        // YALNIZCA İlk 5 bot uzun bir gecikmeden sonra tekrar denesin
        if (id <= 5) {
            const RECONNECT_DELAY = 30000; // 30 saniye
            log(
                `🔄 ${RECONNECT_DELAY / 1000} saniye sonra tekrar bağlanmayı deniyorum...`,
            );
            setTimeout(() => {
                createBot(id); // Botu aynı ID ile yeniden oluştur
            }, RECONNECT_DELAY);
        }
    });

    bot.on("error", (err) => {
        log(`🛑 Hata: ${err.message}`);
    });

    bot.on("kicked", (reason) => {
        log(`💥 Sunucudan atıldı! Sebep: ${reason}`);
    });
}

// --- RASTGELE HAREKET MANTIĞI (Antideksiyon) ---

function startMovementLoop(bot, log) {
    // 10 ila 30 saniye arasında rastgele aralıklarla hareket et
    const delay = Math.random() * 20000 + 10000;

    setTimeout(() => {
        if (!bot.entity) return;

        // Mevcut konum etrafında rastgele bir hedef belirle (5 ila 15 blok yarıçap)
        const randomRadius = Math.floor(Math.random() * 10) + 5;
        const targetX =
            bot.entity.position.x +
            (Math.random() < 0.5 ? randomRadius : -randomRadius);
        const targetZ =
            bot.entity.position.z +
            (Math.random() < 0.5 ? randomRadius : -randomRadius);

        // Yüksekliği (Y) botun bulunduğu blok seviyesinde tut
        const targetY = bot.entity.position.y;

        // Hedef koordinatına gitme görevini ata
        const mcData = require("mineflayer-pathfinder").get;
        bot.pathfinder.setMovements(new Movements(bot, mcData));
        bot.pathfinder.goto(new goals.GoalNear(targetX, targetY, targetZ, 2)); // Hedefin 2 blok yakınına git

        log(
            `Rastgele bir noktaya doğru yürümeye başladı (X:${targetX.toFixed(1)} Z:${targetZ.toFixed(1)}).`,
        );

        // Bir sonraki döngüyü başlat
        startMovementLoop(bot, log);
    }, delay);
}

// --- BOTLARI BAŞLATMA DÖNGÜSÜ (Yavaşlatılmış) ---

function startAllBots() {
    console.log(
        `\n--- ${BOT_COUNT} Adet Bot Başlatılıyor (${BOT_START_DELAY / 1000} saniye aralıklarla) ---`,
    );
    for (let i = 1; i <= BOT_COUNT; i++) {
        // Her botu ayrı bir gecikmeyle başlatıyoruz
        setTimeout(() => {
            createBot(i);
        }, i * BOT_START_DELAY);
    }
}

// Tüm botları başlat
startAllBots();
