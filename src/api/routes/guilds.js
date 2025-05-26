const express = require('express');
const router = express.Router();
const verifyAccess = require('../middleware/verifyAccess');

// GET /guilds — return bot's joined guilds
router.get('/', verifyAccess, (req, res) => {
  const guilds = req.client.guilds.cache.map(g => ({
    id: g.id,
    name: g.name,
    icon: g.iconURL(),
    memberCount: g.memberCount
  }));
  res.json(guilds);
});

// GET /guilds/:id/members — return members of a specific guild
router.get('/:id/members', verifyAccess, async (req, res) => {
  try {
    const guild = req.client.guilds.cache.get(req.params.id);
    if (!guild) return res.status(404).json({ error: 'Guild not found' });

    await guild.members.fetch(); // ensure members are cached
    const members = guild.members.cache.map(m => ({
      id: m.id,
      username: m.user.username,
      tag: m.user.tag,
      joinedAt: m.joinedAt,
      roles: m.roles.cache.map(r => r.name)
    }));

    res.json(members);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch members' });
  }
});

router.get('/guild/:id/audit-logs', async (req, res) => {
    try {
        const guild = client.guilds.cache.get(req.params.id);
        if (!guild) return res.status(404).json({ error: 'Guild not found' });

        const logs = await guild.fetchAuditLogs({ limit: 25 }); // or customize the limit/type
        const entries = logs.entries.map(entry => ({
            action: entry.action,
            target: entry.target?.id,
            executor: entry.executor?.tag,
            reason: entry.reason,
            createdAt: entry.createdAt,
        }));

        res.json(entries);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch audit logs' });
    }
});

// Check which guilds have Zentra bot
router.post('/with-zentra', async (req, res) => {
  const { guild_ids } = req.body;
  
  try {
    // Access your bot client (you'll need to pass this in or import it)
    const botGuilds = req.app.locals.client.guilds.cache.map(guild => guild.id);
    const zentraGuilds = guild_ids.filter(id => botGuilds.includes(id));
    
    res.json(zentraGuilds);
  } catch (error) {
    res.status(500).json({ error: 'Failed to check guilds' });
  }
});

module.exports = router;
