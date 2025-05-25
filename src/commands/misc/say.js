const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'say',
    description: 'Sends an embedded message.',
    devOnly: true,
    testOnly: false,
    permissionsRequired: [],
    botPermissions: [
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.EmbedLinks,
    ],
    options: [
        {
            name: 'title',
            description: 'The title of the embed',
            type: 3, // STRING type
            required: true,
        },
        {
            name: 'description',
            description: 'The description text of the embed (use \\n for new lines)',
            type: 3, // STRING type
            required: true,
        },
        {
            name: 'footer',
            description: 'The footer text of the embed',
            type: 3, // STRING type
            required: true,
        },
    ],
    callback: async (client, interaction) => {
        if (!interaction.isCommand()) return;

        const title = interaction.options.getString('title');
        const description = interaction.options.getString('description').replace(/\\n/g, '\n');
        const footer = interaction.options.getString('footer');

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle(title)
            .setDescription(description)
            .setFooter({ text: footer })
            .setTimestamp();

        try {
            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Failed to send embed:', error);
            await interaction.reply({ content: 'There was an error sending the embed.', ephemeral: true });
        }
    },
};
