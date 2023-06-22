require("dotenv").config();

const sdk = require("tellojs");

import { land } from "tellojs/src/commands/control.js";
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
  avoidCommand,
  fwCommand,
  cwCommand,
  ccwCommand,
  backRotateCommand
} from "./src/command.js";

// ===================여기서 부터 수정================== //

require("dotenv").config(); // .env 파일에서 환경변수 가져오기
const express = require("express");
const http = require("http");
const SocketIO = require("socket.io");
const cors = require("cors");
const spawn = require("child_process").spawn;

const STREAM_PORT = 4000;
const WebSocket = require("ws");
const TELLO_IP = "192.168.10.1";
const TELLO_PORT = 8889;
const SERVER_PORT = 3001;
//----- 하드코딩 -----// 
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

export const httpServer = http.createServer(app);
const handleListen = () =>
  console.log(`Listening on http://localhost:${SERVER_PORT} ✅`);
httpServer.listen(SERVER_PORT, handleListen); // 서버 실행

const dgram = require("dgram"); // 드론과의 UDP통신을 위함
//---//---// 

/*
  2. Create the stream server where the video stream will be sent
*/
const streamServer = http
  .createServer(function (request, response) {
    // Log that a stream connection has come through
    console.log(
      "Stream Connection on " +
        STREAM_PORT +
        " from: " +
        request.socket.remoteAddress +
        ":" +
        request.socket.remotePort
    );

    // When data comes from the stream (FFmpeg) we'll pass this to the web socket
    request.on("data", function (data) {
      // Now that we have data let's pass it to   the web socket server
      webSocketServer.broadcast(data);
    });
  })
  .listen(STREAM_PORT); // Listen for streams on port 3001

/*
  3. Begin web socket server
*/
const webSocketServer = new WebSocket.Server({
  server: streamServer,
});

// Broadcast the stream via websocket to connected clients
webSocketServer.broadcast = function (data) {
  webSocketServer.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
};

/* 
  4. Send the command and streamon SDK commands to begin the Tello video stream.
  YOU MUST POWER UP AND CONNECT TO TELL BEFORE RUNNING THIS SCRIPT
*/
export const commandSocket = dgram.createSocket("udp4"); // 드론에게 명령을 보내는 소켓
commandSocket.send("command", TELLO_PORT, TELLO_IP, null);

// Send streamon
commandSocket.send("streamon", TELLO_PORT, TELLO_IP, null);

// 커맨드 응답 메시지
commandSocket.on("message", (msg, rinfo) => {
  console.log(
    `Drone Command Response : ${msg.toString()}, from :${rinfo.address}:${
      rinfo.port
    } command`
  );
  console.log("-------------------------------------");
});

/*
  5. Begin the ffmpeg stream. You must have Tello connected first
*/

// Delay for 3 seconds before we start ffmpeg
setTimeout(function () {
  var args = [
    "-i",
    "udp://0.0.0.0:11111",
    "-r",
    "30",
    "-s",
    "960x720",
    "-codec:v",
    "mpeg1video",
    "-b",
    "800k",
    "-f",
    "mpegts",
    "http://127.0.0.1:4000/stream",
  ];

  // Spawn an ffmpeg instance
  var streamer = spawn("ffmpeg", args);
  // Uncomment if you want to see ffmpeg stream info
  //streamer.stderr.pipe(process.stderr);
  streamer.on("exit", function (code) {
    console.log("Failure", code);
  });
}, 3000);


export const wsServer = SocketIO(httpServer, {
  // 리액트와 소켓 연결
  cors: {
    origin: `*`,
    methods: ["GET", "POST"],
  },
});



// 여기서 결판 //


const getTof = async () => {
  while(1){
    try {
      //명령 보내기
      var tof = await sdk.read.tof();
      const splitTof = tof.substring(4, 10);
      const numTof = Number(splitTof);
      console.log(`Tof = ${numTof}`); 

      if (numTof < 400){
        setTimeout(getTof, 1000);
        await sendCommand(avoidCommand);
        break;
      }

    } catch (err) {
      console.log(`Drone tof Error: ${err} ❌`);
    }
  }
  
};

