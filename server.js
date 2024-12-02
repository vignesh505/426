const express = require('express');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const authRoutes = require('./auth');
const medicationRoutes = require('./medications');
const path = require('path');

const app = express();
const PORT = 3000;


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(
  session({
    secret: 'securesecretkey',
    resave: false,
    saveUninitialized: false,
    store: new SQLiteStore({ db: 'sessions.sqlite', dir: './' }),
  })
);


app.use('/auth', authRoutes);
app.use('/medications', medicationRoutes);


app.use(express.static(path.join(__dirname)));

// Default error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error.' });
});

// Start the server
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
