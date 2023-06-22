 // 클라이언트와의 소켓 연결에 관한 파일
 const SocketIO = require("socket.io");
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
  stopCommand,
  batteryCommand
} from "./src/command.js";

import sendCommand from "./src/sendCommand.js";
 
 
 const wsServer = SocketIO(httpServer, {
    // 리액트와 소켓 연결
    cors: {
      origin: `*`,
      methods: ["GET", "POST"],
    },
  });

  wsServer.on("connection", async (socket) => {
    // 프론트와 웹소켓 연결
    console.log("Socket Connected to Browser ✅");
  
    socket.on("takeoff", async () => {
      //console.log("-------------------------------------");
      //console.log("takeoff event received ✅");
      try {
        await sendCommand(takeoffCommand);
      } catch (err) {
        console.log(`Command Error: ${err} ❌`);
      }
    });
  
    socket.on("land", async () => {
      //console.log("-------------------------------------");
      //console.log("land event received ✅");
      try {
        await sendCommand(landCommand);
      } catch (err) {
        console.log(`Command Error: ${err} ❌`);
      }
    });
  
    socket.on("forward", async () => {
      //console.log("-------------------------------------");
      //console.log("forward event received ✅");
      try {
        await sendCommand(forwardCommand);
      } catch (err) {
        console.log(`Command Error: ${err} ❌`);
      }
    });
  
    socket.on("back", async () => {
      //console.log("-------------------------------------");
      //console.log("back event received ✅");
      try {
        await sendCommand(backCommand);
      } catch (err) {
        console.log(`Command Error: ${err} ❌`);
      }
    });
  
    socket.on("left", async () => {
     //console.log("-------------------------------------");
      //console.log("left event received ✅");
      try {
        await sendCommand(leftCommand);
      } catch (err) {
        console.log(`Command Error: ${err} ❌`);
      }
    });
  
    socket.on("right", async () => {
      //console.log("-------------------------------------");
      //console.log("right event received ✅");
      try {
        await sendCommand(rightCommand);
      } catch (err) {
        console.log(`Command Error: ${err} ❌`);
      }
    });
  
    socket.on("up", async () => {
      //console.log("-------------------------------------");
      //console.log("up event received ✅");
      try {
        await sendCommand(upCommand);
      } catch (err) {
        console.log(`Command Error: ${err} ❌`);
      }
    });
  
    socket.on("down", async () => {
      //console.log("-------------------------------------");
      //console.log("down event received ✅");
      try {
        await sendCommand(downCommand);
      } catch (err) {
        console.log(`Command Error: ${err} ❌`);
      }
    });
  
    socket.on("cw", async () => {
      //console.log("-------------------------------------");
      //console.log("clockwise event received ✅");
      try {
        const result = await sendCommand(clockwiseCommand);
        console.log(result);
      } catch (err) {
        console.log(`Command Error: ${err} ❌`);
      }
    });
  
    socket.on("ccw", async () => {
      //console.log("-------------------------------------");
      //console.log("counterClockwise event received ✅");
      try {
        await sendCommand(counterClockwiseCommand);
      } catch (err) {
        console.log(`Command Error: ${err} ❌`);
      }
    });
  
    socket.on("stop", async () => {
      //console.log("-------------------------------------");
      //console.log("stop event received ✅");
      try {
        await sendCommand(stopCommand);
      } catch (err) {
        console.log(`Command Error: ${err} ❌`);
      }
    });
  
    socket.on("battery?", async () => {
      //console.log("-------------------------------------");
      //console.log("battery event received ✅");
      try {
        console.log(await sendCommand(batteryCommand));
      } catch (err) {
        console.log(`Command Error: ${err} ❌`);
      }
    });
  
    socket.on("disconnect", () => {
      console.log("Socket Disconnected from Browser ❌");
    });
  });

  export default wsServer;