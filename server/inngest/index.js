import {Inngest} from "inngest";
import prisma from "../configs/prisma.js";
import sendEmail from "../configs/nodemailer.js";
import {buildEmailBody} from "../utils.js";

// Create a client to send and receive events
export const inngest = new Inngest({id: "project-management-lenis"});

// Inngest functions for Users
const syncUserCreation = inngest.createFunction(
  {id: "sync-user-from-clerk"},
  {event: "clerk/user.created"},
  async ({event}) => {
    const {data} = event;
    await prisma.user.create({
      data: {
        id: data.id,
        email: data?.email_addresses[0]?.email_address,
        name: data?.first_name + " " + data?.last_name,
        image: data?.image_url,
      },
    });
  },
);

const syncUserDeletion = inngest.createFunction(
  {id: "delete-user-with-clerk"},
  {event: "clerk/user.deleted"},
  async ({event}) => {
    const {data} = event;
    await prisma.user.delete({
      where: {
        id: data.id,
      },
    });
  },
);

const syncUserUpdation = inngest.createFunction(
  {id: "update-user-from-clerk"},
  {event: "clerk/user.updated"},
  async ({event}) => {
    const {data} = event;
    await prisma.user.update({
      where: {
        id: data.id,
      },
      data: {
        email: data?.email_addresses[0]?.email_address,
        name: data?.first_name + " " + data?.last_name,
        image: data?.image_url,
      },
    });
  },
);

// Inngest functions for Workspaces
const syncWorkspaceCreation = inngest.createFunction(
  {id: "sync-workspace-from-clerk"},
  {event: "clerk/organization.created"},
  async ({event}) => {
    const {data} = event;
    await prisma.workspace.create({
      data: {
        id: data.id,
        name: data.name,
        slug: data.slug,
        description: data?.description,
        ownerId: data.created_by,
        image_url: data.image_url,
      },
    });

    // Add creator as admin member
    await prisma.workspaceMember.create({
      data: {
        userId: data.created_by,
        workspaceId: data.id,
        role: "ADMIN",
      },
    });
  },
);

const syncWorkspaceUpdation = inngest.createFunction(
  {id: "update-workspace-from-clerk"},
  {event: "clerk/organization.updated"},
  async ({event}) => {
    const {data} = event;
    await prisma.workspace.update({
      where: {
        id: data.id,
      },
      data: {
        name: data.name,
        slug: data.slug,
        description: data?.description,
        image_url: data.image_url,
      },
    });
  },
);

const syncWorkspaceDeletion = inngest.createFunction(
  {id: "delete-workspace-with-clerk"},
  {event: "clerk/organization.deleted"},
  async ({event}) => {
    const {data} = event;
    await prisma.workspace.delete({
      where: {
        id: data.id,
      },
    });
  },
);

// Inngest for Workspace Members
const syncWorkspaceMemberCreation = inngest.createFunction(
  {id: "sync-workspace-member-from-clerk"},
  {event: "clerk/organizationInvitation.accepted"},
  async ({event}) => {
    const {data} = event;
    await prisma.workspaceMember.create({
      data: {
        userId: data.user_id,
        workspaceId: data.organization_id,
        role: String(data.role_name).toUpperCase(),
      },
    });
  },
);

// Ingest function to send email on task creation
const sendTaskAssignmentEmail = inngest.createFunction(
  {id: "send-task-assignment-mail"},
  {event: "app/task.assigned"},
  async ({event, step}) => {
    const {taskId, origin} = event.data;

    const task = await step.run("fetch-task", async () => {
      return await prisma.task.findUnique({
        where: {id: taskId},
        include: {assignee: true, project: true},
      });
    });

    if (!task) return;

    // Send email
    await step.run("send-assignment-mail", async () => {
      sendEmail({
        to: task.assignee.email,
        subject: `New Task Assignment in ${task.project.name}`,
        body: buildEmailBody(task, origin),
      });
    });

    // Check if current date is not the same as the due date
    if (new Date(task.due_date).toLocaleDateString() !== new Date().toDateString()) {
      await step.sleepUntil("wait-for-due-date", new Date(task.due_date));

      const latestTask = await step.run("check-if-task-is-completed", async () => {
        return await prisma.task.findUnique({
          where: {id: taskId},
          include: {assignee: true, project: true},
        });
      });

      if (!latestTask) return;

      if (latestTask && task.status !== "DONE") {
        await step.run("send-task-reminder-mail", async () => {
          await sendEmail({
            to: task.assignee.email,
            subject: `Reminder for ${task.project.name}`,
            body: buildEmailBody(task, origin, true),
          });
        });
      }
    }
  },
);

// Create an empty array where we'll export future Inngest functions
export const functions = [
  syncUserCreation,
  syncUserDeletion,
  syncUserUpdation,
  syncWorkspaceCreation,
  syncWorkspaceUpdation,
  syncWorkspaceDeletion,
  syncWorkspaceMemberCreation,
  sendTaskAssignmentEmail,
];
