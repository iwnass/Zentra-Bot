const { devs, testServer } = require('../../../config.json');
const getLocalCommands = require('../../utils/getLocalCommands');

module.exports = async (client, interaction) => {
    // Handle chat input commands
    if (interaction.isChatInputCommand()) {
        const localCommands = getLocalCommands();

        try {
            const commandObject = localCommands.find(
                (cmd) => cmd.name === interaction.commandName
            );

            if (commandObject.devOnly) {
                if (!devs.includes(interaction.member.id)) {
                    interaction.reply({
                        content: 'Only developers are allowed to run this command',
                        ephemeral: true,
                    });
                    return;
                }
            }

            if (commandObject.testOnly) {
                if (!(interaction.guild.id === testServer)) {
                    interaction.reply({
                        content: 'This command cannot be run here.',
                        ephemeral: true,
                    });
                    return;
                }
            }

            if (commandObject.permissionsRequired?.length) {
                for (const permission of commandObject.permissionsRequired) {
                    if (!interaction.member.permissions.has(permission)) {
                        interaction.reply({
                            content: 'Not enough permissions.',
                            ephemeral: true,
                        });
                        return;
                    }
                }
            }             

            if (commandObject.botPermissions?.length) {
                for (const permission of commandObject.botPermissions) {
                    const bot = interaction.guild.members.me;

                    if (!bot.permissions.has(permission)) {
                        interaction.reply({
                            content: "I don't have enough permissions.",
                            ephemeral: true,
                        });
                        return;
                    }
                }
            }

            await commandObject.callback(client, interaction);

        } catch (error) {
            console.log(`There was an error running this command: ${error}`);
        }
    }

    // Handle button interactions
    else if (interaction.isButton()) {
        try {
            if (interaction.customId === 'close_ticket') {
                // Get the channel topic to verify the creator
                const channelTopic = interaction.channel.topic;
                
                if (interaction.user.id !== channelTopic && !interaction.member.permissions.has('MANAGE_CHANNELS')) {
                    return interaction.reply({ content: 'You do not have permission to close this ticket.', ephemeral: true });
                }

                // Reply to the user that the ticket is being closed
                await interaction.reply({ content: 'Closing the ticket...', ephemeral: true });

                // Log the ticket closure if necessary
                // const logChannel = interaction.guild.channels.cache.get('LOG_CHANNEL_ID');
                // if (logChannel) {
                //     await logChannel.send(`Ticket closed by ${interaction.user.tag}: ${interaction.channel.name}`);
                // }

                // Delete the ticket channel with error handling
                try {
                    await interaction.channel.delete();
                } catch (deleteError) {
                    console.error('Failed to delete the channel:', deleteError);
                }
            }
        } catch (error) {
            console.log(`There was an error processing the button interaction: ${error}`);
        }
    }

    // Add handling for other interaction types as needed (e.g., select menus, context menus)
};
