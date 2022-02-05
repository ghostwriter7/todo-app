const jwt = require('jsonwebtoken');
const environment = require('../environment/environment');

module.exports = (req, res, next) => {
  try {
    const token = req.headers['token'];
    const { email, id } = jwt.verify(token, environment.SECRET_KEY);

    req.authData = { email, id };

    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized!' });
  }
}
