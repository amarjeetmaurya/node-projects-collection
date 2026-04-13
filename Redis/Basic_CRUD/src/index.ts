import express from "express";
import type { Request, Response, NextFunction} from "express";
import redisClient from "./config/redis.js";
import createRedisRoute from "./routes/createRedis.route.js";

const app = express();

app.use((req: Request, res: Response, next: NextFunction) => {
  console.log("first");
  next();
});
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  console.log("Hello!!")
  res.status(200).json({sucess: "Yeah I'm OKey!!!"});
});

async function startServer() {
  try {
    await redisClient.connect();
    console.log("Redis connected");

    // Mount routes
    app.use(
      "/create",
      (req: Request, res: Response, next: NextFunction) => {
        console.log("way towards create....");
        next();
      },
      createRedisRoute,
    );

    app.listen(3000, () => {
      console.log("Server running on port 3000");
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

startServer();
