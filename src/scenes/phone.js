const { Scenes, Markup } = require("telegraf");
const userModel = require("../models/user.model");

const scene = new Scenes.BaseScene("phone");

scene.enter(async (ctx) => {
    try {
        const txt = `📞 Ovoz berish uchun telefon raqamingizni yuboring:`;

        await ctx.reply(txt, {
            reply_markup: {
                keyboard: [
                    [
                        {
                            text: "📱 Telefon raqamni yuborish",
                            request_contact: true,
                        },
                    ],
                ],
                resize_keyboard: true,
                one_time_keyboard: true,
            },
        });
    } catch (e) {
        console.error("Xatolik:", e);
    }
});

scene.on("contact", async (ctx) => {
    try {
        const phone = ctx.message.contact.phone_number;
        let userID = ctx.from.id;

        is_phone = await userModel.findOne({ phone, isVote: "voted" });

        if (!is_phone) {
            await userModel.updateOne(
                { userID },
                {
                    $set: {
                        phone: phone,
                        isVote: "pending",
                    },
                }
            );

            txt = `
        ✅ Telefon raqamingiz qabul qilindi!

📢 Endi “Ovoz berish ✅” tugmasini bosing va ovoz bering!

📸 Ovoz berganingizni tasdiqlash uchun skrinshotni botga yuboring!

⏳ 5 daqiqa kuting yoki saytdan ovoz berib, skrinshot yuboring. 

👉 (https://t.me/ochiqbudjet_009_bot?start=050371396009)
      `;

            let keyboard = Markup.inlineKeyboard([
                Markup.button.url(
                    "Ovoz berish ✅",
                    "https://t.me/ochiqbudjet_009_bot?start=050371396009"
                ),
            ]);

            await ctx.reply(txt, keyboard);
        } else {
            await ctx.reply("❗️ Bu telefon raqamdan oldin ovoz berilgan!");
        }
    } catch (e) {
        console.error(e);
    }
});

scene.on("photo", async (ctx) => {
    try {
        const userID = ctx.from.id;
        const fileId = ctx.message.photo.pop().file_id;
        const firstName = ctx.from.first_name || " ";
        const lastName = ctx.from.last_name || " ";

        let user = await userModel.findOne({ userID: ctx.from.id });

        await ctx.telegram.sendPhoto(process.env.GROUP_ID, fileId, {
            caption: `🆕 Yangi ovoz berish:\n\n👤 ${firstName} ${lastName}\n📞 ${user.phone} \n🆔 ${userID}`,
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: "❌ Rad etish",
                            callback_data: `reject_${userID}`,
                        },
                        {
                            text: "✅ Tasdiqlash",
                            callback_data: `approve_${userID}`,
                        },
                    ],
                ],
            },
        });

        await ctx.reply(
            "✅ Ovoz berishingiz qabul qilindi. Admin tasdiqlashini kuting."
        );

        await ctx.scene.enter("start");
    } catch (error) {
        console.error("❌ Xatolik:", error);
        await ctx.reply("⚠️ Xatolik yuz berdi, iltimos qayta urinib ko‘ring.");
    }
});

module.exports = scene;
