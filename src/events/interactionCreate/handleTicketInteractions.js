const { PermissionsBitField } = require('discord.js');

module.exports = async (client, interaction) => {
    if (interaction.isButton()) {
        if (interaction.customId === 'close_ticket') {
            try {
                // Check if the user has permission to close the ticket
                const hasPermission = interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels);
                if (!hasPermission && interaction.user.id !== interaction.channel.topic) {
                    await interaction.reply({ content: 'You do not have permission to close this ticket.', ephemeral: true });
                    return;
                }

                // Reply to the user and indicate that the ticket is being closed
                await interaction.reply({ content: 'Closing the ticket...', ephemeral: true });

                // Delete the ticket channel
                await interaction.channel.delete();

            } catch (error) {
                console.error(`Error processing the button interaction: ${error}`);
            }
        }
    }
};
