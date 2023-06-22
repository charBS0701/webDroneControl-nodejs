const express = require("express");
const router = express.Router();

// 목적지 받는 API
let destination = "";

//=============== init부분 ===========
let first_flag = true;
let initRow = 3;
let initColumn = 1;
let nowRow, nowColumn;

const dic = {
  가좌동: 1,
  호탄동: 3,
  집: 4,
  평거동: 17,
};

const map = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
  [10, 11, 12],
  [13, 14, 15],
  [16, 17, 18],
];
//====================================

router.post("/", (req, res) => {
  destination = req.body.destination;
  console.log("================================");
  console.log("API received destination:", destination);

  if (first_flag) {
    nowRow = initRow;
    nowColumn = initColumn;
    first_flag = false;
  }

  const goal = dic[destination]; // 목표 지점 값

  if (goal != null) {
    console.log("goal: ", goal, `(${destination})`);

    let { goalRow, goalColumn } = findGoal(map, goal);

    console.log("nowRow: ", nowRow, "nowColumn: ", nowColumn);

    // directionRow: +값 = 앞으로, -값 = 뒤로
    // directionColumn: -값 = 왼쪽, +값 = 오른쪽
    let { directionRow, directionColumn } = calculateDirection(
      nowRow,
      nowColumn,
      goalRow,
      goalColumn
    );

    console.log(
      "directionRow:",
      directionRow,
      "directionColumn:",
      directionColumn
    );
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
};

const calculateDirection = (initRow, initColumn, goalRow, goalColumn) => {
  // 이동 방향 계산
  let directionRow = initRow - goalRow;
  let directionColumn = goalColumn - initColumn;

  return { directionRow, directionColumn };
};

const forward = async () => {
  console.log(`앞으로 1칸 이동`);
  await sendCommand(fwCommand);
};

const cwRotate = async () => {
  console.log(`오른쪽으로 회전`);
  await sendCommand(cwCommand);
};

const ccwRotate = async () => {
  console.log(`왼쪽으로 회전`);
  await sendCommand(ccwCommand);
};

const backRotate = async () => {
  console.log(`뒤로 회전`);
  await sendCommand(backRotateCommand);
};

// 종원_착륙기능------//
const Landend = async () => {
  console.log(`랜딩`);
  await sendCommand(landCommand);
};

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

module.exports = router;
