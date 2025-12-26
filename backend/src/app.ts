import express from "express";
import { prisma } from "./config/db.js";

const app = express();

app.use(express.json());

app.get("/", async (_req, res) => {
    res.json({ message: "API running 🚀" });
});

export default app;