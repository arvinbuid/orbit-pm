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
