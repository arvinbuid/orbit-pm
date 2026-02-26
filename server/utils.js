// Utility function to build email body
export const buildEmailBody = (task, origin, isReminder = false) => `
    <div style="max-width: 600px;">
      <h2>Hi ${task.assignee.name}, 👋</h2>
      <p style="font-size: 16px;">${isReminder ? `You have a task due in ${task.project.name}` : "You've been assigned a new task:"}</p>
      <p style="font-size: 18px; font-weight: bold; color: #007bff; margin: 8px 0;">${task.title}</p>

      <div style="border: 1px solid #ddd; padding: 12px 16px; border-radius: 6px; margin-bottom: 30px;">
        <p style="margin: 6px 0;"><strong>Description:</strong> ${task.description}</p>
        <p style="margin: 6px 0;"><strong>Due Date:</strong> ${task.due_date.toLocaleDateString()}</p>
      </div>

      <a href="${origin}" style="background-color: #007bff; padding: 12px 24px; border-radius: 5px; color: #fff; font-weight: 600; font-size: 16px; text-decoration: none;"
      >
        View Task
      </a>

      <p style="margin-top: 20px; font-size: 14px; color: #6c757d;">
        Please make sure to review and complete the task before the due date.
      </p>
    </div>  
`;
