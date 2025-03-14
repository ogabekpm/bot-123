require("dotenv").config();

const bot = require("./core/bot");
const session = require("./core/session");
const auth = require("./middleware/auth");
const userModel = require("./models/user.model");
const stage = require("./scenes");
const startBot = require("./utils/startBot");

require("./core/db");

bot.use(session);
bot.use(stage.middleware());
bot.use(auth);

bot.start((ctx) => {
    if (ctx.chat.type === "private") {
        ctx.scene.enter("start");
    }
});

// bot.action("approve", async (ctx) => {
//     await ctx.answerCbQuery();
//     await ctx.reply("✅ Siz tasdiqladingiz!");
// });

bot.action(/^(.+?)_(\d+)$/, async (ctx) => {
    try {
        const action = ctx.match[1]; // "approve", "reject", "card_approve", "card_reject"
        const userID = String(ctx.match[2]);

        console.log(`Callback tugma bosildi: ${action} (${userID})`);

        if (action === "card_approve") {
            let user = await userModel.findOne({ userID });

            if (!user) {
                await ctx.answerCbQuery("❌ Foydalanuvchi topilmadi!", {
                    show_alert: true,
                });
                return;
            }

            const oldBalance = user.balance; // Hozirgi balans

            await userModel.updateOne({ userID }, { $set: { balance: 0 } });

            await bot.telegram.sendMessage(
                userID,
                `✅ ${oldBalance} so'm pulingiz kartaga o'tkazildi!`
            );

            if (ctx.update.callback_query?.message?.message_id) {
                await ctx.editMessageReplyMarkup({});
            }

            await ctx.reply(
                `✅ Siz foydalanuvchi (${userID}) ga ${oldBalance} so'm o'tkazilganini tasdiqladingiz!`
            );
        } 
        
        else if (action === "card_reject") {
            await userModel.updateOne(
                { userID },
                { $set: { isVote: "not_voted" } }
            );

            await bot.telegram.sendMessage(
                userID,
                `❌ Admin pul yechish so'rovingizni rad etdi!`
            );
            await ctx.reply(
                `❌ Siz foydalanuvchi (${userID}) ni rad etdingiz!`
            );
        }

        else if (action === "phone_approve") {
            let user = await userModel.findOne({ userID });

            if (!user) {
                await ctx.answerCbQuery("❌ Foydalanuvchi topilmadi!", {
                    show_alert: true,
                });
                return;
            }

            const oldBalance = user.balance; // Hozirgi balans

            await userModel.updateOne({ userID }, { $set: { balance: 0 } });

            await bot.telegram.sendMessage(
                userID,
                `✅ ${oldBalance} so'm pulingiz paynet qilindi!`
            );

            if (ctx.update.callback_query?.message?.message_id) {
                await ctx.editMessageReplyMarkup({});
            }

            await ctx.reply(
                `✅ Siz foydalanuvchi (${userID}) ga ${oldBalance} so'm paynet qilinganini tasdiqladingiz!`
            );
        } else if (action === "phone_reject") {
            await userModel.updateOne(
                { userID },
                { $set: { isVote: "not_voted" } }
            );

            await bot.telegram.sendMessage(
                userID,
                `❌ Admin paynet so'rovingizni rad etdi!`
            );
            await ctx.reply(
                `❌ Siz foydalanuvchi (${userID}) ni rad etdingiz!`
            );
        } else if (action === "approve") {
            let user = await userModel.findOne({ userID });

            if (!user) {
                await ctx.answerCbQuery("❌ Foydalanuvchi topilmadi!", {
                    show_alert: true,
                });
                return;
            }

            await userModel.updateOne(
                { userID },
                {
                    $set: {
                        isVote: "voted",
                        balance: user.balance + 15000,
                    },
                }
            );

            await bot.telegram.sendMessage(
                userID,
                `✅ Admin ovozingizni tasdiqladi! Hisobingizda ${
                    user.balance + 15000
                } so'm mavjud`
            );

            await ctx.reply(
                `✅ Siz foydalanuvchi (${userID}) ni tasdiqladingiz!`
            );
        } else if (action === "reject") {
            await userModel.updateOne(
                { userID },
                { $set: { isVote: "not_voted" } }
            );

            await bot.telegram.sendMessage(
                userID,
                `❌ Admin ovozingizni rad etdi!`
            );
            await ctx.reply(
                `❌ Siz foydalanuvchi (${userID}) ni rad etdingiz!`
            );
        }

        await ctx.answerCbQuery();
    } catch (e) {
        console.error("Xatolik:", e);
        await ctx.answerCbQuery("❌ Xatolik yuz berdi, qayta urinib ko'ring.", {
            show_alert: true,
        });
    }
});

startBot(bot);
console.log(`🚀  Bot started! => https://t.me/${process.env.BOT_USERNAME}`);
