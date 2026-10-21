require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');

require('./database/db');

const publicRoutes = require('./routes/publicRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: process.env.SESSION_SECRET || 'dev_secret_key_123',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));

// Rutas
app.use('/', publicRoutes);
app.use('/admin', adminRoutes);

app.listen(PORT, () => {
    console.log(`[Landing] Corriendo en http://localhost:${PORT}`);
    console.log(`[Admin] Panel disponible en http://localhost:${PORT}/admin`);
});
