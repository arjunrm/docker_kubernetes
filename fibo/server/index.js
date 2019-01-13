const keys = require('./keys');

//express app setup
const express = require('express');
// bodyparser -> parse incoming requests from React app
// and turn the body of the request into json object
const bodyParser = require('body-parser');
// cors -> cross origin resource sharing
// to allow requests made from 1 domain where the react app is hosted on
// to completely different domain/port the express API is hosted on
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Postgres client setup
const { Pool } = require('pg');
const pgClient = new Pool({
    user: keys.pgUser,
    host: keys.pgHost,
    database: keys.pgDatabase,
    password: keys.pgPassword,
    port: keys.pgPort
});
// handle Postgres error
pgClient.on('error', () => console.log('Lost PG connection'));

// Table name = values, column = number
pgClient
    .query('CREATE TABLE IF NOT EXISTS values (number INT)')
    .catch(err => console.log(err));


