require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path'); // Adicione isso para manipular caminhos

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Servir arquivos estáticos da pasta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Rota inicial para verificar se o servidor está rodando
app.get('/', (req, res) => {
    res.send('Server is running');
});

module.exports = app;