getTof();


export const sendCommand = (command) => {
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


//---------------------------------여기서부터 목적지---------------------------//

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

const forward = async () => {
  console.log(`앞으로 1칸 이동`);
  await sendCommand(fwCommand);
}

const cwRotate = async () => {
  console.log(`오른쪽으로 회전`);
  await sendCommand(cwCommand);
}

const ccwRotate = async () => {
  console.log(`왼쪽으로 회전`);
  await sendCommand(ccwCommand);
}

const backRotate = async () => {
  console.log(`뒤로 회전`);
  await sendCommand(backRotateCommand);
}

// 종원_착륙기능------//
const Landend = async () => {
  console.log(`랜딩`);
  await sendCommand(landCommand);
}


const move = async (directionRow, directionColumn) => {
  var angle = 0;
  let backside = false;
  let index = 0;
  const timeInterval = 3500;
  if (directionRow > 0) {
    for (let i = 0; i < directionRow; i++){
      setTimeout(forward, timeInterval * (index + 1));
      index += 1;
    }
    
    if (directionColumn > 0) {
      angle += 90;
      setTimeout(cwRotate, timeInterval * (index + 1));
      index += 1;

      for (let i = 0; i < directionColumn; i++){
        setTimeout(forward, timeInterval * (index + 1));
        index += 1;
      }
    }

    else if (directionColumn < 0) {
      angle -= 90;
      setTimeout(ccwRotate, timeInterval * (index + 1));
      index += 1;

      for (let i = 0; i < -directionColumn; i++){
        setTimeout(forward, timeInterval * (index + 1));
        index += 1;
      }
    }
  }
  else if (directionRow < 0) {
    setTimeout(backRotate, timeInterval * (index + 1));
    index += 1;
    backside = true;
    for (let i = 0; i < -directionRow; i++){
      setTimeout(forward, timeInterval * (index + 1));
      index += 1;
    }

    if (directionColumn > 0) {
      angle += 90;
      setTimeout(ccwRotate, timeInterval * (index + 1));
      index += 1;
      backside = false;
      for (let i = 0; i < directionColumn; i++){
        setTimeout(forward, timeInterval * (index + 1));
        index += 1;
      }
    }
    else if (directionColumn < 0) {
      angle -= 90;
      setTimeout(cwRotate, timeInterval * (index + 1));
      index += 1;
      backside = false;
      for (let i = 0; i < -directionColumn; i++){
        setTimeout(forward, timeInterval * (index + 1));
        index += 1;
      }
    }
  }
  else {
    if (directionColumn > 0) {
      setTimeout(cwRotate, timeInterval * (index + 1));
      index += 1;
      angle += 90;
      for (let i = 0; i < directionColumn; i++){
        setTimeout(forward, timeInterval * (index + 1));
        index += 1;
      }
    }
    else if (directionColumn < 0) {
      setTimeout(ccwRotate, timeInterval * (index + 1));
      index += 1;
      angle -= 90;
      for (let i = 0; i < -directionColumn; i++){
        setTimeout(forward, timeInterval * (index + 1));
        index += 1;
      }
    }
  }

  // 도착 후 회전 처리
  if (angle > 0) {
    angle -= 90;
    setTimeout(ccwRotate, timeInterval * (index + 1));
    setTimeout(Landend, timeInterval * (index + 2));
  } else if (angle < 0) {
    angle += 90;
    setTimeout(cwRotate, timeInterval * (index + 1));
    setTimeout(Landend, timeInterval * (index + 2));
  }
  
  if (backside) {
    backside = false;
    setTimeout(backRotate, timeInterval * (index + 1));
    setTimeout(Landend, timeInterval * (index + 2));
  }
}



