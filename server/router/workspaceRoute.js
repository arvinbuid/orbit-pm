import express from "express";
import {addMember, getUserWorkspaces, inviteMember} from "../controllers/workspaceController.js";

const workspaceRouter = express.Router();

workspaceRouter.get("/", getUserWorkspaces);
workspaceRouter.post("/invite-member", inviteMember);
workspaceRouter.post("/add-member", addMember);

export default workspaceRouter;
