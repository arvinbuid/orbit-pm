import { useUser } from "@clerk/clerk-react";
import { useAppSelector } from "../app/hooks";
import { ArrowRight, Clock, AlertTriangle, User } from "lucide-react";
import { Link } from "react-router-dom";

const TEXTPRIORITYCOLOR = {
    "LOW": "text-zinc-600 dark:text-zinc-400",
    "MEDIUM": "text-amber-600 dark:text-amber-400",
    "HIGH": "text-red-600 dark:text-red-400"
} as const;


const TaskSummary = () => {
    const { currentWorkspace } = useAppSelector((state) => state.workspace);
    const { user } = useUser();

    if (!user) return null;

    const tasks = currentWorkspace?.projects.flatMap((project) => project.tasks) || [];
    const myTasks = tasks.filter(i => i.assigneeId === user.id);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // normalize to start of day
    const overdueTasks = tasks.filter((t) => {
        if (!t.due_date || t.status === 'DONE') return false;
        const dueDate = new Date(t.due_date);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate < today;
    })
    const inProgressIssues = tasks.filter(i => i.status === 'IN_PROGRESS');

    const summaryCards = [
        {
            title: "My Tasks",
            count: myTasks.length,
            icon: User,
            color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400",
            items: myTasks.slice(0, 3)
        },
        {
            title: "Overdue",
            count: overdueTasks.length,
            icon: AlertTriangle,
            color: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-400",
            items: overdueTasks.slice(0, 3)
        },
        {
            title: "In Progress",
            count: inProgressIssues.length,
            icon: Clock,
            color: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-400",
            items: inProgressIssues.slice(0, 3)
        }
    ];

    console.log(currentWorkspace?.projects)

    return (
        <div className="space-y-6">
            {summaryCards.map((card) => (
                <div
                    key={card.title}
                    className="bg-white dark:bg-zinc-950 dark:bg-linear-to-br dark:from-zinc-800/70 dark:to-zinc-900/50 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200 rounded-lg overflow-hidden"
                >
                    <div className="border-b border-zinc-200 dark:border-zinc-800 p-4 pb-3">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                                <card.icon className="w-4 h-4 text-gray-500 dark:text-zinc-400" />
                            </div>
                            <div className="flex items-center justify-between flex-1">
                                <h3 className="text-sm font-medium text-gray-800 dark:text-white">{card.title}</h3>
                                <span className={`inline-block mt-1 px-2 py-1 rounded text-xs font-semibold ${card.color}`}>
                                    {card.count}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="p-4">
                        {card.items.length === 0 ? (
                            <p className="text-sm text-gray-500 dark:text-zinc-400 text-center py-4">
                                No {card.title.toLowerCase()} available.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {card.items.map((issue) => (
                                    <div>
                                        <Link to={`/projectsDetail?id=${currentWorkspace?.projects[0].id}&tab=tasks`}>
                                            <div
                                                key={issue.id}
                                                className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                                            >
                                                <h4 className="text-sm font-medium text-gray-800 dark:text-white truncate">
                                                    {issue.title}
                                                </h4>
                                                <p className={`text-xs ${TEXTPRIORITYCOLOR[issue.priority as keyof typeof TEXTPRIORITYCOLOR]} capitalize mt-1`}>
                                                    {issue.type} • {issue.priority} priority
                                                </p>
                                            </div>
                                        </Link>
                                    </div>
                                ))}
                                {card.count > 3 && (
                                    <Link
                                        to={`/projectsDetail?id=${currentWorkspace?.projects[0].id}&tab=tasks`}
                                        className="flex items-center justify-center w-full text-sm text-gray-500 dark:text-zinc-400 hover:text-gray-800 dark:hover:text-white mt-2"
                                    >
                                        View {card.count - 3} more <ArrowRight className="w-3 h-3 ml-2" />
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}

export default TaskSummary;