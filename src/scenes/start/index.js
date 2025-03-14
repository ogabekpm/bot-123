const { Scenes, Markup } = require("telegraf");
const userModel = require("../../models/user.model");

const scene = new Scenes.BaseScene("start");

scene.enter(async (ctx) => {
    try {
        let first_name = ctx.from.first_name ? ctx.from.first_name : "";
        let last_name = ctx.from.last_name ? ctx.from.last_name : "";

        const menu = Markup.keyboard([
            ["🗳 Ovoz berish"],
            ["💰 Hisobim", "💸 Pul yechib olish"],
            ["💴 Isbot"],
            // ["🎁 Konkurs", "🔗 Referal"],
        ])
            .resize()
            .oneTime();

        txt = `🥳 ${first_name} ${last_name}

🎁 Har bir ovozga  pul mukofoti va Iphone 16 yutib olish uchun ovoz bering.

👇Ovoz berish uchun bosing!👇`;

        try {
            const videoFileID = process.env.FILE_ID;

            text = `BOT AKTIV ISHLAMOQDA ✅

⁉️ BOT ORQALI QANDEY QILIB OVOZ BERISH VIDEODA BATAFSIL KO'RSATILGAN.

🎉 To'g'ri ovoz berganlarga pul shu zahoti o'tkazib berilmoqda!

💰 Ovoz bergan bo'lsangiz ovoz o'tmagan bo'lsa qaytadan ovoz bering.`;

            await ctx.replyWithVideo(videoFileID, {
                caption: text,
                parse_mode: "Markdown",
                reply_markup: menu,
            });
        } catch (e) {}

        await ctx.reply(txt, menu);
    } catch (e) {}
});

scene.on("video", async (ctx) => {
    try {
        const video = ctx.message.video;

        if (!video) {
            return ctx.reply("❌ Video topilmadi, qayta urinib ko‘ring.");
        }

        // Eng tiniq videoni olish (oxirgi element eng yuqori sifatlidir)
        const highestQualityFileID = video.file_id;

        await ctx.reply(`✅ Video qabul qilindi!  
🎥 *File ID:* \`${highestQualityFileID}\``);
    } catch (e) {
        console.error("Xatolik:", e);
        await ctx.reply("❌ Video qabul qilishda xatolik yuz berdi.");
    }
});

scene.hears("🗳 Ovoz berish", async (ctx) => {
    ctx.scene.enter("phone");
});

scene.hears("💰 Hisobim", async (ctx) => {
    try {
        userID = ctx.from.id;

        user = await userModel.findOne({ userID });

        await ctx.reply(`💰 Sizning hisobingiz: ${user.balance} so'm`);
    } catch (e) {}
});

scene.hears("💸 Pul yechib olish", async (ctx) => {
    try {
        const user = await userModel.findOne({ userID: ctx.from.id });

        if (user.balance < 1000) {
            return ctx.reply(
                "❌ Hisobingizda yetarli mablag‘ mavjud emas. Pul yechish uchun minimal 1000 so'm bo'lishi kerak"
            );
        }

        await ctx.reply(
            `💳 Pulni qayerga o'tkazamiz`,
            Markup.inlineKeyboard([
                [Markup.button.callback("💳 Kartaga", `withdraw_card`)],
                [Markup.button.callback("📞 Raqamga", `withdraw_phone`)],
                [Markup.button.callback("❌ Yopish", `withdraw_close`)],
            ])
        );
    } catch (e) {}
});

scene.hears("💴 Isbot", async (ctx) => {
    try {
        await ctx.reply(
            "📌 Isbotlarni ko‘rish uchun quyidagi kanalga o‘ting:",
            {
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: "🔗 Isbotlar kanali",
                                url: "https://t.me/open123_budjet_isbot",
                            },
                        ],
                    ],
                },
            }
        );
    } catch (e) {}
});

scene.on("callback_query", async (ctx) => {
    console.log("Kiritilgan callback:", ctx.callbackQuery.data);
    data = ctx.callbackQuery.data;

    if (data === "withdraw_card") {
        ctx.scene.enter("card");
    } else if (data === "withdraw_phone") {
        ctx.scene.enter("phone_number");
    } else {
        ctx.scene.enter("start");
    }
});

module.exports = scene;
