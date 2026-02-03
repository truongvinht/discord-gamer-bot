// reactionHandler.js
// handle reactions on message
// ==================

const reaction = (reaction, user) => {
    // user reaction
    if (!user.bot) {
        // deleting message
        if (reaction.emoji.name === '🗑') {
            reaction.message.delete();
        }
    }
};

// export
module.exports = {
    messageReaction: reaction
};
