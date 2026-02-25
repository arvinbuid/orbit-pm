import prisma from "../configs/prisma.js";

// Create task
export const createTask = async (req, res) => {
  try {
    const {userId} = req;
    const {projectId, title, description, status, type, priority, assigneeId, due_date} = req.body;
    const origin = req.get("origin");

    // Check if user have admin role for project
    const project = await prisma.project.findUnique({
      where: {id: projectId},
      include: {members: {include: {user: true}}},
    });

    // prettier-ignore
    if (!project) {
      return res.status(404).json({message: "Project not found."});
    } else if (project.team_lead !== userId) {
      return res.status(403).json({message: "You do not have permission to create tasks for this project."});
    } else if (assigneeId && !project.members.find((member) => member.userId === assigneeId)) {
      return res.status(403).json({message: "Assignee is not a member of this project/workspace."});
    }

    // Create task
    const task = await prisma.task.create({
      data: {
        projectId,
        title,
        description,
        status,
        type,
        priority,
        assigneeId,
        due_date: new Date(due_date),
      },
      include: {assignee: true},
    });

    res.json({task, message: "Task created successfully."});
  } catch (error) {
    console.error(error);
    res.status(500).json({message: error.code || error.message});
  }
};

// Update task
export const updateTask = async (req, res) => {
  try {
    const {userId} = req;
    const task = await prisma.task.findUnique({
      where: {id: req.params.id},
    });

    if (!task) {
      return res.status(404).json({message: "Task not found."});
    }

    // Check if user have admin role for project
    const project = await prisma.project.findUnique({
      where: {id: task.projectId},
      include: {members: {include: {user: true}}},
    });

    // prettier-ignore
    if (!project) {
      return res.status(404).json({message: "Project not found."});
    } else if (project.team_lead !== userId) {
      return res.status(403).json({message: "You do not have permission to create tasks for this project."});
    }

    // Update task
    const updatedTask = await prisma.task.update({
      where: {id: req.params.id},
      data: req.body,
    });

    res.json({task: updatedTask, message: "Task updated successfully."});
  } catch (error) {
    console.error(error);
    res.status(500).json({message: error.code || error.message});
  }
};
