const express = require('express');
const Todos = require('../models/Todos');
const checkAuth = require('../middlewares/check-auth');

const router = express.Router();

router.get('/:date', checkAuth, (req, res, next) => {
  Todos.findOne({ creator: req.authData.id, date: req.params['date'] })
    .then((doc) => {
      if (!doc) {
        return res.status(404).json({ message: 'There are no Todos for this day!' });
      }
      return res.status(200).json({ doc });
    })
    .catch(err => {
      return res.status(500).json({ message: err.message });
    });
});

router.post('/:date', checkAuth, (req, res, next) => {
  const todos = new Todos({
    todos: req.body,
    creator: req.authData.id,
    date: req.params['date']
  });

  todos.save()
    .then((doc) => {
      return res.status(201).json({ doc });
    })
    .catch(err => {
      return res.status(500).json({ error: err.message });
    });
});

router.put('/:data', checkAuth, (req, res, next) => {
  Todos.updateOne({ creator: req.body.creator, date: req.body.date },
    { todos: req.body.todos })
    .then(() => {
      return res.status(203).json({ message: 'Your todos have been updated!' });
    })
    .catch(err => {
      return res.status(500).json({ error: err.message });
    })
});

router.delete('/:date', checkAuth, (req, res, next) => {
  console.log(req.authData.id);
  console.log(req.params['date']);

  Todos.deleteOne({ creator: req.authData.id, date: req.params['date'] })
    .then((data) => {
      console.log(data);

      return res.status(204).json({ message: 'Todos for this day have been deleted!'});
    });
});

module.exports = router;
