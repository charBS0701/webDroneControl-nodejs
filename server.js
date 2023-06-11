require("dotenv").config(); // .env 파일에서 환경변수 가져오기
const express = require("express");
const http = require("http");
const SocketIO = require("socket.io");
const sdk = require("tellojs");
const cors = require("cors");

export const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


export const httpServer = http.createServer(app);
export const wsServer = SocketIO(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

app.get("/api/destination", (req,res) => {
  console.log("hi");
  res.send("he");
});

const dgram = require("dgram"); // 드론과의 UDP통신을 위함
export const client = dgram.createSocket("udp4"); // 드론에게 명령을 보내는 소켓
export const receiveClient = dgram.createSocket("udp4"); // 드론으로부터 응답을 받는 소켓
client.bind(process.env.DRONE_PORT); // UDP 소켓에 드론 포트 바인딩
receiveClient.bind(process.env.DRONE_RECEIVE_PORT); // UDP 소켓에 드론 포트 바인딩

const connectToDrone = async () => {
  try {
    await sdk.control.connect();
    console.log("Connected to drone! ✅");
  } catch (err) {
    console.log(`Drone Connect Error: ${err} ❌`);
  }
};

const handleListen = () => console.log(`Listening on http://localhost:3001 ✅`);
httpServer.listen(3001, handleListen); // 웹서버 실행
connectToDrone(); // 드론과 연결

//// 드론 연결이 끊기면
// sdk.control.on("close", () => {
//   console.log("Drone Disconnected ❌");
//   console.log("Trying to reconnect to drone...");
//   connectToDrone();
// });

// Send streamon
// client.send("streamon", DRONE_PORT, DRONE_HOST, null);




/////////////////////////////////////////////// 승진이의 노리ㅇ터 /////////////////////////////////////////////////
import {
  fwCommand,
  cwCommand, 
  ccwCommand,
} from "./src/command.js";

import {
  sendCommand
} from "./index.js";

// 목적지 받는 API
let destination = "";

//=============== init부분 ===========
let first_flag = true;
let initRow = 3;
let initColumn = 1;
let nowRow, nowColumn;

const dic = {
  '가좌동':1,
  '호탄동':3,
  '집' : 4,
  '평거동':17
}

const map = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
  [10, 11, 12],
  [13, 14, 15],
  [16, 17, 18]
];
//====================================

app.post("/api/destination", (req, res) => {
  destination = req.body.destination;
  console.log("================================");
  console.log("API received destination:", destination);

  if(first_flag){
    nowRow = initRow;
    nowColumn = initColumn;
    first_flag = false;
  } 

  const goal = dic[destination];  // 목표 지점 값

  if(goal != null){
    console.log("goal: ", goal, `(${destination})`);

    let { goalRow, goalColumn } = findGoal(map, goal);
  
    console.log("nowRow: ", nowRow, "nowColumn: ", nowColumn);

    // directionRow: +값 = 앞으로, -값 = 뒤로
    // directionColumn: -값 = 왼쪽, +값 = 오른쪽
    let { directionRow, directionColumn }  = calculateDirection(nowRow, nowColumn, goalRow, goalColumn);

    console.log("directionRow:", directionRow, "directionColumn:", directionColumn);
    console.log("================================");

    move(directionRow, directionColumn);

    console.log("================================");

    nowRow = goalRow;
    nowColumn = goalColumn;
  }

  //==========================================
  res.status(200).json({ message: "Destination received" });
});

const findGoal = (matrix, goal) => {
  // 목표 지점의 행, 열 인덱스 계산
  let goalRow = null;
  let goalColumn = null;
  for (let rowIdx = 0; rowIdx < matrix.length; rowIdx++) {
    const row = matrix[rowIdx];
    if (row.includes(goal)) {
      goalRow = rowIdx;
      goalColumn = row.indexOf(goal);
      break;
    }
  }

  return { goalRow, goalColumn };
}

const calculateDirection = (initRow, initColumn, goalRow, goalColumn) => {
  // 이동 방향 계산
  let directionRow = initRow - goalRow ;
  let directionColumn = goalColumn - initColumn;

  return { directionRow, directionColumn };
}

