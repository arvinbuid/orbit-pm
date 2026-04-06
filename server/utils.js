// XSS protection
const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export const getClientAppUrl = () => {
  const fallbackUrl =
    process.env.NODE_ENV === "production" ? "http://localhost:3000" : "http://localhost:5173";

  return process.env.CLIENT_URL || fallbackUrl;
};

// Utility function to build email body
export const buildEmailBody = (task, appUrl, isReminder = false) => `
    <div style="max-width: 600px;">
      <h2>Hi ${escapeHtml(task.assignee.name)}, 👋</h2>
      <p style="font-size: 16px;">${isReminder ? `You have a task due in ${escapeHtml(task.project.name)}` : "You've been assigned a new task:"}</p>
      <p style="font-size: 18px; font-weight: bold; color: #007bff; margin: 8px 0;">${escapeHtml(task.title)}</p>

      <div style="border: 1px solid #ddd; padding: 12px 16px; border-radius: 6px; margin-bottom: 30px;">
        <p style="margin: 6px 0;"><strong>Description:</strong> ${escapeHtml(task.description || "No description provided.")}</p>
        <p style="margin: 6px 0;"><strong>Due Date:</strong> ${task.due_date.toLocaleDateString()}</p>
      </div>

      <a href="${escapeHtml(new URL("/", appUrl).toString())}" style="background-color: #007bff; padding: 12px 24px; border-radius: 5px; color: #fff; font-weight: 600; font-size: 16px; text-decoration: none;"
      >
        View Task
      </a>

      <p style="margin-top: 20px; font-size: 14px; color: #6c757d;">
        Please make sure to review and complete the task before the due date.
      </p>
    </div>  
`;
