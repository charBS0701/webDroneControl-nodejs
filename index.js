const express = require("express");
const http = require("http");
const SocketIO = require("socket.io");
require("dotenv").config();

const app = express();
const httpServer = http.createServer(app);
const wsServer = SocketIO(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

wsServer.on("connection", (socket) => {
  console.log("Socket Connected to Browser ✅");

  socket.on("takeoff", () => {
    console.log("takeoff event received");
    client.send(
      takeoffCommand,
      process.env.DRONE_PORT,
      process.env.DRONE_HOST,
      (err) => {
        if (err) {
          console.log(`Error: ${err}`);
        } else {
          console.log("Command sent to drone: takeoff");
        }
      }
    );
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

const handleListen = () => console.log(`Listening on http://localhost:3001`);
httpServer.listen(3001, handleListen);

const sdk = require("tellojs");
const dgram = require("dgram");

const client = dgram.createSocket("udp4"); // UDP socket 생성
client.bind(process.env.DRONE_PORT); // UDP 소켓에 드론 포트 바인딩

client.on("message", (message) => {
  // 드론으로부터 메시지 수신 시 콘솔에 출력
  console.log(`Message from drone: ${message}`);
});
app.post("/takeoff", (req, res) => {
  sdk.control.connect();
  client.send(
    Buffer.from("takeoff"),
    process.env.DRONE_PORT,
    process.env.DRONE_HOST,
    (err) => {
      if (err) {
        console.log(`Error: ${err}`);
      } else {
        console.log("Command sent to drone: takeoff");
        res.send("Command sent to drone: takeoff");
      }
    }
  );
});

const takeoffCommand = Buffer.from("takeoff");

async function connectToDrone() {
  try {
    await sdk.control.connect();
    console.log("Connected to drone!");
  } catch (err) {
    console.log(`Connect Error: ${err}`);
  }
}

connectToDrone();
