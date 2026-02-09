import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8080 });

console.log("✅ Server running on ws://localhost:8080");

const clients = new Map(); // clientId -> ws

wss.on("connection", (ws) => {
  console.log("Socket connected");

  ws.on("message", (raw) => {
    const data = JSON.parse(raw);

    // First message = join
    if (data.type === "join") {
      ws.clientId = data.id;
      clients.set(data.id, ws);

      broadcast(`🟢 ${data.id} joined`);
      return;
    }

    // Chat message
    if (data.type === "chat") {
      broadcast(`${ws.clientId}: ${data.message}`);
    }
  });

  ws.on("close", () => {
    if (ws.clientId) {
      clients.delete(ws.clientId);
      broadcast(`🔴 ${ws.clientId} left`);
    }
  });
});

function broadcast(msg) {
  for (const ws of clients.values()) {
    if (ws.readyState === 1) {
      ws.send(msg);
    }
  }
}
