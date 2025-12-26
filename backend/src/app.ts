import express from "express";
import { prisma } from "./config/db.js";
import errorHandler from "./middleware/error-handler.js";
import notFound from "./middleware/not-found.js";

const app = express();

app.use(express.json());

app.get("/", async (_req, res) => {
    res.json({ message: "API running 🚀" });
});

app.use(notFound);
app.use(errorHandler);

export default app;