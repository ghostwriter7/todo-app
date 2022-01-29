const express = require('express');
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const environment = require("../environment/environment");

const router = express.Router();

router.post('/login', (req, res, next) => {
  const { email, password } = req.body;
  let id;

  User.findOne({ email }).then((doc) => {
    if (!doc) {
      throw new Error('No account associated with this e-mail!');
    }
    id = doc._id;

    return bcrypt.compare(password, doc.password);
  }).then((valid) => {
    if (valid) {
      const token = jwt.sign({ email, id }, environment.SECRET_KEY, { expiresIn: '1h' }, undefined);
      return res.status(200).json({ email, id, token });
    } else {
      throw new Error('Invalid credentials!');
    }
  })
    .catch(err => {
      return res.status(500).send({ error: err.message });
    })
});

router.post('/signup', (req, res, next) => {
  const { email, password } = req.body;

  bcrypt.hash(password, 10).then(
    (hash) => {
      const user = new User({ email, password: hash });
      user.save()
        .then((doc) => {
          const token = jwt.sign({ email: doc.email, id: doc._id }, environment.SECRET_KEY, { expiresIn: '1h'}, undefined);

          return res.status(201).json({ email: doc.email, id: doc._id, token });
        }).catch(err => {
        if (err.errors.email) {
          err.message = 'User with this e-mail already exists!';
        }

        return res.status(500).send({ error: err.message });
      });
    }
  );
});

module.exports = router;
