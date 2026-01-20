import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
const PORT = 3000;

app.get("/", (req, res) => {
  // console.log(req.headers);
  console.log(req.header("origin"));
  // res.send("File Upload Server is running");
  res.status(200).json({ message: "File Upload Server is running" });
});

app.get("/status", (req, res) => {
  res.status(200).json({ message: "File Upload Server is running" });
});
// basic post request sender not file uploader
app.post("/", async (req, res) => {
  console.log(req.body);
  res.status(201).json({ message: "POST request received" });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
