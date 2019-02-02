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

// redis client setup
const redis = require('redis')
const redisClient = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort,
    retry_strategy: () => 1000
});
const redisPublisher = redisClient.duplicate();

// express route handlers
app.get('/', (req, resp) => {
    res.send('Hi');
});


app.get('/values/all', async (req, resp) => {
    const values = await pgClient.query('SELECT * from values');

    res.send(values.rows);
});

app.get('/values/current', async (req, res) => {
    redisClient.hgetall('values', (err, values) => {
        res.send(values);
    });
});

app.post('/values', async (req, res) => {
    const index = req.body.index;

    // to avoid worker thread getting blocked limit max index
    if (parseInt(index) > 40) {
        return res.status(422).send('Index too high');
    }

    // store index, 'Nothing yet!' as fibo is not yet calculated
    redisClient.hset('values', index, 'Nothing yet!');
    // publish to listeners that a value has been inserted into redis
    redisPublisher.publish('insert', index);
    // store the index into postgres
    pgClient.query('INSERT INTO values(number) VALUES($1)', [index]);

    res.send({working: true});
});

app.listen(5000, err => {
    console.log('Listening');
});
