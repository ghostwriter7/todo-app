const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const environment = require('./environment/environment');
const userRoutes = require('./routes/user.routes');
const todosRoutes = require('./routes/todos.routes');
const app = express();

app.use(cors());
app.use(bodyParser.json());

mongoose.connect(`mongodb+srv://ghostwriter7:${environment.DATABASE_PASSWORD}@cluster0.31u4m.mongodb.net/todoDB?retryWrites=true&w=majority`)
  .then(() => console.log('Connected!'))
  .catch((err) => console.error('Not connected!', err));

app.use('/api/auth', userRoutes);
app.use('/api/todo', todosRoutes);

app.listen(3000);
