import { app } from "../server";

// 목적지 받는 API
let destination = "";
app.post("/api/destination", (req, res) => {
  destination = req.body.destination;
  console.log("API received destination:", destination);

  //==========================================

  const dic = {
    '집' : 4,
    '가좌동':1,
    '호탄동':3
  }

  const calculateDirection = (matrix, initRow, initColumn, goal) => {
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

    // 이동 방향 계산
    let directionRow = goalRow - initRow;
    let directionColumn = goalColumn - initColumn;

    return { directionRow, directionColumn };
  }

  const map = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
    [10, 11, 12],
    [13, 14, 15],
    [16, 17, 18]
  ];

  const initRow = 3;
  const initColumn = 1;

  const goal = dic[destination];  // 목표 지점 값
  // directionRow: -값 = 앞으로, +값 = 뒤로
  // directionColumn: -값 = 왼쪽, +값 = 오른쪽
  if(goal == 3 || goal == 1 || goal == 4){
    let { directionRow, directionColumn } = calculateDirection(map, initRow, initColumn, goal);
    console.log("directionRow:", directionRow, "directionColumn:", directionColumn);
  }
  else{
    console.log("directionRow:", 0, "directionColumn:", 0);
  }
  
  //==========================================
  res.status(200).json({ message: "Destination received" });
});