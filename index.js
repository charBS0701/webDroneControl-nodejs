require("dotenv").config();

const sdk = require("tellojs");

import { wsServer, httpServer, commandSocket,   receiveSocket } from "./server.js";
import {
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

const getTof = async () => {
  while (1) {
    try {
      //명령 보내기
      var tof = await sdk.read.tof();
      const splitTof = tof.substring(4, 10);
      const numTof = Number(splitTof);
      console.log(`Tof = ${numTof}`);

      if (numTof < 400) {
        console.log("잘 되네");

        await sendCommand(backCommand);
        continue;
      }
    } catch (err) {
      console.log(`Drone tof Error: ${err} ❌`);
    }
  }
};

const sendCommand = (command) => {
  return new Promise((resolve, reject) => {
    // 드론에 명령 전송
    commandSocket.send(
      command,
      process.env.DRONE_COMMAND_PORT,
      process.env.DRONE_HOST,
      (err) => {
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
      }
    );
  });
};


// getTof();

wsServer.on("connection", async (socket) => {
  // 프론트와 웹소켓 연결
  console.log("Socket Connected to Browser ✅");

  socket.on("takeoff", async () => {  // 이륙
    console.log("-------------------------------------");
    console.log("takeoff event received ✅");
    try {
      await sendCommand(takeoffCommand);
    } catch (err) {
      console.log(`Command Error: ${err} ❌`);
    }
  });

  socket.on("land", async () => { // 착륙
    console.log("-------------------------------------");
    console.log("land event received ✅");
    try {
      await sendCommand(landCommand);
    } catch (err) {
      console.log(`Command Error: ${err} ❌`);
    }
  });

  socket.on("forward", async () => {  // 전진
    console.log("-------------------------------------");
    console.log("forward event received ✅");
    try {
      await sendCommand(forwardCommand);
    } catch (err) {
      console.log(`Command Error: ${err} ❌`);
    }
  });

  socket.on("back", async () => { // 후진
    console.log("-------------------------------------");
    console.log("back event received ✅");
    try {
      await sendCommand(backCommand);
    } catch (err) {
      console.log(`Command Error: ${err} ❌`);
    }
  });

  socket.on("left", async () => { // 좌로 이동
    console.log("-------------------------------------");
    console.log("left event received ✅");
    try {
      await sendCommand(leftCommand);
    } catch (err) {
      console.log(`Command Error: ${err} ❌`);
    }
  });

  socket.on("right", async () => {  // 우로 이동
    console.log("-------------------------------------");
    console.log("right event received ✅");
    try {
      await sendCommand(rightCommand);
    } catch (err) {
      console.log(`Command Error: ${err} ❌`);
    }
  });

  socket.on("up", async () => { // 상승
    console.log("-------------------------------------");
    console.log("up event received ✅");
    try {
      await sendCommand(upCommand);
    } catch (err) {
      console.log(`Command Error: ${err} ❌`);
    }
  });

  socket.on("down", async () => { // 하강
    console.log("-------------------------------------");
    console.log("down event received ✅");
    try {
      await sendCommand(downCommand);
    } catch (err) {
      console.log(`Command Error: ${err} ❌`);
    }
  });

  socket.on("cw", async () => { // 시계방향 회전
    console.log("-------------------------------------");
    console.log("clockwise event received ✅");
    try {
      const result = await sendCommand(clockwiseCommand);
      console.log(result);
    } catch (err) {
      console.log(`Command Error: ${err} ❌`);
    }
  });

  socket.on("ccw", async () => {  // 반시계방향 회전
    console.log("-------------------------------------");
    console.log("counterClockwise event received ✅");
    try {
      await sendCommand(counterClockwiseCommand);
    } catch (err) {
      console.log(`Command Error: ${err} ❌`);
    }
  });

  socket.on("stop", async () => { // 정지
    console.log("-------------------------------------");
    console.log("stop event received ✅");
    try {
      await sendCommand(stopCommand);
    } catch (err) {
      console.log(`Command Error: ${err} ❌`);
    }
  });

  socket.on("battery?", async () => { // 배터리 확인
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
