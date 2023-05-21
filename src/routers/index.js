import express from "express";
import auth from "./auth.js";
import user from "./user.js";
const api = express();
api.use("/auth", auth);
api.use("/user", user);


export default api;
