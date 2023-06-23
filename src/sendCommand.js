require("dotenv").config(); // .env 파일에서 환경변수 가져오기

import { commandSocket } from "../index";
const sendCommand = (command) => {
  return new Promise((resolve, reject) => {
    // 드론에 명령 전송
    commandSocket.send(command, process.env.TELLO_PORT, process.env.TELLO_IP, (err) => {
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
    });
  });
};

export default sendCommand;
