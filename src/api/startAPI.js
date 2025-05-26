const express = require('express');
const cors = require('cors');

const guildRoutes = require('../api/routes/guilds.js');
const configRoutes = require('../api/routes/config.js');
const authRoutes = require('../api/routes/auth');

function startAPI(client) {
  const app = express();
  const PORT = process.env.API_PORT || 3000;

  app.use(cors());
  app.use(express.json());

  // Inject bot client into all requests
  app.use((req, res, next) => {
    req.client = client;
    next();
  });

  app.use('/guilds', guildRoutes);
  app.use('/guild', configRoutes);
  app.use('/api/auth', authRoutes);

  app.listen(PORT, () => {
    console.log(`✅ API running at http://localhost:${PORT}`);
  });
}

module.exports = startAPI;
