const { Scenes } = require("telegraf");

const stage = new Scenes.Stage([
    require('./start'),
    require('./phone'),
    require('./card'),
    require('./phone_number'),
]);

module.exports = stage;