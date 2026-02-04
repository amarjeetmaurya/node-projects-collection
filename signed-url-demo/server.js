const express = require("express");
const crypto = require("crypto");
const path = require("path");

const app = express();
const PORT = 3000;

// SECRET (never expose this)
const SECRET = "MY_SUPER_SECRET_KEY";

// helper: create signature
function sign(data) {
  return crypto
    .createHmac("sha256", SECRET)
    .update(data)
    .digest("hex");
}

// ===============================
// 1️⃣ Generate Signed URL
// ===============================
app.get("/generate", (req, res) => {
  const filename = "test.txt";

  // expire in 30 seconds
  const expires = Date.now() + 30 * 1000;

  const dataToSign = filename + expires;
  const signature = sign(dataToSign);

  const signedUrl = `http://localhost:${PORT}/file?name=${filename}&expires=${expires}&sig=${signature}`;

  res.json({
    signedUrl
  });
});

// ===============================
// 2️⃣ Access File
// ===============================
app.get("/file", (req, res) => {
  const { name, expires, sig } = req.query;

  if (!name || !expires || !sig) {
    return res.status(400).send("Missing parameters");
  }

  // check expiry
  if (Date.now() > Number(expires)) {
    return res.status(403).send("Link expired");
  }

  // verify signature
  const expectedSig = sign(name + expires);

  if (expectedSig !== sig) {
    return res.status(403).send("Invalid signature");
  }

  // serve file
  const filePath = path.join(__dirname, "files", name);
  res.sendFile(filePath);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
