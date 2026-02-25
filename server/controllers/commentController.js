import prisma from "../configs/prisma.js";

// Create comment
export const createComment = async (req, res) => {
  try {
    const {userId} = req;
    const {taskId, content} = req.body;

    // Check if user is project member
    const task = await prisma.task.findUnique({
      where: {id: taskId},
    });

    if (!task) {
      return res.status(404).json({message: "Task not found."});
    }

    const project = await prisma.project.findUnique({
      where: {id: task.projectId},
      include: {members: {include: {user: true}}},
    });

    if (!project) {
      return res.status(404).json({message: "Project not found."});
    } else if (!project.members.find((member) => member.userId === userId)) {
      return res.status(403).json({message: "You are not a member of this project."});
    }

    // Create comment
    const comment = await prisma.comment.create({
      data: {taskId, userId, content},
      include: {user: true},
    });

    res.json({comment});
  } catch (error) {
    console.error(error);
    res.status(500).json({message: error.code || error.message});
  }
};

// Get comments for task
export const getTaskComments = async (req, res) => {
  try {
    const {taskId} = req.params;
    const comments = await prisma.comment.findMany({
      where: {taskId},
      include: {user: true},
    });
    res.json({comments});
  } catch (error) {
    console.error(error);
    res.status(500).json({message: error.code || error.message});
  }
};
