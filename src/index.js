// Import necessary packages and handlers
const eventHandler = require('../src/handlers/eventHandler');
require('dotenv').config();
const { Client, Partials, IntentsBitField, Events, EmbedBuilder } = require("discord.js");
const loadTickets = require('./modules/ticket.js');
const loadSupportVc = require('./modules/supportVc.js');
// const mongoose = require('mongoose');
// const fs = require('fs');

// Create a new Discord client instance
const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildModeration,
        IntentsBitField.Flags.GuildEmojisAndStickers,
        IntentsBitField.Flags.GuildIntegrations,
        IntentsBitField.Flags.GuildWebhooks,
        IntentsBitField.Flags.GuildInvites,
        IntentsBitField.Flags.GuildVoiceStates,
        IntentsBitField.Flags.GuildPresences,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
        IntentsBitField.Flags.GuildMessageReactions,
        IntentsBitField.Flags.GuildMessageTyping,
        IntentsBitField.Flags.GuildScheduledEvents
    ],
    partials: [Partials.Channel],
});


loadTickets(client);
loadSupportVc(client);

(async () => {
    try {
        // await mongoose.connect(process.env.MONGODB_URI);
        // console.log("✅ Connected to DB");

        eventHandler(client);
        client.login(process.env.TOKEN);

    } catch (error) {
        console.log(`Error: ${error}`);
    }
 
})();
