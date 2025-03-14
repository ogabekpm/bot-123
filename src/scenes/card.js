const { Scenes, Markup } = require("telegraf");
const userModel = require("../models/user.model");

const scene = new Scenes.BaseScene("card");

scene.enter(async (ctx) => {
    try {
        const menu = Markup.keyboard([["🏠 Bosh menuga qaytish"]])
            .resize()
            .oneTime();

        const message = `
💳 *Karta raqam yuboring*  

📌 _Iltimos, karta raqamingizni quyidagi formatda yuboring:_  
▫️ 8600 1234 5678 9012  
▫️ 9860 9876 5432 1098  

⚠️ _Faqat haqiqiy karta raqamlarini yuboring!_
        `;

        await ctx.replyWithMarkdown(message, menu);
    } catch (e) {
        console.error("Xatolik:", e);
    }
});

scene.hears("🏠 Bosh menuga o'tish", async (ctx) => {
    scene.enter("start");
});

scene.on("text", async (ctx) => {
    try {
        const msg = ctx.message.text;
        const userID = ctx.from.id;

        const user = await userModel.findOne({ userID });

        if (!user) {
            return ctx.reply("❌ Foydalanuvchi ma'lumotlari topilmadi.");
        }

        const phone = user.phone || "Noma'lum";
        const balance = user.balance ? `${user.balance} so‘m` : "0 so‘m";

        const message = `
📩 *Yangi foydalanuvchi ma'lumotlari:*  

👤 *User ID:* \`${userID}\`  
📞 *Telefon:* \`${phone}\`  
💳 *Karta:* \`${msg}\`  
💰 *Balans:* \`${balance}\`  
        `;

        await ctx.telegram.sendMessage(process.env.GROUP_ID, message, {
            parse_mode: "Markdown",
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: "❌ Rad etish",
                            callback_data: `card_reject_${userID}`,
                        },
                        {
                            text: "✅ Tasdiqlash",
                            callback_data: `card_approve_${userID}`,
                        },
                    ],
                ],
            },
        });

        await ctx.reply("✅ Ma'lumotlaringiz adminga yuborildi. Tez orqada hisobingizga pul tashlanadi");
        await ctx.scene.enter("start");
    } catch (e) {
        console.error("Xatolik:", e);
        await ctx.reply("❌ Xatolik yuz berdi, qayta urinib ko‘ring.");
    }
});



module.exports = scene;
