import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import api from "./src/routers/index.js";
import rateLimit from "express-rate-limit";
import redis from "redis";
import { syncDatabase } from "./dbSync.js";
dotenv.config();

const client = redis.createClient({
  password: process.env.REDIS_USER_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
});

export const redisAsyncClient = client;
await redisAsyncClient.connect();

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 10 requests per windowMs
  message: "Too many attempts, please try again later",
});
app.use(limiter);
app.use((req, res, next) => {
  res.header({"Access-Control-Allow-Origin": "*"});
  next();
}) 
app.use("/api", api);
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to uplatfrom.",
  });
});
app.use("/", (req, res) => {
  res.status(404).json({
    message: "Page not found.",
  });
});
// for creating tables
await syncDatabase();
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});


