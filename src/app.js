const express = require('express');
const cors = require('cors');
const app = express();

const data = require('../data.json')

app.use(express.json());

app.use(cors());

app.get('/', (req, res) => {
    res.status(200).send(data)
});

module.exports = app; 
