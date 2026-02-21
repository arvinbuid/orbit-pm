// Get all user workspaces
export const getUserWorkspaces = async (req, res) => {
  try {
    const {userId} = await req.auth();
    const workspaces = await prisma.workspaces.findMany({
      where: {
        members: {some: {userId: userId}},
      },
      include: {
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
      },
    });

    res.json({workspaces});
  } catch (err) {
    console.error(err);
    res.status(500).json({message: err.code || err.message});
  }
};

// Add member to workspace
export const addMember = async (req, res) => {
  try {
    const {userId} = await req.auth();
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
    const existingMember = workspace.members.find((member) => member.userId === userId);

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
