const sdk = require("tellojs");
import { avoidCommand } from "./command.js";
import sendCommand from "./sendCommand.js";

const getTof = async () => {
  while (1) {
    try {
      //명령 보내기
      var tof = await sdk.read.tof();
      const splitTof = tof.substring(4, 10);
      const numTof = Number(splitTof);
      console.log(`Tof = ${numTof}`);

      if (numTof < 400) {
        setTimeout(getTof, 1000);
        await sendCommand(avoidCommand);
        break;
      }
    } catch (err) {
      console.log(`Drone tof Error: ${err} ❌`);
    }
  }
};

export default getTof;