const app = require("express")();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const sdk = require("tellojs");
const dgram = require("dgram");
require("dotenv").config();

const client = dgram.createSocket("udp4"); // UDP socket 생성
client.bind(process.env.DRONE_PORT); // UDP 소켓에 드론 포트 바인딩

client.on("message", (message) => { // 드론으로부터 메시지 수신 시 콘솔에 출력
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

io.on("connection", (socket) => {
  console.log("a user connected");
  // 클라이언트로부터 이벤트를 받을 경우 실행되는 콜백 함수

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

http.listen(3001, () => {
    console.log(`http listening on *: ${process.env.PORT}`);
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


// client.send(
//   takeoffCommand,
//   process.env.DRONE_PORT,
//   process.env.DRONE_HOST,
//   (err) => {
//     if (err) {
//       console.log(`Error: ${err}`);
//     } else {
//       console.log("Command sent to drone: takeoff");
//     }
//   }
// );