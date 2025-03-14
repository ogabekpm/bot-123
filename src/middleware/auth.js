const UserModel = require("../models/user.model")

module.exports = async (ctx, next) => {
    try {
        if (ctx.chat.type === "private") {
            let user = await UserModel.findOne({ userID: ctx.from.id })
            if (!user) {
                user = await UserModel.create({
                    userID: ctx.from.id,
                    telegram: ctx.from,
                })
            }
            ctx.session.user = user
            return next()
        } else {
            next()
        }
    } catch (e) {
        console.log(e)
    }
}
