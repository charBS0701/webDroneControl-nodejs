require("dotenv").config(); // .env 파일에서 환경변수 가져오기
const http = require("http");
const WebSocket = require("ws");
const spawn = require("child_process").spawn;
const dgram = require("dgram");

// 2. Create the stream server where the video stream will be sent/
// const streamServer = http
//   .createServer(function (request, response) {
//     // Log that a stream connection has come through
//     console.log(
//       "Stream Connection on " +
//         STREAM_PORT +
//         " from: " +
//         request.socket.remoteAddress +
//         ":" +
//         request.socket.remotePort
//     );

//     // When data comes from the stream (FFmpeg) we'll pass this to the web socket
//     request.on("data", function (data) {
//       // Now that we have data let's pass it to the web socket server
//       webSocketServer.broadcast(data);
//     });
//   })
//   .listen(STREAM_PORT); // Listen for streams on port 3001

/*
  3. Begin web socket server
*/
// const webSocketServer = new WebSocket.Server({
//   server: streamServer,
// });

// // Broadcast the stream via websocket to connected clients
// webSocketServer.broadcast = function (data) {
//   webSocketServer.clients.forEach(function each(client) {
//     if (client.readyState === WebSocket.OPEN) {
//       client.send(data);
//     }
//   });
// };

/*
  5. Begin the ffmpeg stream. You must have Tello connected first
*/
// Delay for 3 seconds before we start ffmpeg
// setTimeout(function () {
//   var args = [
//     "-i",
//     "udp://0.0.0.0:11111",
//     "-r",
//     "30",
//     "-s",
//     "960x720",
//     "-codec:v",
//     "mpeg1video",
//     "-b",
//     "800k",
//     "-f",
//     "mpegts",
//     `${process.env.HOST}:${process.env.PORT}/stream`,
//   ];

//   // Spawn an ffmpeg instance
//   var streamer = spawn("ffmpeg", args);
//   // Uncomment if you want to see ffmpeg stream info
//   //streamer.stderr.pipe(process.stderr);
//   streamer.on("exit", function (code) {
//     console.log("Failure", code);
//   });
// }, 3000);
