require("dotenv").config(); // .env 파일에서 환경변수 가져오기
const express = require("express");
const http = require("http");
const SocketIO = require("socket.io");
const sdk = require("tellojs");

const app = express();
export const httpServer = http.createServer(app);
export const wsServer = SocketIO(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

const dgram = require("dgram"); // 드론과의 UDP통신을 위함
export const client = dgram.createSocket("udp4"); // 드론에게 명령을 보내는 소켓
export const receiveClient = dgram.createSocket("udp4"); // 드론으로부터 응답을 받는 소켓
client.bind(process.env.DRONE_PORT); // UDP 소켓에 드론 포트 바인딩
receiveClient.bind(process.env.DRONE_RECEIVE_PORT); // UDP 소켓에 드론 포트 바인딩

const connectToDrone = async () => {
  try {
    await sdk.control.connect();
    console.log("Connected to drone! ✅");
  } catch (err) {
    console.log(`Drone Connect Error: ${err} ❌`);
  }
};

const handleListen = () => console.log(`Listening on http://localhost:3001 ✅`);
httpServer.listen(3001, handleListen); // 웹서버 실행
connectToDrone(); // 드론과 연결
// // 드론 연결이 끊기면
// sdk.control.on("close", () => {
//   console.log("Drone Disconnected ❌");
//   console.log("Trying to reconnect to drone...");
//   connectToDrone();
// });

// Send streamon
// client.send("streamon", DRONE_PORT, DRONE_HOST, null);
