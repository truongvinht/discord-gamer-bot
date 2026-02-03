// reactionListener.js
// handle reaction
// ================

// import
const controller = require('../service/base/reactionHandler');

module.exports = {
    name: 'messageReactionAdd',
    once: false,
    execute: async (reaction, user, client) => {
        // Fetch partial reactions if needed
        if (reaction.partial) {
            try {
                await reaction.fetch();
            } catch (error) {
                console.error('Error fetching reaction:', error);
                return;
            }
        }

        controller.messageReaction(reaction, user);
    }
};
