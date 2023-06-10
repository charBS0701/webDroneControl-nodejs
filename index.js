require("dotenv").config();

const sdk = require("tellojs");

import { wsServer, httpServer, client, receiveClient } from "./server.js";
import {
  takeoffCommand,
  landCommand,
  forwardCommand,
  backCommand,
  leftCommand,
  rightCommand,
  stopCommand,
  batteryCommand,
} from "./src/command.js";

const connectToDrone = async () => {
  try {
    await sdk.control.connect();
    console.log("Connected to drone! ✅");
  } catch (err) {
    console.log(`Drone Connect Error: ${err} ❌`);
  }
};

const getTof = async () => {
  while(1){
    try {
      let a = await sdk.read.tof();
      //setTimeout(() => console.log(`${a}`), 100);
      console.log(`${a}`); // Obtain distance value from TOF（cm)
    } catch (err) {
      console.log(`Drone tof Error: ${err} ❌`);
    }
  }
  
};

const sendCommand = (command) => {
  return new Promise((resolve, reject) => {
    // 드론에 명령 전송
    client.send(
      command,
      process.env.DRONE_PORT,
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

    // battery? 커맨드인 경우, 드론으로부터 응답을 받아서 콘솔에 출력합니다.
    if (command === batteryCommand) {
      receiveClient.once("message", handleBatteryResponse); // 첫번째 메시지만 받아들이고 핸들러 호출
    }
  });
};

const handleBatteryResponse = (msg, rinfo) => {
  console.log(`Battery: ${msg} ✅ from :${rinfo.address} : ${rinfo.port}`);
};

const handleListen = () => console.log(`Listening on http://localhost:3001 ✅`);
httpServer.listen(3001, handleListen); // 웹서버 실행
connectToDrone(); // 드론과 연결
getTof();

wsServer.on("connection", async (socket) => {
  // 프론트와 웹소켓 연결
  console.log("Socket Connected to Browser ✅");

  socket.on("takeoff", async () => {
    console.log("-------------------------------------");
    console.log("takeoff event received ✅");
    try {
      await sendCommand(takeoffCommand);
    } catch (err) {
      console.log(`Command Error: ${err} ❌`);
    }
  });

  socket.on("land", async () => {
    console.log("-------------------------------------");
    console.log("land event received ✅");
    try {
      await sendCommand(landCommand);
    } catch (err) {
      console.log(`Command Error: ${err} ❌`);
    }
  });

  socket.on("forward", async () => {
    console.log("-------------------------------------");
    console.log("forward event received ✅");
    try {;
      await sendCommand(forwardCommand);
    } catch (err) {
      console.log(`Command Error: ${err} ❌`);
    }
  });

  socket.on("back", async () => {
    console.log("-------------------------------------");
    console.log("back event received ✅");
    try {
      await sendCommand(backCommand);
    } catch (err) {
      console.log(`Command Error: ${err} ❌`);
    }
  });

  socket.on("left", async () => {
    console.log("-------------------------------------");
    console.log("left event received ✅");
    try {
      await sendCommand(leftCommand);
    } catch (err) {
      console.log(`Command Error: ${err} ❌`);
    }
  });

  socket.on("right", async () => {
    console.log("-------------------------------------");
    console.log("right event received ✅");
    try {
      await sendCommand(rightCommand);
    } catch (err) {
      console.log(`Command Error: ${err} ❌`);
    }
  });

  socket.on("stop", async () => {
    console.log("-------------------------------------");
    console.log("stop event received ✅");
    try {
      await sendCommand(stopCommand);
    } catch (err) {
      console.log(`Command Error: ${err} ❌`);
    }
  });

  socket.on("battery?", async () => {
    console.log("-------------------------------------");
    console.log("battery event received ✅");
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
