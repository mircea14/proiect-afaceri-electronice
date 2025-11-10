// server/index.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const { User } = require('./database/models');

const userRoutes = require('./routes/user.routes');

const app = express();
dotenv.config(); //dupa aceasta linie avem acces la cheile de env

const PORT = process.env.PORT || 3001;

app.use(cors()); //cine are drept sa dea request; daca nu e nmc e toata lumea
app.use(morgan('dev')) //logheaza request
app.use(express.json()); //salveaza ca obiect sa poti folosi mai departe

//definire rute req -> ce primesti res -> ce trimiti catre frontend
app.get('/', (req, res) => {
    res.status(200).json({ message: 'Hello' });
})

app.use('/users', userRoutes);

app.listen(PORT, () => {
    console.log(`Server successfully started on port ${PORT}`);
})