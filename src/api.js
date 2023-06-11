import { app } from "../server";
const sdk = require("tellojs");

// 목적지 받는 API
let destination = "";

//=============== init부분 ===========
let first_flag = true;
let initRow = 3;
let initColumn = 1;

const dic = {
  '집' : 4,
  '가좌동':1,
  '호탄동':3
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
  console.log("API received destination:", destination);

  let nowRow, nowColumn;

  if(first_flag){
    nowRow = initRow;
    nowColumn = initColumn;
    first_flag = false;
  } 

  const goal = dic[destination];  // 목표 지점 값

  let { goalRow, goalColumn } = findGoal(map, goal);
  
  // directionRow: +값 = 앞으로, -값 = 뒤로
  // directionColumn: -값 = 왼쪽, +값 = 오른쪽
  let { directionRow, directionColumn }  = calculateDirection(initRow, initColumn, goalRow, goalColumn);

  console.log("directionRow:", directionRow, "directionColumn:", directionColumn);

  initRow = directionRow;
  initColumn = directionColumn;

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