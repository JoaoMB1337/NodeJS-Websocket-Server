require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rota inicial para verificar se o servidor está rodando
app.get('/', (req, res) => {
    res.send('Server is running');
});

module.exports = app;