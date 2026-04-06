import prisma from "../configs/prisma.js";
import {inngest} from "../inngest/index.js";
import {getClientAppUrl} from "../utils.js";

// Create task
export const createTask = async (req, res) => {
  try {
    const {userId} = req;
    const {projectId, title, description, status, type, priority, assigneeId, due_date} = req.body;
    const appUrl = getClientAppUrl();

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

    // Trigger send email inngest event
    await inngest.send({
      name: "app/task.assigned",
      data: {taskId: task.id, appUrl},
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
      return res.status(403).json({message: "You do not have permission to update tasks for this project."});
    }

    if (Object.hasOwn(req.body, "projectId") && req.body.projectId !== task.projectId) {
      return res.status(400).json({message: "Changing a task's project is not allowed."});
    }

    if (Object.hasOwn(req.body, "assigneeId")) {
      const {assigneeId} = req.body;

      if (!assigneeId) {
        return res.status(400).json({message: "Assignee is required."});
      }

      if (!project.members.find((member) => member.userId === assigneeId)) {
        return res.status(403).json({message: "Assignee is not a member of this project/workspace."});
      }
    }

    // Update task
    const allowedUpdates = {
      ...(Object.hasOwn(req.body, "title") ? {title: req.body.title} : {}),
      ...(Object.hasOwn(req.body, "description") ? {description: req.body.description} : {}),
      ...(Object.hasOwn(req.body, "status") ? {status: req.body.status} : {}),
      ...(Object.hasOwn(req.body, "type") ? {type: req.body.type} : {}),
      ...(Object.hasOwn(req.body, "priority") ? {priority: req.body.priority} : {}),
      ...(Object.hasOwn(req.body, "assigneeId") ? {assigneeId: req.body.assigneeId} : {}),
      ...(Object.hasOwn(req.body, "due_date") ? {due_date: new Date(req.body.due_date)} : {}),
    };

    const updatedTask = await prisma.task.update({
      where: {id: req.params.id},
      data: allowedUpdates,
    });

    res.json({task: updatedTask, message: "Task updated successfully."});
  } catch (error) {
    console.error(error);
    res.status(500).json({message: error.code || error.message});
  }
};

export const deleteTask = async (req, res) => {
  try {
    const {userId} = req;
    const {taskIds} = req.body;

     if (!Array.isArray(taskIds) || taskIds.length === 0) {
      return res.status(400).json({message: "No task ids provided."});
    }

    const tasks = await prisma.task.findMany({
      where: {id: {in: taskIds}},
    });

    if (tasks.length === 0) {
      return res.status(404).json({message: "Task not found."});
    }

    const projectIds = [...new Set(tasks.map((task) => task.projectId))];
    const authorizedProjects = await prisma.project.findMany({
      where: {
        id: {in: projectIds},
        team_lead: userId,
      },
      select: {id: true},
    });

    if (authorizedProjects.length !== projectIds.length || tasks.length !== taskIds.length) {
      return res.status(403).json({message: "You do not have permission to delete one or more tasks."});
    }

    await prisma.task.deleteMany({
      where: {id: {in: taskIds}},
    });

    res.json({message: "Task deleted successfully."});
  } catch (error) {
    console.error(error);
    res.status(500).json({message: error.code || error.message});
  }
};
