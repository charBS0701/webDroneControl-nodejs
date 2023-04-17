require("dotenv").config(); // .env 파일에서 환경변수 가져오기
const express = require("express");
const http = require("http");
const SocketIO = require("socket.io");

const app = express();
export const httpServer = http.createServer(app);
export const wsServer = SocketIO(httpServer, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });

const dgram = require("dgram"); // 드론과의 UDP통신을 위함
export const client = dgram.createSocket("udp4"); // UDP socket 생성
client.bind(process.env.DRONE_PORT); // UDP 소켓에 드론 포트 바인딩