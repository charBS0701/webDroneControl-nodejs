const express = require('express');
const app = express();
const dgram = require('dgram'); // UDP 통신 모듈
const client = dgram.createSocket('udp4');
require('dotenv').config();


client.bind(process.env.DRONE_HOST);

client.on('message', (message) => {
    console.log(`Message from drone: ${message}`);
});

const takeoffCommand = Buffer.from('takeoff');
client.send(takeoffCommand, process.env.DRONE_PORT , process.env.DRONE_HOST, (err) => {
    if (err) {
        console.log(`Error: ${err}`);
    } else {
        console.log('Command sent to drone: takeoff');
    }
});

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(process.env.PORT, () => {
    console.log(`Example app listening at http://localhost:${process.env.PORT}`);
});
