const { Markup} = require("telegraf");
const config  = require('../utils/config');

module.exports = async (ctx, next) => {
    if (config.ADMINS.some(admin => admin == ctx.from.id)) {
        return next();
    }

     if (config.ADMINS == ctx.from.id) {
        return next();
    }

    if (ctx.callbackQuery?.data === "checkSubscribing") {
        await ctx.deleteMessage();
    }
    let allowedStatuses = ['creator', 'administrator', 'member'];
 
    let channels = config.CHANNELS;
    console.log(channels);
    for (channel of channels) {
        let username = `@${channel}`;
        try {
            const { status } = await ctx.telegram.getChatMember(username, ctx.from.id);
            if (allowedStatuses.includes(status)) {
                channels = channels.filter(c => c !== channel);
            }
        } catch (err) {} 
    } 
    if (!channels.length) {   
        return next();
    }
    const text = "❗️ Botdan to'liq foydalanish imkoniga quyidagi kanallarga a'zo bo'lish orqali erishishingiz mumkin!";

    let keyboard = [];
    for (channel of channels) {
        keyboard.push(
            [Markup.button.url("KANAL +", `https://t.me/@${channel}`)]
        );
    };
    keyboard.push(
        [Markup.button.callback("✅ Tasdiqlash", "checkSubscribing")]
    );
    keyboard =  Markup.inlineKeyboard(keyboard).resize();

    return ctx.reply(text, keyboard);
}