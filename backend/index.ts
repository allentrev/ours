// index.ts
import dotenv from "dotenv";

/* -------------------- Env setup -------------------- */

const envFile =
  process.env.NODE_ENV === "production"
    ? ".env.production"
    : ".env";

dotenv.config({ path: envFile });

/* -------------------- Imports -------------------- */

import express, { Request, Response, NextFunction } from "express";
import cors, { CorsOptions } from "cors";

import { clerkMiddleware } from "@clerk/express";

import connectDB from "./lib/connectDB.js";

import userRouter from "./routes/user.route.js";
import postRouter from "./routes/post.route.js";
import dishesRouter from "./routes/dish.route.js";
import commentRouter from "./routes/comment.route.js";
import webhookRouter from "./routes/webhook.route.js";

import refDataRouter from "./routes/refData.route.js";
import imageRouter from "./routes/image.route.js";
import galleryRouter from "./routes/gallery.route.js";
/* -------------------- App setup -------------------- */

const app = express();
const PORT = Number(process.env.PORT) || 3000;

/* -------------------- CORS -------------------- */

const allowedOrigins =
  process.env.NODE_ENV === "production" && process.env.CLIENT_URL
    ? process.env.CLIENT_URL.split(",").map(o => o.trim().toLowerCase())
    : ["http://localhost:5173"];

const corsOptions: CorsOptions = {
  origin(origin, callback) {
    // Allow server-to-server / curl / mobile apps
    if (!origin) return callback(null, true);

    const normalizedOrigin = origin.toLowerCase();

    if (allowedOrigins.includes(normalizedOrigin)) {
      return callback(null, true);
    }

    return callback(
      new Error(`CORS blocked origin: ${origin}`),
      false
    );
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

/* -------------------- Start Server -------------------- */
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log("Allowed origins:", allowedOrigins);
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
};

/* -------------------- Middleware -------------------- */
app.use("/webhooks", webhookRouter);

app.use(cors(corsOptions));
app.use(express.json());
app.use(clerkMiddleware());

console.log("Node Env = ", process.env.NODE_ENV);

/* -------------------- Trace Route -------------------- */

//if (process.env.NODE_ENV !== "testing, should be production") {
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.url !== "/health") {
      console.log(`Incoming request: [${req.method}] ${req.url}`);
    } 
    next();
  });
//}

/* -------------------- Routers -------------------- */

app.use("/refData", refDataRouter);
app.use("/image", imageRouter);
app.use("/gallery", galleryRouter);
app.use("/dishes", dishesRouter)

app.use("/users", userRouter);
app.use("/posts", postRouter);
app.use("/comments", commentRouter);

/* -------------------- Routes -------------------- */
/* Health / readiness check */
console.log("Registering /test route");
app.get("/", (_req, res) => {
  res.status(200).send("Backend running");
});

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "healthy" });
});

app.get("/test", (_req, res) => {
  res.status(200).json({
    status: "ok",
    marker: "build-2026-03-31-a"
  });
});

/* -------------------- Error handler -------------------- */

app.use(
  (err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err);

    res.status(err.status || 500).json({
      message: err.message || "Something went wrong",
    });
  }
);

/* -------------------- Start server -------------------- */

startServer();

/* -------------------- Process safety -------------------- */

process.on("uncaughtException", err => {
  console.error("Uncaught Exception:", err);
});

process.on("unhandledRejection", reason => {
  console.error("Unhandled Rejection:", reason);
});
