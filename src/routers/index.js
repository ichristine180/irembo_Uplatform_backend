import express from "express";
import auth from "./auth.js";
import user from "./user.js";
const api = express();
api.use("/auth", auth);
api.use("/user", user);
api.get("/", (req, res) => {
  res.json({
    message: "Welcome to uplatfrom.",
  });
});
api.use("/", (req, res) => {
  res.status(404).json({
    message: "Page not found.",
  });
});

export default api;
