const mongoose = require('mongoose');

const todosSchema = new mongoose.Schema({
  todos: { type: Array },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true }
});

module.exports = mongoose.model('Todos', todosSchema);
