// reactionHandler.js
// handle reactions on message
// ==================

const ColorManager = require('./colorManager');
const colorManager = ColorManager.getInstance();

// import
const yuanshenController = require('../yuanshen/yuanshenController');

const reaction = (reaction, user) => {
    const message = reaction.message;

    // user reaction
    if (!user.bot) {
        // deleting message
        if (reaction.emoji.name === '🗑') {
            reaction.message.delete();
            return;
        }

        if (message.embeds.length === 1) {
            const embedMessage = message.embeds[0];

            if (colorManager.yuanshenColor1() === embedMessage.hexColor) {
                yuanshenController.sendReactionMessage(reaction, user);
            }
        }
    }
};

// export
module.exports = {
    messageReaction: reaction
};
