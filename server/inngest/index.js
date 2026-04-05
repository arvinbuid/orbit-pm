import {Inngest} from "inngest";
import prisma from "../configs/prisma.js";
import sendEmail from "../configs/nodemailer.js";
import {buildEmailBody} from "../utils.js";
import {
  deleteOrganizationMembershipFromWebhookData,
  syncOrganizationMembershipFromWebhookData,
  upsertUserFromWebhookData,
  upsertWorkspaceFromWebhookData,
} from "../services/clerkSyncService.js";

// Create a client to send and receive events
export const inngest = new Inngest({id: "project-management-lenis"});

// Inngest functions for Users
const syncUserCreation = inngest.createFunction(
  {id: "sync-user-from-clerk"},
  {event: "clerk/user.created"},
  async ({event}) => {
    await upsertUserFromWebhookData(event.data);
  },
);

const syncUserDeletion = inngest.createFunction(
  {id: "delete-user-with-clerk"},
  {event: "clerk/user.deleted"},
  async ({event}) => {
    await prisma.user.deleteMany({
      where: {
        id: event.data.id,
      },
    });
  },
);

const syncUserUpdation = inngest.createFunction(
  {id: "update-user-from-clerk"},
  {event: "clerk/user.updated"},
  async ({event}) => {
    await upsertUserFromWebhookData(event.data);
  },
);

// Inngest functions for Workspaces
const syncWorkspaceCreation = inngest.createFunction(
  {id: "sync-workspace-from-clerk"},
  {event: "clerk/organization.created"},
  async ({event}) => {
    await upsertWorkspaceFromWebhookData(event.data);
  },
);

const syncWorkspaceUpdation = inngest.createFunction(
  {id: "update-workspace-from-clerk"},
  {event: "clerk/organization.updated"},
  async ({event}) => {
    await upsertWorkspaceFromWebhookData(event.data);
  },
);

const syncWorkspaceDeletion = inngest.createFunction(
  {id: "delete-workspace-with-clerk"},
  {event: "clerk/organization.deleted"},
  async ({event}) => {
    await prisma.workspace.deleteMany({
      where: {
        id: event.data.id,
      },
    });
  },
);

// Inngest functions for Workspace Members
const syncWorkspaceMemberCreation = inngest.createFunction(
  {id: "sync-workspace-member-from-clerk"},
  {event: "clerk/organizationMembership.created"},
  async ({event}) => {
    await syncOrganizationMembershipFromWebhookData(event.data);
  },
);

const syncWorkspaceMemberUpdation = inngest.createFunction(
  {id: "update-workspace-member-from-clerk"},
  {event: "clerk/organizationMembership.updated"},
  async ({event}) => {
    await syncOrganizationMembershipFromWebhookData(event.data);
  },
);

const syncWorkspaceMemberDeletion = inngest.createFunction(
  {id: "delete-workspace-member-from-clerk"},
  {event: "clerk/organizationMembership.deleted"},
  async ({event}) => {
    await deleteOrganizationMembershipFromWebhookData(event.data);
  },
);

const syncAcceptedInvitationFallback = inngest.createFunction(
  {id: "sync-accepted-workspace-invitation-from-clerk"},
  {event: "clerk/organizationInvitation.accepted"},
  async ({event}) => {
    await syncOrganizationMembershipFromWebhookData(event.data);
  },
);

// Inngest function to send email on task creation
const sendTaskAssignmentEmail = inngest.createFunction(
  {id: "send-task-assignment-mail"},
  {event: "app/task.assigned"},
  async ({event, step}) => {
    const {taskId, origin} = event.data;

    const task = await prisma.task.findUnique({
      where: {id: taskId},
      include: {assignee: true, project: true},
    });

    if (!task) return;

    await sendEmail({
      to: task.assignee.email,
      subject: `New Task Assignment in ${task.project.name}`,
      body: buildEmailBody(task, origin),
    });

    if (new Date(task.due_date).toDateString() !== new Date().toDateString()) {
      await step.sleepUntil("wait-for-due-date", new Date(task.due_date));

      await step.run("check-if-task-is-completed", async () => {
        const currentTask = await prisma.task.findUnique({
          where: {id: taskId},
          include: {assignee: true, project: true},
        });

        if (!currentTask) return;

        if (currentTask.status !== "DONE") {
          await step.run("send-task-reminder-mail", async () => {
            await sendEmail({
              to: currentTask.assignee.email,
              subject: `Reminder for ${currentTask.project.name}`,
              body: buildEmailBody(currentTask, origin, true),
            });
          });
        }
      });
    }
  },
);

export const functions = [
  syncUserCreation,
  syncUserDeletion,
  syncUserUpdation,
  syncWorkspaceCreation,
  syncWorkspaceUpdation,
  syncWorkspaceDeletion,
  syncWorkspaceMemberCreation,
  syncWorkspaceMemberUpdation,
  syncWorkspaceMemberDeletion,
  syncAcceptedInvitationFallback,
  sendTaskAssignmentEmail,
];
