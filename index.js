require("dotenv").config();

const sdk = require("tellojs");

import {
  streamonCommand,
  commandCommand,
  takeoffCommand,
  landCommand,
  forwardCommand,
  backCommand,
  leftCommand,
  rightCommand,
  stopCommand,
  batteryCommand,
  upCommand,
  downCommand,
  clockwiseCommand,
  counterClockwiseCommand,
} from "./src/command.js";
import { destination } from "./src/api.js";

require("dotenv").config(); // .env 파일에서 환경변수 가져오기
const express = require("express");
const http = require("http");
const SocketIO = require("socket.io");
const cors = require("cors");
const spawn = require("child_process").spawn;

const STREAM_PORT = 4000;
const WebSocket = require("ws");
const TELLO_IP = "192.168.10.1";
const TELLO_PORT = 8889;
const SERVER_PORT = 3001;

export const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

export const httpServer = http.createServer(app);
const handleListen = () =>
  console.log(`Listening on http://localhost:${SERVER_PORT} ✅`);
httpServer.listen(SERVER_PORT, handleListen); // 서버 실행

const dgram = require("dgram"); // 드론과의 UDP통신을 위함

/*
  2. Create the stream server where the video stream will be sent
*/
const streamServer = http
  .createServer(function (request, response) {
    // Log that a stream connection has come through
    console.log(
      "Stream Connection on " +
        STREAM_PORT +
        " from: " +
        request.socket.remoteAddress +
        ":" +
        request.socket.remotePort
    );

    // When data comes from the stream (FFmpeg) we'll pass this to the web socket
    request.on("data", function (data) {
      // Now that we have data let's pass it to   the web socket server
      webSocketServer.broadcast(data);
    });
  })
  .listen(STREAM_PORT); // Listen for streams on port 3001

/*
  3. Begin web socket server
*/
const webSocketServer = new WebSocket.Server({
  server: streamServer,
});

// Broadcast the stream via websocket to connected clients
webSocketServer.broadcast = function (data) {
  webSocketServer.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
};

/* 
  4. Send the command and streamon SDK commands to begin the Tello video stream.
  YOU MUST POWER UP AND CONNECT TO TELL BEFORE RUNNING THIS SCRIPT
*/
export const commandSocket = dgram.createSocket("udp4"); // 드론에게 명령을 보내는 소켓
commandSocket.send("command", TELLO_PORT, TELLO_IP, null);

// Send streamon
commandSocket.send("streamon", TELLO_PORT, TELLO_IP, null);

// 커맨드 응답 메시지
commandSocket.on("message", (msg, rinfo) => {
  console.log(
    `Drone Command Response : ${msg.toString()}, from :${rinfo.address}:${
      rinfo.port
    } command`
  );
  console.log("-------------------------------------");
});

/*
  5. Begin the ffmpeg stream. You must have Tello connected first
*/

// Delay for 3 seconds before we start ffmpeg
setTimeout(function () {
  var args = [
    "-i",
    "udp://0.0.0.0:11111",
    "-r",
    "30",
    "-s",
    "960x720",
    "-codec:v",
    "mpeg1video",
    "-b",
    "800k",
    "-f",
    "mpegts",
    "http://127.0.0.1:4000/stream",
  ];

  // Spawn an ffmpeg instance
  var streamer = spawn("ffmpeg", args);
  // Uncomment if you want to see ffmpeg stream info
  //streamer.stderr.pipe(process.stderr);
  streamer.on("exit", function (code) {
    console.log("Failure", code);
  });
}, 3000);

/*
설정
*/

// UDP 소켓에 드론 포트 바인딩
// export const receiveSocket = dgram.createSocket("udp4"); // 드론으로부터 상태를 받는 소켓
// receiveSocket.bind({
//   address: "0.0.0.0",
//   port: process.env.DRONE_STATE_PORT,
//   exclusive: true,
// });

// UDP 소켓에 영상 포트 바인딩
// receiveSocket.bind({
//   address: "0.0.0.0",
//   port: 11111,
//   exclusive: true,
// });

// UDP 서버와 드론이 연결되면
// receiveSocket.on("listening", () => {
//   const address = receiveSocket.address();
//   console.log(address);
//   console.log(`UDP Server listening on ${address.address}:${address.port} 🚀`);
// });

export const wsServer = SocketIO(httpServer, {
  // 리액트와 소켓 연결
  cors: {
    origin: `*`,
    methods: ["GET", "POST"],
  },
});

