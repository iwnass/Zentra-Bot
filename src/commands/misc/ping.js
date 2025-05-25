module.exports = {
    name: 'ping',
    description: 'pong',
    devOnly: true,
    // testOnly: Boolean,
    // options: Object[],
    deleted: false,

    callback: (client, interaction) => {
        interaction.reply(`Your ping is ${client.ws.ping}ms`);
    },
};
