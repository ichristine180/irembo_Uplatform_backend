import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import routes from "./src/routes/user.js";
import rateLimit from "express-rate-limit";
import redis from "redis";
dotenv.config();
//creating redis server for caching data
export const redisAsyncClient = redis.createClient(process.env.PORT || 6379);
await redisAsyncClient.connect();

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

redisAsyncClient.on("error", (error) => {
  console.error(error);
});
// Limit requests per IP to prevent brute-force attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per windowMs
  message: "Too many attempts, please try again later",
});
app.use(limiter);
app.use("/api", routes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
