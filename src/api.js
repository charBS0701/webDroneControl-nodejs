import { app } from "../server";

// 목적지 받는 API
export let destination = "";
app.post("/api/destination", (req, res) => {
  destination = req.body.destination;
  console.log("API received destination:", destination);
  res.status(200).json({ message: "Destination received" });
});
