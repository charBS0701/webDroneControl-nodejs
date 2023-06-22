const sendCommand = (command) => {
    return new Promise((resolve, reject) => {
      // 드론에 명령 전송
      commandSocket.send(command, TELLO_PORT, TELLO_IP, (err) => {
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
  