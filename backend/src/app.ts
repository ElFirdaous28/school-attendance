import express from "express";
import authRoutes from "./routes/auth.routes.js";
import errorHandler from "./middleware/error-handler.js";
import notFound from "./middleware/not-found.js";
import { checkDbConnection } from "./config/db.js";
import userRoutes from "./routes/user.routes.js";

const app = express();

// checkDbConnection();

app.use(express.json());

app.get("/", async (_req, res) => {
    res.json({ message: "API running 🚀" });
});

// try {
//   const userRoutes = (await import("./routes/user.routes.js")).default;
//   app.use("/api/users", userRoutes);
// } catch (err) {
//   console.error("❌ userRoutes import failed:", err);
// }


app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;