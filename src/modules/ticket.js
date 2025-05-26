const {
    EmbedBuilder,
    StringSelectMenuBuilder,
    PermissionsBitField,
    ActionRowBuilder,
    ChannelType,
    MessageFlags,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js');
const sourcebin = require('sourcebin_js');

const STAFF_ROLE_IDS = [
    '1366187497364783184',
    '1366187174105448571',
];
const TICKET_CATEGORY_ID = '1373000105963032702';
const LOG_CHANNEL_ID = '1373000146786451497';

const userCooldowns = {};
const activeTickets = {};

module.exports = (client) => {
    client.on('messageCreate', async message => {
        if (message.content.startsWith('!ticket')) {
            if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                await message.delete();
                return;
            }

            const embed = new EmbedBuilder()
                .setColor('#412d9a')
                .setAuthor({
                    name: message.guild.name,
                    iconURL: message.guild.iconURL() || 'https://cdn.discordapp.com/icons/000000000000000000/unknown.png'
                })
                .setDescription("**```To enhance your experience, please select the type of ticket that best corresponds to your inquiry.```**");

            const actionRow = new ActionRowBuilder()
                .addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('select_ticket')
                        .setPlaceholder('Choose a ticket type')
                        .addOptions([
                            {
                                label: 'Support',
                                description: 'Get help with technical or product issues',
                                emoji: '❓',
                                value: 'Support'
                            }
                        ])
                );

            await message.channel.send({ embeds: [embed], components: [actionRow] });
            await message.delete();
        }
    });

    client.on('interactionCreate', async interaction => {
        if (interaction.isStringSelectMenu()) {
            const userId = interaction.user.id;
            const currentTime = Date.now();

            if (interaction.customId === 'select_ticket') {
                if (userCooldowns[userId] && currentTime < userCooldowns[userId]) {
                    const remainingTime = Math.ceil((userCooldowns[userId] - currentTime) / 1000);
                    return await interaction.reply({
                        content: `You need to wait ${remainingTime} seconds before opening a new ticket.`,
                        flags: MessageFlags.Ephemeral
                    });
                }

                const ticketNames = {
                    'Support': '❓support',
                };

                const guild = interaction.guild;
                const user = interaction.user;
                const ticketType = interaction.values[0];
                const ticketName = `${ticketNames[ticketType]}-${user.username}`.toLowerCase();

                const channel = await guild.channels.create({
                    name: ticketName,
                    type: ChannelType.GuildText,
                    parent: TICKET_CATEGORY_ID,
                    permissionOverwrites: [
                        {
                            id: guild.id,
                            deny: [PermissionsBitField.Flags.ViewChannel]
                        },
                        {
                            id: user.id,
                            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages]
                        },
                        ...STAFF_ROLE_IDS.map(roleId => ({
                            id: roleId,
                            allow: [PermissionsBitField.Flags.ViewChannel],
                            type: 'role'
                        }))
                    ]
                });

                activeTickets[channel.id] = userId;

                const ticketEmbed = new EmbedBuilder()
                    .setColor('#412d9a')
                    .setAuthor({
                        name: guild.name,
                        iconURL: guild.iconURL() || 'https://cdn.discordapp.com/icons/000000000000000000/unknown.png'
                    })
                    .setDescription("**```Please explain the reason for opening this ticket.\nTo close the ticket, please click the button below.```**");

                const closeButton = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('close_ticket')
                        .setLabel('Close Ticket')
                        .setStyle(ButtonStyle.Danger)
                );

                await channel.send({
                    content: `<@${user.id}>`,
                    embeds: [ticketEmbed],
                    components: [closeButton]
                });

                userCooldowns[userId] = Date.now() + 60000; // 1 min cooldown
                await interaction.reply({
                    content: `Ticket created: ${channel.toString()}`,
                    flags: MessageFlags.Ephemeral
                });

                const logChannel = guild.channels.cache.get(LOG_CHANNEL_ID);
                if (logChannel) {
                    const logEmbed = new EmbedBuilder()
                        .setColor('#4dc675')
                        .setTitle("`Ticket Opened`")
                        .setDescription(`**Channel:** <#${channel.id}>\n**User:** <@${user.id}>\n**Ticket Type:** ${ticketType}`);
                    await logChannel.send({ embeds: [logEmbed] });
                }
            }
        }

        if (interaction.isButton()) {
            if (interaction.customId === 'close_ticket') {
                const hasStaffRole = STAFF_ROLE_IDS.some(roleId =>
                    interaction.member.roles.cache.has(roleId)
                );
                const isAdmin = interaction.member.permissions.has(PermissionsBitField.Flags.Administrator);

                if (!hasStaffRole && !isAdmin) {
                    return interaction.reply({
                        content: 'You do not have permission to close this ticket.',
                        flags: MessageFlags.Ephemeral
                    });
                }

                const channel = interaction.channel;
                const userId = activeTickets[channel.id];
                const closerUsername = interaction.user.username;

                const messages = await channel.messages.fetch({ limit: 100 });
                const formattedTranscript = messages.map(m => {
                    const timestamp = new Date(m.createdTimestamp).toLocaleString('en-US', {
                        year: 'numeric', month: '2-digit', day: '2-digit',
                        hour: '2-digit', minute: '2-digit', second: '2-digit',
                        hour12: true
                    });

                    let messageContent = m.content;
                    if (m.embeds.length > 0) messageContent = "(Bot Message - Unable to Display Embed Content)";
                    if (m.attachments.size > 0) messageContent = "(File Attached - Unable to Preview)";

                    return `${timestamp} - ${m.author.username}: ${messageContent}`;
                }).reverse().join('\n');

                let bin;
                try {
                    bin = await sourcebin.create([{
                        name: 'transcript.txt',
                        content: formattedTranscript,
                        languageId: 'text'
                    }], {
                        title: `Transcript for Ticket ${channel.id}`,
                        description: `Transcript of ticket closed by ${closerUsername}`
                    });
                } catch (error) {
                    console.error('SourceBin Error:', error);
                }

                const transcriptUrl = bin?.url || 'https://sourceb.in/';

                const transcriptButton = new ButtonBuilder()
                    .setLabel('View Transcript')
                    .setStyle(ButtonStyle.Link)
                    .setURL(transcriptUrl);

                const actionRow = new ActionRowBuilder().addComponents(transcriptButton);

                const logChannel = interaction.guild.channels.cache.get(LOG_CHANNEL_ID);
                if (logChannel) {
                    const logEmbed = new EmbedBuilder()
                        .setColor('#992e22')
                        .setTitle("`Ticket Closed`")
                        .setDescription(`**Channel:** <#${channel.id}>\n**Opened By:** <@${userId}>\n**Closed By:** <@${interaction.user.id}>`);
                    await logChannel.send({ embeds: [logEmbed], components: [actionRow] });
                }

                delete activeTickets[channel.id];
                delete userCooldowns[userId]; // 🛠️ allow them to create a new ticket

                // ⏱️ Delay deletion to avoid race conditions
                setTimeout(() => {
                    channel.delete().catch(console.error);
                }, 3000);
            }
        }
    });

    console.log('✅ Ticket Module Loaded');
};
