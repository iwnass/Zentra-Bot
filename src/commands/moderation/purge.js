const { PermissionFlagsBits } = require("discord.js");

module.exports = {
  name: 'purge',
  description: 'Deletes a number of recent messages from the current channel. (Max 100)',
  devOnly: false,
  deleted: false,
  default_member_permissions: PermissionFlagsBits.ManageMessages.toString(),

  options: [
    {
      name: 'amount',
      description: 'Number of messages to delete (1–100)',
      type: 4, // INTEGER
      required: true,
    },
  ],

  callback: async ({ interaction }) => {
    if (!interaction.inGuild()) {
      return interaction.reply({ content: '❌ This command can only be used in a server.', ephemeral: true });
    }

    const amount = interaction.options.getInteger('amount');

    if (amount < 1 || amount > 100) {
      return interaction.reply({
        content: '❌ Please specify a number between 1 and 100.',
        ephemeral: true,
      });
    }

    try {
      const deleted = await interaction.channel.bulkDelete(amount, true);
      await interaction.reply({
        content: `✅ Successfully deleted ${deleted.size} message(s).`,
        ephemeral: true,
      });
    } catch (error) {
      console.error('Failed to purge messages:', error);
      await interaction.reply({
        content: '❌ Failed to delete messages. Messages older than 14 days cannot be deleted.',
        ephemeral: true,
      });
    }
  },
};
