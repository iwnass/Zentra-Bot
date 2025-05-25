//Made by iwnas

const { Client, ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");

module.exports = {
    name: 'massdm',
    description: 'Send a direct message to all users in the server through the bot account.',
    devOnly: true,
    deleted: false,
    options: [
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
        {
            name: 'exclude_bots',
            description: 'Whether to exclude bots from the mass DM (default: true)',
            type: ApplicationCommandOptionType.Boolean,
            required: false,
        },
    ],
    callback: async (client, interaction) => {
        if (!interaction.isChatInputCommand()) return;

        // Get the message and title from the command options
        const message = interaction.options.getString('message');
        const title = interaction.options.getString('message_title');
        const excludeBots = interaction.options.getBoolean('exclude_bots') ?? true;

        // Defer the reply since this might take a while
        await interaction.deferReply({ ephemeral: true });

        try {
            // Fetch all members of the guild
            const guild = interaction.guild;
            await guild.members.fetch(); // Ensure all members are cached
            
            const members = guild.members.cache;
            
            // Filter out bots if requested (default behavior)
            const targetMembers = excludeBots 
                ? members.filter(member => !member.user.bot)
                : members;

            // Create the embed
            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle(title)
                .setDescription(message)
                .setTimestamp();

            let successCount = 0;
            let failCount = 0;
            const failedUsers = [];

            // Convert to array for batch processing
            const memberArray = Array.from(targetMembers.values());
            const batchSize = 1000; 
            const delayBetweenBatches = 1000; // 1 second delay between batches

            // Process members in batches
            for (let i = 0; i < memberArray.length; i += batchSize) {
                const batch = memberArray.slice(i, i + batchSize);
                
                // Process current batch concurrently
                const promises = batch.map(async (member) => {
                    try {
                        await member.send({ embeds: [embed] });
                        return { success: true, member };
                    } catch (error) {
                        console.error(`Failed to send DM to ${member.user.tag}:`, error.message);
                        return { success: false, member, error };
                    }
                });

                // Wait for all promises in current batch to complete
                const results = await Promise.allSettled(promises);
                
                // Process results
                results.forEach((result) => {
                    if (result.status === 'fulfilled') {
                        if (result.value.success) {
                            successCount++;
                        } else {
                            failCount++;
                            failedUsers.push(result.value.member.user.tag);
                        }
                    } else {
                        failCount++;
                        console.error('Promise rejected:', result.reason);
                    }
                });

                // Update progress every few batches
                if (i % (batchSize * 3) === 0) {
                    await interaction.editReply({ 
                        content: `Processing... ${Math.min(i + batchSize, memberArray.length)}/${memberArray.length} members processed.` 
                    });
                }

                // Delay between batches to respect rate limits (except for last batch)
                if (i + batchSize < memberArray.length) {
                    await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
                }
            }

            // Create summary message
            let summaryMessage = `Mass DM completed!\n✅ Successfully sent: ${successCount}\n❌ Failed to send: ${failCount}`;
            
            if (failedUsers.length > 0 && failedUsers.length <= 10) {
                summaryMessage += `\n\nFailed users: ${failedUsers.join(', ')}`;
            } else if (failedUsers.length > 10) {
                summaryMessage += `\n\nFailed users: ${failedUsers.slice(0, 10).join(', ')} and ${failedUsers.length - 10} more...`;
            }

            await interaction.editReply({ content: summaryMessage });

        } catch (error) {
            console.error('Error during mass DM:', error);
            await interaction.editReply({ 
                content: 'An error occurred while trying to send mass DMs. Please check the console for details.' 
            });
        }
    }
};