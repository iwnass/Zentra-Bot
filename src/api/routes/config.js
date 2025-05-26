const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const verifyAccess = require('../middleware/verifyAccess');

const configFilePath = path.join(__dirname, '../../../data/guild-config.json');

// Helper to load/save config JSON
const loadConfig = () => JSON.parse(fs.readFileSync(configFilePath, 'utf8') || '{}');
const saveConfig = (data) => fs.writeFileSync(configFilePath, JSON.stringify(data, null, 2));

// GET /guild/:id/config — get config for a specific guild
router.get('/:id/config', verifyAccess, (req, res) => {
  const config = loadConfig();
  const guildConfig = config[req.params.id] || {};
  res.json(guildConfig);
});

// POST /guild/:id/config — update config for a specific guild
router.post('/:id/config', verifyAccess, (req, res) => {
  const config = loadConfig();
  config[req.params.id] = req.body;

  try {
    saveConfig(config);
    res.status(200).json({ message: 'Configuration saved successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to save configuration' });
  }
});

module.exports = router;
