const { Client, ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");

module.exports = {
    name: 'userdm',
    description: 'Send a direct message to a user through the bot account.',
    devOnly: true,
    deleted: false,
    options: [
        {
            name: 'user',
            description: 'The user you want to DM.',
            type: ApplicationCommandOptionType.User,
            required: true,
        },
        {
            name: 'message',
            description: 'The message to send.',
            type: ApplicationCommandOptionType.String,
            required: true,
        },
        {
            name: 'message_title',
            description: 'The title of the message',
            type: ApplicationCommandOptionType.String,
            required: true,
        },
    ],

    callback: async (client, interaction) => {
        if (!interaction.isChatInputCommand()) return;

        // Get the user and message from the command options
        const targetUser = interaction.options.getUser('user');
        const message = interaction.options.getString('message');
        const title = interaction.options.getString('message_title');

        if (!targetUser) {
            return interaction.reply({ content: 'Could not find the specified user.', ephemeral: true });
        }

        // Create the embed
        const embed = new EmbedBuilder()
            .setColor('#0099ff') // Set the color of the embed (use hex code or color constants)
            .setTitle(title) // Embed title
            .setDescription(message) // The message to be sent
        //  .setFooter({ text: `Message sent by ${interaction.user.tag}` }) // Footer showing the sender
            .setTimestamp(); // Add a timestamp to the embed

        try {
            // Send the embed as a DM to the target user
            await targetUser.send({ embeds: [embed] });
            await interaction.reply({ content: `Direct message to ${targetUser.tag} was sent successfully!`, ephemeral: true });
        } catch (error) {
            console.error('Error sending DM:', error);
            await interaction.reply({ content: 'Failed to send the DM. The user might have DMs disabled or blocked the bot.', ephemeral: true });
        }
    }
};
