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

export type Project = {
  id: string;
  name: string;
  description: string;
  priority: string;
  status: string;
  start_date: string;
  end_date: string;
  team_lead: string;
  workspaceId: string;
  progress: number;
  createdAt: string;
  updatedAt: string;
  tasks: Array<Task>;
  members: {
    id: string;
    userId: string;
    projectId: string;
    user: {
      id: string;
      name: string;
      email: string;
      image: string;
      createdAt: string;
      updatedAt: string;
    };
  }[];
};

export type User = {
  id: string;
  name: string;
  email: string;
  image: string;
  createdAt: string;
  updatedAt: string;
};

export type Member = {
  id: string;
  userId: string;
  workspaceId: string;
  message: string;
  user: User;
  role: "ADMIN" | "MEMBER";
};

export type Workspace = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  setting: object;
  ownerId: string;
  image_url: string;
  projects: Project[];
  members: Member[];
  owner: User;
};
