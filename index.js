import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import api from "./src/routers/index.js";
import rateLimit from "express-rate-limit";
import url from "url";
import redis from "redis";
dotenv.config();
let redisClient
if(process.env.REDIS_URL){
  const redisURL=url.parse(process.env.REDIS_URL)
    redisClient = redis.createClient(redisURL.port, redisURL.hostname, {no_ready_check: true})
} else {
    redisClient = redis.createClient()
}
export const redisAsyncClient = redisClient;
await redisAsyncClient.connect();

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const corsOptions = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));
redisAsyncClient.on("error", (error) => {
  console.error(error);
});
// Limit requests per IP to prevent brute-force attacks
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 10, // 10 requests per windowMs
//   message: "Too many attempts, please try again later",
// });
// app.use(limiter);
app.use("/api", api);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
