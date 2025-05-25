const { PermissionFlagsBits } = require("discord.js");

module.exports = {
  name: 'unlock',
  description: 'Locks the current channel and no user can send messages except admins.',
  devOnly: false,
  deleted: false,
  default_member_permissions: PermissionFlagsBits.ManageChannels.toString(),

  callback: async ({ interaction }) => {
    if (!interaction.inGuild()) {
      return interaction.reply({ content: '❌ This command can only be used in a server.', ephemeral: true });
    }

    const channel = interaction.channel;

    try {
      await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
        SendMessages: true,
      });

      await interaction.reply({ content: '🔓 This channel has been unlocked. Everyone can send messages.' });
    } catch (error) {
      console.error('Failed to lock the channel:', error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: '❌ Failed to lock the channel.', ephemeral: true });
      } else {
        await interaction.reply({ content: '❌ Failed to lock the channel.', ephemeral: true });
      }
    }
  },
};
