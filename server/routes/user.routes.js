const { User } = require('../database/models');
const express = require('express');
const bcrypt = require('bcrypt');
// const {verifyToken} = require('../utils/token.js');

const router = express.Router();

router.post('/', async (req, res) => {
    try{
        // const existingUser = await
        console.log(req.body);
    } catch(error) {
        res.status(500).json({succes: false, message: 'Error creating user', data: error.message});
    }
})

module.exports = router;