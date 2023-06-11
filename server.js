require("dotenv").config(); // .env 파일에서 환경변수 가져오기
const express = require("express");
const http = require("http");
const SocketIO = require("socket.io");
const sdk = require("tellojs");
const cors = require("cors");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

export const app = express();
export const httpServer = http.createServer(app);
export const wsServer = SocketIO(httpServer, {
  cors: {
    origin: `${process.env}:3000`,
    methods: ["GET", "POST"],
  },
});

const dgram = require("dgram"); // 드론과의 UDP통신을 위함
export const commandSocket = dgram.createSocket("udp4"); // 드론에게 명령을 보내는 소켓
export const receiveSocket = dgram.createSocket("udp4"); // 드론으로부터 응답을 받는 소켓
commandSocket.bind(process.env.DRONE_PORT); // UDP 소켓에 드론 포트 바인딩
receiveSocket.bind({
  address: "0.0.0.0",
  port: process.env.DRONE_PORT,
  exclusive: true,
}); // UDP 소켓에 드론 포트 바인딩

const handleListen = () => console.log(`Listening on http://localhost:3001 ✅`);
httpServer.listen(3001, handleListen); // 서버 실행

connectToDrone(); // 드론과 연결

// 드론 연결
const connectToDrone = async () => {
  try {
    await sdk.control.connect();
    console.log("Connected to drone! ✅");
  } catch (err) {
    console.log(`Drone Connect Error: ${err} ❌`);
  }
};

// UDP 서버와 드론이 연결되면
receiveSocket.on("listening", () => {
  const address = receiveSocket.address();
  console.log(`UDP Server listening on ${address.address}:${address.port} 🚀`);
});

// 드론으로부터 메시지를 받으면 
receiveSocket.on("message", (msg, rinfo) => {
  console.log(`Drone Message: ${msg.toString()} ✅ from :${rinfo.address} : ${rinfo.port}`);
});








//// 드론 연결이 끊기면
// sdk.control.on("close", () => {
//   console.log("Drone Disconnected ❌");
//   console.log("Trying to reconnect to drone...");
//   connectToDrone();
// });

// Send streamon
// client.send("streamon", DRONE_PORT, DRONE_HOST, null);
