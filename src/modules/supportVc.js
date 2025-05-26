const { ChannelType, PermissionsBitField } = require('discord.js');

const STAFF_ROLE_IDS = [
    '1366187497364783184',
    '1366187174105448571',
];

const JOIN_TRIGGER_VOICE_CHANNEL_ID = '1376206835341725767';
const VOICE_CATEGORY_ID = '1376206801602609335';

// Keep track of created support voice channels (channel IDs)
const createdSupportChannels = new Set();

module.exports = (client) => {
    client.on('voiceStateUpdate', async (oldState, newState) => {
        // 1) User joined the trigger voice channel
        if (newState.channelId === JOIN_TRIGGER_VOICE_CHANNEL_ID) {
            const guild = newState.guild;
            const user = newState.member.user;
            const voiceChannelName = `📞Support-${user.username}`;

            try {
                // Create the private support VC
                const supportChannel = await guild.channels.create({
                    name: voiceChannelName,
                    type: ChannelType.GuildVoice,
                    parent: VOICE_CATEGORY_ID,
                    permissionOverwrites: [
                        { id: guild.id, deny: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.Connect] },
                        { id: user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.Connect] },
                        ...STAFF_ROLE_IDS.map(roleId => ({
                            id: roleId,
                            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.Connect],
                        }))
                    ],
                });

                // Remember the channel for cleanup
                createdSupportChannels.add(supportChannel.id);
                console.log(`✅ Created support VC: ${supportChannel.name}`);

                // Move user to new support channel
                await newState.setChannel(supportChannel);
                console.log(`✅ Moved ${user} to support VC: ${supportChannel.name}`);

            } catch (err) {
                console.error('❌ Error creating/moving support VC:', err);
            }
        }

        // 2) Check if any created support VC became empty after user left
        // This covers the case where user leaves or moves out
        if (oldState.channelId && createdSupportChannels.has(oldState.channelId)) {
            const oldChannel = oldState.guild.channels.cache.get(oldState.channelId);
            if (oldChannel && oldChannel.members.size === 0) {
                try {
                    await oldChannel.delete();
                    createdSupportChannels.delete(oldState.channelId);
                    console.log(`✅ Deleted empty support VC: ${oldChannel.name}`);
                } catch (err) {
                    console.error('❌ Error deleting empty support VC:', err);
                }
            }
        }
    });
    console.log('✅ Support VC module loaded');
};
