import http from "http";

// 1️⃣ Define functions that can be called remotely
const methods = {
  add: (a, b) => a + b,
  multiply: (a, b) => a * b,
};

// 2️⃣ Create server
const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5500");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }
  
  if (req.method !== "POST") {
    res.writeHead(405);
    return res.end("Only POST allowed");
  }

  let body = "";

  req.on("data", (chunk) => {
    body += chunk;
  });

  req.on("end", () => {
    const { method, params } = JSON.parse(body);

    // 3️⃣ Call the function dynamically
    const result = methods[method](...params);

    // 4️⃣ Send result back
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ result }));
  });
});

server.listen(4000, () => {
  console.log("RPC Server running on port 4000");
});
