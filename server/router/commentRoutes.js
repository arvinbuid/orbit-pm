import express from "express";
import {createComment, getTaskComments} from "../controllers/commentController.js";

const commentRouter = express.Router();

commentRouter.post("/", createComment);
commentRouter.get("/:taskId", getTaskComments);

export default commentRouter;
