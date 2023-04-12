const express = require('express'); // express 모듈 : 서버 여는 모듈
const app = express();  // 서버 여는 부분
const dgram = require('dgram'); // UDP 통신 모듈  -- 텔로랑 통신 시 wifi + udp 통신
const client = dgram.createSocket('udp4');
require('dotenv').config();

client.bind(process.env.DRONE_HOST);

client.on('message', (message) => {
    console.log(`Message from drone: ${message}`);
});

client.send(takeoffCommand, process.env.DRONE_PORT , process.env.DRONE_HOST, (err) => {
    if (err) {
        console.log(`Error: ${err}`);
    } else {
        console.log('Command sent to drone: takeoff');
    }
});

app.listen(process.env.PORT, () => {
    console.log(`Example app listening at http://localhost:${process.env.PORT}`);
});

const sdk = require('tellojs') // tello sdk 모듈

const x = number,
    y = number,
    z = number,
    speed = number,
    yaw = number,
    start = {x, y, z},
    end = {x, y, z},
    ssid = string,
    password = string

await sdk.control.connect()                     // Enter SDK mode.
console.log("연결 되었습니다.");
// await sdk.control.takeOff()  