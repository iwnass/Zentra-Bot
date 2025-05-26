require('../../../.env').config();

odule.exports = (req, res, next) => {
  const apiKey = req.headers['authorization'];

  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  next();
};
