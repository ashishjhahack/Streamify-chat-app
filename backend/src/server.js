import express from "express";
import "dotenv/config";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";    // it is coming from node.js
// import { fileURLToPath } from "url";

import { connectDB } from "./lib/db.js";
import  authRoutes  from "./routes/auth.route.js";
import  chatRoutes  from "./routes/chat.route.js";
import  userRoutes  from "./routes/user.route.js";


const app = express();
const PORT = process.env.PORT;

const __dirname = path.resolve();   // this is used to get the current directory name. if we don't use this, the path will be relative to the current file, not the root directory

// in ES moduler __dirname is not defined by default
// const __filename = fileURLToPath(import.meta.url); // Required in ES Modules
// const __dirname = path.dirname(__filename);        // Required in ES Modules

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true, // allow cookies to be sent with requests
}))

app.use(express.json());  // to parse JSON bodies {email, password, ...}
app.use(cookieParser()); // to parse cookies

if(process.env.NODE_ENV === "production"){
    app.use(express.static(path.join(__dirname, "../frontend/dist")));

    app.get("/*splat", (req, res) => {
        res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
    })
}

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);

app.listen(PORT, () => {
    console.log(`server is listening on ${PORT}`)
    connectDB();
});