const move = async (directionRow, directionColumn) => {
  var angle = 0;
  let backside = false;
  if (directionRow > 0) {
    console.log(`앞으로 ${directionRow}칸 이동`);
    try {
      for (let i = 0; i < directionRow; i++) {
        await sendCommand(fwCommand);
      }
    } catch (err) {
      console.log(`Command Error: ${err} ❌`);
    }
    
    if (directionColumn > 0) {
      console.log(`오른쪽으로 회전`);
      angle += 90;
      console.log(`앞으로 ${directionColumn}칸 이동`);
      try {
        await sendCommand(cwCommand);
        for (let i = 0; i < directionRow; i++) {
          await sendCommand(forwardCommand);
        }
      } catch (err) {
        console.log(`Command Error: ${err} ❌`);
      }
    }

    else if (directionColumn < 0) {
      console.log(`왼쪽으로 회전`);
      angle -= 90;
      console.log(`앞으로 ${-directionColumn}칸 이동`);
      try {
        await sendCommand(ccwCommand);
        for (let i = 0; i < -directionColumn; i++) {
          await sendCommand(fwCommand);
        }
      } catch (err) {
        console.log(`Command Error: ${err} ❌`);
      }
    }
  }
  else if (directionRow < 0) {
    console.log(`뒤로 회전`);
    backside = true;
    console.log(`앞으로 ${-directionRow}칸 이동`);
    try {
      await sendCommand(cwCommand);
      await sendCommand(cwCommand);
      for (let i = 0; i < -directionRow; i++) {
        await sendCommand(fwCommand);
      }
    } catch (err) {
      console.log(`Command Error: ${err} ❌`);
    }

    if (directionColumn > 0) {
      console.log(`왼쪽으로 회전`);
      angle += 90;
      backside = false;
      console.log(`앞으로 ${directionColumn}칸 이동`);

      try {
        await sendCommand(ccwCommand);
        for (let i = 0; i < directionColumn; i++) {
          await sendCommand(fwCommand);
        }
      } catch (err) {
        console.log(`Command Error: ${err} ❌`);
      }
    }
    else if (directionColumn < 0) {
      console.log(`오른쪽으로 회전`);
      angle -= 90;
      backside = false;
      console.log(`앞으로 ${-directionColumn}칸 이동`);
      try {
        await sendCommand(cwCommand);
        for (let i = 0; i < -directionColumn; i++) {
          await sendCommand(fwCommand);
        }
      } catch (err) {
        console.log(`Command Error: ${err} ❌`);
      }
    }
  }
  else {
    if (directionColumn > 0) {
      console.log(`오른쪽으로 회전`);
      angle += 90;
      console.log(`앞으로 ${directionColumn}칸 이동`);
      try {
        await sendCommand(cwCommand);
        for (let i = 0; i < directionColumn; i++) {
          await sendCommand(fwCommand);
        }
      } catch (err) {
        console.log(`Command Error: ${err} ❌`);
      }
    }
    else if (directionColumn < 0) {
      console.log(`왼쪽으로 회전`);
      angle -= 90;
      console.log(`앞으로 ${-directionColumn}칸 이동`);
      try {
        await sendCommand(ccwCommand);
        for (let i = 0; i < -directionColumn; i++) {
          await sendCommand(fwCommand);
        }
      } catch (err) {
        console.log(`Command Error: ${err} ❌`);
      }
    }
  }

  console.log("도착!!");
  // 도착 후 회전 처리
  if (angle > 0) {
    angle -= 90;
    console.log(`도착 후 왼쪽으로 회전 --- angle: ${angle}`);
    try {
      await sendCommand(ccwCommand);
    } catch (err) {
      console.log(`Command Error: ${err} ❌`);
    }
  } else if (angle < 0) {
    angle += 90;
    console.log(`도착 후 오른쪽으로 회전 --- angle: ${angle}`);
    try {
      await sendCommand(cwCommand);
    } catch (err) {
      console.log(`Command Error: ${err} ❌`);
    }
  }
  if (backside) {
    console.log("도착 후 뒤로 회전")
    backside = false;
    try {
      await sendCommand(cwCommand);
      await sendCommand(cwCommand);
    } catch (err) {
      console.log(`Command Error: ${err} ❌`);
    }
  }
}