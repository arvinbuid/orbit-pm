import {clerkClient} from "@clerk/express";
import prisma from "../configs/prisma.js";

const workspaceInclude = {
  members: {include: {user: true}},
  projects: {
    include: {
      tasks: {
        include: {assignee: true, comments: {include: {user: true}}},
      },
      members: {include: {user: true}},
    },
  },
  owner: true,
};

const normalizeWorkspaceRole = (role) => {
  const normalizedRole = String(role ?? "org:member")
    .replace(/^org:/i, "")
    .toUpperCase();

  return normalizedRole === "ADMIN" ? "ADMIN" : "MEMBER";
};

const getPrimaryEmail = (user) => {
  return (
    user.emailAddresses.find((email) => email.id === user.primaryEmailAddressId)?.emailAddress ||
    user.emailAddresses[0]?.emailAddress ||
    ""
  );
};

const getUserName = (user) => {
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  return fullName || getPrimaryEmail(user) || "Unknown User";
};

const upsertUserFromClerk = async (clerkUserId) => {
  const clerkUser = await clerkClient.users.getUser(clerkUserId);

  return prisma.user.upsert({
    where: {
      id: clerkUser.id,
    },
    create: {
      id: clerkUser.id,
      email: getPrimaryEmail(clerkUser),
      name: getUserName(clerkUser),
      image: clerkUser.imageUrl,
    },
    update: {
      email: getPrimaryEmail(clerkUser),
      name: getUserName(clerkUser),
      image: clerkUser.imageUrl,
    },
  });
};

const syncUserWorkspacesFromClerk = async (userId) => {
  await upsertUserFromClerk(userId);

  const {data: memberships} = await clerkClient.users.getOrganizationMembershipList({
    userId,
    limit: 100,
  });

  for (const membership of memberships) {
    const organization = membership.organization;
    const ownerId = organization.createdBy || userId;

    await upsertUserFromClerk(ownerId);

    await prisma.workspace.upsert({
      where: {
        id: organization.id,
      },
      create: {
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
        description: null,
        ownerId,
        image_url: organization.imageUrl,
      },
      update: {
        name: organization.name,
        slug: organization.slug,
        image_url: organization.imageUrl,
        ownerId,
      },
    });

    await prisma.workspaceMember.upsert({
      where: {
        userId_workspaceId: {
          userId,
          workspaceId: organization.id,
        },
      },
      create: {
        userId,
        workspaceId: organization.id,
        role: normalizeWorkspaceRole(membership.role),
      },
      update: {
        role: normalizeWorkspaceRole(membership.role),
      },
    });
  }
};

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

    let workspaces = await findUserWorkspaces(userId);

    if (workspaces.length === 0) {
      await syncUserWorkspacesFromClerk(userId);
      workspaces = await findUserWorkspaces(userId);
    }

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

    //  Check if user exists
    if (!user) {
      return res.status(404).json({message: "User not found."});
    }

    if (!role || !workspaceId) {
      return res.status(400).json({message: "Missing required parameters."});
    }

    if (!["ADMIN", "MEMBER"].includes(role)) {
      return res.status(400).json({message: "Invalid role."});
    }

    // Fetch workspace
    const workspace = await prisma.workspace.findUnique({
      where: {id: workspaceId},
      include: {members: true},
    });

    if (!workspace) {
      return res.status(404).json({message: "Workspace not found."});
    }

    // Check if creator has admin role
    if (!workspace.members.find((member) => member.userId === userId && member.role === "ADMIN")) {
      return res.status(401).json({message: "You do not have admin privileges."});
    }

    // Check if user is already a member
    const existingMember = workspace.members.find((member) => member.userId === user.id);

    if (existingMember) {
      return res.status(400).json({message: "User is already a member."});
    }

    // Add member to workspace
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
