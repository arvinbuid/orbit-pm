import express from "express";
import "dotenv/config";
import cors from "cors";
import helmet from "helmet";
import {clerkMiddleware} from "@clerk/express";
import {serve} from "inngest/express";
import {inngest, functions} from "./inngest/index.js";
import {protect} from "./middlewares/authMiddleware.js";
import {handleClerkWebhook} from "./controllers/clerkWebhookController.js";

import workspaceRouter from "./router/workspaceRoute.js";
import projectRouter from "./router/projectRoutes.js";
import taskRouter from "./router/taskRoutes.js";
import commentRouter from "./router/commentRoutes.js";

const app = express();

// Only accept browser requests from the approved frontend URLs
const configuredOrigins = [
  process.env.CLIENT_URL,
  ...(process.env.CORS_ORIGINS || "").split(",").map((origin) => origin.trim()),
  ...(process.env.NODE_ENV === "production"
    ? []
    : ["http://localhost:3000", "http://localhost:5173"]),
].filter(Boolean);

const apiHelmet = helmet({
  contentSecurityPolicy: {
    useDefaults: false,
    directives: {
      defaultSrc: ["'none'"],
      baseUri: ["'none'"],
      frameAncestors: ["'none'"],
      formAction: ["'none'"],
      objectSrc: ["'none'"],
    },
  },
  referrerPolicy: {
    policy: "no-referrer",
  },
  xFrameOptions: {
    action: "deny",
  },
});

app.use(apiHelmet); // security headers
app.use(express.json()); // body parsing
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || configuredOrigins.includes(origin)) {
        return callback(null, true); // allow request
      }

      return callback(new Error("Origin not allowed by CORS.")); // block request
    },
  }),
); // CORS
app.use(clerkMiddleware()); // clerk auth

app.get("/", (req, res) => res.send("Server is live..."));

// Inngest API endpoint
app.use("/api/inngest", serve({client: inngest, functions}));

// Clerk Webhooks
app.post("/api/webhooks/clerk", express.raw({type: "application/json"}), handleClerkWebhook);

// Routes
app.use("/api/workspaces", protect, workspaceRouter);
app.use("/api/projects", protect, projectRouter);
app.use("/api/tasks", protect, taskRouter);
app.use("/api/comments", protect, commentRouter);

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
