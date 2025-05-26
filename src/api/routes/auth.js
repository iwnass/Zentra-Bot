const express = require('express');
const router = express.Router();

// Handle Discord OAuth callback
router.post('/discord/callback', async (req, res) => {
  const { code } = req.body;
  
  try {
    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.DISCORD_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: process.env.DISCORD_REDIRECT_URI,
      }),
    });
    
    const tokens = await tokenResponse.json();
    res.json(tokens);
  } catch (error) {
    res.status(500).json({ error: 'Authentication failed' });
  }
});

router.get('/callback', (req, res) => {
  const { code, error } = req.query;
  
  if (error) {
    res.send('<script>window.close();</script>');
    return;
  }
  
  // Send the code back to your Electron app
  res.send(`
    <script>
      window.opener.postMessage({ code: '${code}' }, '*');
      window.close();
    </script>
  `);
});

module.exports = router;