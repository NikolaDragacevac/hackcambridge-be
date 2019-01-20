"use strict"

const express = require('express');
const app = express();
const port = 3000;
const cors = require('cors');
app.use(cors());

// Custom routes
require('./monzo')(app);
require('./gcp')(app);

app.get('/api/', (req, res) => res.send('Hello World!'));

app.listen(port, () => console.log(`App listening on port ${port}!`));
