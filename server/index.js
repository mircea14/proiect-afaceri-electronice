// server/index.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');


const userRoutes = require('./routes/user.routes');
const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const orderRoutes = require('./routes/order.routes');

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
app.use('/auth', authRoutes);
app.use('/products', productRoutes);
app.use('/orders', orderRoutes); 

app.listen(PORT, () => {
    console.log(`Server successfully started on port ${PORT}`);
})