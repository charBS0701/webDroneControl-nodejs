require("dotenv").config(); // .env 파일에서 환경변수 가져오기
const express = require("express");
const http = require("http");
const SocketIO = require("socket.io");
const cors = require("cors");
import { sendCommand } from "./index.js";
import { commandCommand, streamonCommand } from "./src/command.js";

export const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

export const httpServer = http.createServer(app);
export const wsServer = SocketIO(httpServer, {
  cors: {
    origin: `*`,
    methods: ["GET", "POST"],
  },
});

const dgram = require("dgram"); // 드론과의 UDP통신을 위함
export const commandSocket = dgram.createSocket("udp4"); // 드론에게 명령을 보내는 소켓
export const receiveSocket = dgram.createSocket("udp4"); // 드론으로부터 상태를 받는 소켓

// commandSocket.bind({
//   address: process.env.DRONE_HOST,
//   port: process.env.DRONE_COMMAND_PORT,
//   exclusive: true,
// });
commandSocket.bind(process.env.DRONE_COMMAND_PORT, "0.0.0.0", () => {
  commandSocket.setBroadcast(true);
});

// UDP 소켓에 드론 포트 바인딩
// receiveSocket.bind({
//   address: "0.0.0.0",
//   port: process.env.DRONE_STATE_PORT,
//   exclusive: true,
// });

// UDP 소켓에 영상 포트 바인딩
receiveSocket.bind({
  address: "0.0.0.0",
  port: 11111,
  exclusive: true,
});

const handleListen = () => console.log(`Listening on http://localhost:3001 ✅`);
httpServer.listen(3001, handleListen); // 서버 실행

// UDP 서버와 드론이 연결되면
receiveSocket.on("listening", () => {
  const address = receiveSocket.address();
  console.log(address);
  console.log(`UDP Server listening on ${address.address}:${address.port} 🚀`);
});

// 커맨드 응답 메시지
commandSocket.on("message", (msg, rinfo) => {
  console.log(
    `Drone Command Response : ${msg.toString()}, from :${rinfo.address}:${
      rinfo.port
    } command`
  );
  console.log("-------------------------------------");
});

// 응답포트에서 드론으로부터 메시지를 받으면
// receiveSocket.on("message", (msg, rinfo) => {
//   console.log(
//     `Receive Drone Message: ${msg.toString()} ✅ from :${rinfo.address} : ${rinfo.port}`
//   );
// });

// 0.0.0.0:11111 로 부터 오는 메시지 체크
receiveSocket.on("message", (msg, rinfo) => {
  console.log(
    `Drone Stream Message : ${msg.toString()}, from :${rinfo.address}:${
      rinfo.port
    } receive`
  );
});
