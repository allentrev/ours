import express, { Request, Response, NextFunction }  from "express";
import cors from "cors";

import { clerkMiddleware, requireAuth } from "@clerk/express";

import connectDB from "./lib/connectDB.js";
import userRouter from "./routes/user.route.js";
import postRouter from "./routes/post.route.js";
import commentRouter from "./routes/comment.route.js";
import webhookRouter from "./routes/webhook.route.js";

const app = express();
const PORT = process.env.PORT || 3000;
const IK_PRIVATE_KEY = process.env.IK_PRIVATE_KEY;


const allowedOrigins =
    process.env.NODE_ENV === "production" && process.env.CLIENT_URL
        ? process.env.CLIENT_URL.split(",")
        : ["http://localhost:5173"];

console.log("Allowed origins:", allowedOrigins);

app.use(
    cors({
        origin: function (origin, callback) {
            // Allow requests with no origin (like mobile apps, curl, Postman)
            if (!origin) return callback(null, true);
            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            } else {
                return callback(
                    new Error(`CORS not allowed from this origin [${origin}]`),
                    false
                );
            }
        },
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true, // Optional: enable if using cookies/sessions
        optionsSuccessStatus: 204, //Important for legacy browser support
    })
);

app.get("/health", (req, res) => res.send("OK"));

app.use(clerkMiddleware());
app.use("/webhooks", webhookRouter);
app.use(express.json());

app.use((req, res, next) => {
    console.log(`Incoming request: ${req.method} ${req.url} and body:`);
    console.log(req.body);
    next();
});



// app.get("/test",(req,res)=>{
//   res.status(200).send("it works!")
// })

// app.get("/auth-state", (req, res) => {
//   const authState = req.auth;
//   res.json(authState);
// });

// app.get("/protect", (req, res) => {
//   const {userId} = req.auth;
//   if(!userId){
//     return res.status(401).json("not authenticated")
//   }
//   res.status(200).json("content")
// });

// app.get("/protect2", requireAuth(), (req, res) => {
//   res.status(200).json("content")
// });

app.use("/users", userRouter);
app.use("/posts", postRouter);
app.use("/comments", commentRouter);

app.use((error: any, req: Request, res: Response, next: NextFunction) => {
    res.status(error.status || 500);
    res.json({
        message: error.message || "Soemthing went wrong",
        status: error.status,
        stack: error.stack,
    });
});

app.listen(PORT, () => {
    connectDB();
    console.log(`Listening for client_url ${process.env.CLIENT_URL}`);
    console.log(`🚀 Server running on port: ${PORT}`);
});

process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception:", err);
});

process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection at:", promise, "reason:", reason);
});
