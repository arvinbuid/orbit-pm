import express from "express";
import "dotenv/config";
import cors from "cors";
import {clerkMiddleware} from "@clerk/express";
import {serve} from "inngest/express";
import {inngest, functions} from "./inngest/index.js";

const app = express();

app.use(express.json());
app.use(cors());

app.use(clerkMiddleware());

// Set up the "/api/inngest" (recommended) routes with the serve handler
app.use("/api/inngest", serve({client: inngest, functions}));

app.get("/", (req, res) => res.send("Server is live..."));

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
