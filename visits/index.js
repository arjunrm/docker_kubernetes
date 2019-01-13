const express = require('express');
const redis = require('redis');
const process = require('process')

const app = express();
const client = redis.createClient({
    host: 'redis-server',
    port: 6379
});
client.set('visits', 0);

app.get('/', (req, res) => {
    client.get('visits', (err, visits) => {
        res.send('Number of visits : ' + visits);
        client.set('visits', parseInt(visits) + 1)
    });
});

app.get('/exit', (req, res) => {
    process.exit(0);
});

app.get('/failure', (req, res) => {
    process.exit(404);
});

app.listen(8081, () => {
    console.log('Listening to port 8081');
});
