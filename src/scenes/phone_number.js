const { Scenes, Markup } = require("telegraf");
const userModel = require("../models/user.model");

const scene = new Scenes.BaseScene("phone_number");

scene.enter(async (ctx) => {
    try {
        const menu = Markup.keyboard([["🏠 Bosh menuga qaytish"]])
            .resize()
            .oneTime();

        const message = `
📱 *Telefon raqamingizni yuboring*  

📌 _Iltimos, telefon raqamingizni quyidagi formatda yuboring:_  
▫️ +998 90 123 45 67  
▫️ +998 99 876 54 32  

⚠️ _Faqat haqiqiy telefon raqamlarini yuboring!_
        `;

        await ctx.replyWithMarkdown(message, menu);
    } catch (e) {
        console.error("Xatolik:", e);
    }
});

scene.hears("🏠 Bosh menuga qaytish", async (ctx) => {
    await ctx.scene.enter("start");
});

scene.on("text", async (ctx) => {
    try {
        const msg = ctx.message.text;
        const userID = ctx.from.id;

        const user = await userModel.findOne({ userID });

        if (!user) {
            return ctx.reply("❌ Foydalanuvchi ma'lumotlari topilmadi.");
        }

        const balance = user.balance ? `${user.balance} so‘m` : "0 so‘m";

        const message = `
📩 *Yangi foydalanuvchi ma'lumotlari:*  

👤 *User ID:* \`${userID}\`  
📞 *Telefon:* \`${msg}\`  
💰 *Balans:* \`${balance}\`  
        `;

        await ctx.telegram.sendMessage(process.env.GROUP_ID, message, {
            parse_mode: "Markdown",
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: "❌ Rad etish",
                            callback_data: `phone_reject_${userID}`,
                        },
                        {
                            text: "✅ Tasdiqlash",
                            callback_data: `phone_approve_${userID}`,
                        },
                    ],
                ],
            },
        });

        await ctx.reply(
            "✅ Telefon raqamingiz adminga yuborildi. Tez orada hisobingizga pul o'tkaziladi."
        );
        await ctx.scene.enter("start");
    } catch (e) {
        console.error("Xatolik:", e);
        await ctx.reply("❌ Xatolik yuz berdi, qayta urinib ko‘ring.");
    }
});

module.exports = scene;
