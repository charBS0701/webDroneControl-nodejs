require("dotenv").config();

const sdk = require("tellojs");
import { wsServer, httpServer, client } from "./server.js";
import {
  takeoffCommand,
  landCommand,
  forwardCommand,
  backCommand,
  leftCommand,
  rightCommand,
  stopCommand,
} from "./src/command.js";

const connectToDrone = async () => {
  try {
    await sdk.control.connect();
    console.log("Connected to drone! ✅");
  } catch (err) {
    console.log(`Drone Connect Error: ${err} ❌`);
  }
};

const sendCommand = (command) => {
  // 드론에 명령 전송
  client.send(
    command,
    process.env.DRONE_PORT,
    process.env.DRONE_HOST,
    (err) => {
      if (err) {
        console.log(`Error: ${err} ❌`);
      } else {
        console.log(`Command sent to drone: ${command}`);
        console.log("-------------------------------------");
      }
    }
  );
};

const handleListen = () => console.log(`Listening on http://localhost:3001 ✅`);
httpServer.listen(3001, handleListen); // 웹서버 실행
connectToDrone(); // 드론과 연결
wsServer.on("connection", (socket) => {
  // 프론트와 웹소켓 연결
  console.log("Socket Connected to Browser ✅");

  socket.on("takeoff", () => {
    console.log("-------------------------------------");
    console.log("takeoff event received ✅");
    sendCommand(takeoffCommand);
  });
  socket.on("land", () => {
    console.log("-------------------------------------");
    console.log("land event received ✅");
    sendCommand(landCommand);
  });
  socket.on("forward", () => {
    console.log("-------------------------------------");
    console.log("forward event received ✅");
    sendCommand("forward 20");
  });
  socket.on("back", () => {
    console.log("-------------------------------------");
    console.log("back event received ✅");
    sendCommand("back 20");
  });
  socket.on("left", () => {
    console.log("-------------------------------------");
    console.log("left event received ✅");
    sendCommand("left 20");
  });
  socket.on("right", () => {
    console.log("-------------------------------------");
    console.log("right event received ✅");
    sendCommand("right 20");
  });
  socket.on("stop", () => {
    console.log("-------------------------------------");
    console.log("stop event received ✅");
    sendCommand("stop");
  });

  socket.on("disconnect", () => {
    console.log("Browser disconnected ❌");
  });
});

client.on("message", (message) => {
  // 드론으로부터 메시지 수신 시 콘솔에 출력
  console.log(`Message from drone: ${message}`);
});
