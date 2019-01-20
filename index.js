"use strict"

const express = require('express');
const app = express();
const port = 3000;

// Custom routes
const monzo = require('./monzo')(app);

app.get('/api/', (req, res) => res.send('Hello World!'));

app.listen(port, () => console.log(`App listening on port ${port}!`));
