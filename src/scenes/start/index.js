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
            // ["🎁 Konkurs", "🔗 Referal"],
        ])
            .resize()
            .oneTime();

        txt = `🥳 ${first_name} ${last_name}

🎁 Har bir ovozga  pul mukofoti va Iphone 16 yutib olish uchun ovoz bering.

👇Ovoz berish uchun bosing!👇`;

        await ctx.reply(txt, menu);
    } catch (e) {}
});

scene.hears("🗳 Ovoz berish", async (ctx) => {
    ctx.scene.enter("phone");
});

scene.hears("💰 Hisobim", async (ctx) => {
    userID = ctx.from.id;

    user = await userModel.findOne({ userID });

    await ctx.reply(`💰 Sizning hisobingiz: ${user.balance} so'm`);
});

scene.hears("💸 Pul yechib olish", async (ctx) => {
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
