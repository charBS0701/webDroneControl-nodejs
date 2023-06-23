require("dotenv").config(); // .env 파일에서 환경변수 가져오기
const express = require("express");
const http = require("http");
const cors = require("cors");
const spawn = require("child_process").spawn;

const STREAM_PORT = 4000;
const WebSocket = require("ws");
const SERVER_PORT = 3001;

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
const destinationRouter = require("./src/destination"); // 목적지 API와 관련된 라우터
app.use("/api/destination", destinationRouter); // 목적지 API와 관련된 라우터 설정

export const httpServer = http.createServer(app);
const handleListen = () =>
  console.log(`Listening on http://localhost:${SERVER_PORT} ✅`);
httpServer.listen(SERVER_PORT, handleListen); // 서버 실행
import wsServer from "./wsServer.js";
wsServer(httpServer); // 웹소켓 서버 실행

// 충돌방지
import getTof from "./src/collision_avoid.js";
getTof();

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
commandSocket.send(
  "command",
  process.env.TELLO_PORT,
  process.env.TELLO_IP,
  null
);

// Send streamon
commandSocket.send(
  "streamon",
  process.env.TELLO_PORT,
  process.env.TELLO_IP,
  null
);

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