export const sendCommand = (command) => {
  return new Promise((resolve, reject) => {
    // 드론에 명령 전송
    commandSocket.send(command, TELLO_PORT, TELLO_IP, (err) => {
      if (err) {
        console.log(`Error: ${err} ❌`);
        console.log("Command not sent to drone ❌");
        console.log("-------------------------------------");
        reject(err);
      } else {
        console.log(`Command sent to drone: ${command}`);
        console.log("-------------------------------------");
        resolve(command);
      }
    });
  });
};

// // 웹소켓으로 브라우저의 명령을 받는다.
wsServer.on("connection", async (socket) => {
  // 프론트와 웹소켓 연결
  console.log("Socket Connected to Browser ✅");

  socket.on("takeoff", async () => {
    // 이륙
    console.log("-------------------------------------");
    console.log("takeoff event received ✅");
    try {
      await sendCommand(takeoffCommand);
    } catch (err) {
      console.log(`Command Error: ${err} ❌`);
    }
  });

  socket.on("land", async () => {
    // 착륙
    console.log("-------------------------------------");
    console.log("land event received ✅");
    try {
      await sendCommand(landCommand);
    } catch (err) {
      console.log(`Command Error: ${err} ❌`);
    }
  });

  socket.on("forward", async () => {
    // 전진
    console.log("-------------------------------------");
    console.log("forward event received ✅");
    try {
      await sendCommand(forwardCommand);
    } catch (err) {
      console.log(`Command Error: ${err} ❌`);
    }
  });

  socket.on("back", async () => {
    // 후진
    console.log("-------------------------------------");
    console.log("back event received ✅");
    try {
      await sendCommand(backCommand);
    } catch (err) {
      console.log(`Command Error: ${err} ❌`);
    }
  });

  socket.on("left", async () => {
    // 좌로 이동
    console.log("-------------------------------------");
    console.log("left event received ✅");
    try {
      await sendCommand(leftCommand);
    } catch (err) {
      console.log(`Command Error: ${err} ❌`);
    }
  });

  socket.on("right", async () => {
    // 우로 이동
    console.log("-------------------------------------");
    console.log("right event received ✅");
    try {
      await sendCommand(rightCommand);
    } catch (err) {
      console.log(`Command Error: ${err} ❌`);
    }
  });

  socket.on("up", async () => {
    // 상승
    console.log("-------------------------------------");
    console.log("up event received ✅");
    try {
      await sendCommand(upCommand);
    } catch (err) {
      console.log(`Command Error: ${err} ❌`);
    }
  });

  socket.on("down", async () => {
    // 하강
    console.log("-------------------------------------");
    console.log("down event received ✅");
    try {
      await sendCommand(downCommand);
    } catch (err) {
      console.log(`Command Error: ${err} ❌`);
    }
  });

  socket.on("cw", async () => {
    // 시계방향 회전
    console.log("-------------------------------------");
    console.log("clockwise event received ✅");
    try {
      const result = await sendCommand(clockwiseCommand);
      console.log(result);
    } catch (err) {
      console.log(`Command Error: ${err} ❌`);
    }
  });

  socket.on("ccw", async () => {
    // 반시계방향 회전
    console.log("-------------------------------------");
    console.log("counterClockwise event received ✅");
    try {
      await sendCommand(counterClockwiseCommand);
    } catch (err) {
      console.log(`Command Error: ${err} ❌`);
    }
  });

  socket.on("stop", async () => {
    // 정지
    console.log("-------------------------------------");
    console.log("stop event received ✅");
    try {
      await sendCommand(stopCommand);
    } catch (err) {
      console.log(`Command Error: ${err} ❌`);
    }
  });

  socket.on("battery?", async () => {
    // 배터리 확인
    console.log("-------------------------------------");
    console.log("battery event received ✅");
    try {
      await sendCommand(batteryCommand);
    } catch (err) {
      console.log(`Command Error: ${err} ❌`);
    }
  });

  socket.on("disconnect", () => {
    console.log("Socket Disconnected from Browser ❌");
  });
});

/* 위까지 웹소켓으로 브라우저의 명령을 받는 코드. */

/* 승진이의 놀이터 */

// const getTof = async () => {
//   while (1) {
//     try {
//       //명령 보내기
//       var tof = await sdk.read.tof();
//       const splitTof = tof.substring(4, 10);
//       const numTof = Number(splitTof);
//       console.log(`Tof = ${numTof}`);

//       if (numTof < 400) {
//         console.log("잘 되네");

//         await sendCommand(backCommand);
//         continue;
//       }
//     } catch (err) {
//       console.log(`Drone tof Error: ${err} ❌`);
//     }
//   }
// };

// // getTof();
