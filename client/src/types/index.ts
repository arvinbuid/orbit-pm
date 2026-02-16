export type Task = {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: string;
  type: string;
  priority: string;
  assigneeId: string;
  due_date: string;
  createdAt: string;
  updatedAt: string;
  assignee: {
    id: string;
    name: string;
    email: string;
    image: string;
    createdAt: string;
    updatedAt: string;
  };
  comments: string[];
};
