import {clerkClient} from "@clerk/express";
import prisma from "../configs/prisma.js";
import {syncUserWorkspacesFromClerk, workspaceInclude} from "../services/clerkSyncService.js";

const findUserWorkspaces = (userId) =>
  prisma.workspace.findMany({
    where: {
      members: {some: {userId}},
    },
    include: workspaceInclude,
  });

// Get all user workspaces
export const getUserWorkspaces = async (req, res) => {
  try {
    const {userId} = req;

    if (!userId) {
      return res.status(401).json({message: "Unauthorized. No valid session."});
    }

    await syncUserWorkspacesFromClerk(userId);
    const workspaces = await findUserWorkspaces(userId);

    res.json({workspaces});
  } catch (err) {
    console.error(err);
    res.status(500).json({message: err.code || err.message});
  }
};

// Add member to workspace
export const addMember = async (req, res) => {
  try {
    const {userId} = req;
    const {email, role, workspaceId, message} = req.body;

    const user = await prisma.user.findUnique({where: {email}});

    if (!user) {
      return res.status(404).json({message: "User not found."});
    }

    if (!role || !workspaceId) {
      return res.status(400).json({message: "Missing required parameters."});
    }

    if (!["ADMIN", "MEMBER"].includes(role)) {
      return res.status(400).json({message: "Invalid role."});
    }

    const workspace = await prisma.workspace.findUnique({
      where: {id: workspaceId},
      include: {members: true},
    });

    if (!workspace) {
      return res.status(404).json({message: "Workspace not found."});
    }

    if (!workspace.members.find((member) => member.userId === userId && member.role === "ADMIN")) {
      return res.status(401).json({message: "You do not have admin privileges."});
    }

    const existingMember = workspace.members.find((member) => member.userId === user.id);

    if (existingMember) {
      return res.status(400).json({message: "User is already a member."});
    }

    const member = await prisma.workspaceMember.create({
      data: {
        userId: user.id,
        workspaceId,
        role,
        message,
      },
    });

    res.json({
      member,
      message: "Member added successfully.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({message: err.code || err.message});
  }
};

export const inviteMember = async (req, res) => {
  try {
    const {userId} = req;
    const {email, role, workspaceId} = req.body;

    if (!email || !role || !workspaceId) {
      return res.status(400).json({message: "Missing required parameters."});
    }

    if (!["org:admin", "org:member"].includes(role)) {
      return res.status(400).json({message: "Invalid role."});
    }

    const workspace = await prisma.workspace.findUnique({
      where: {id: workspaceId},
      include: {members: true},
    });

    if (!workspace) {
      return res.status(404).json({message: "Workspace not found."});
    }

    const isAdmin = workspace.members.some(
      (member) => member.userId === userId && member.role === "ADMIN",
    );

    if (!isAdmin) {
      return res.status(403).json({message: "You do not have admin privileges."});
    }

    const existingMember = await prisma.user.findUnique({
      where: {email},
      include: {workspaces: true},
    });

    if (
      existingMember?.workspaces.some((membership) => membership.workspaceId === workspaceId)
    ) {
      return res.status(400).json({message: "User is already a member."});
    }

    const origin = req.get("origin") || process.env.CLIENT_URL || "http://localhost:3000";
    const redirectUrl = new URL("/accept-invitation", origin);
    redirectUrl.searchParams.set("workspaceId", workspaceId);
    redirectUrl.searchParams.set("redirectTo", "/team");

    const invitation = await clerkClient.organizations.createOrganizationInvitation({
      organizationId: workspaceId,
      emailAddress: email.trim(),
      role,
      inviterUserId: userId,
      redirectUrl: redirectUrl.toString(),
      publicMetadata: {
        workspaceId,
        redirectTo: "/team",
      },
    });

    res.json({
      invitationId: invitation.id,
      message: "Invitation sent successfully.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({message: err.errors?.[0]?.longMessage || err.code || err.message});
  }
};
