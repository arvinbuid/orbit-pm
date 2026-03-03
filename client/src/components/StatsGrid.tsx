import { FolderOpen, CheckCircle, Users, AlertTriangle } from "lucide-react";
import { useMemo } from "react";
import { useAppSelector } from "../app/hooks";


const StatsGrid = () => {
    const currentWorkspace = useAppSelector((state) => state.workspace.currentWorkspace);

    const stats = useMemo(() => {
        const dashboardStats = {
            totalProjects: 0,
            totalProjectTasks: 0,
            activeProjects: 0,
            completedTasks: 0,
            myTasks: 0,
            overdueIssues: 0,
        }

        if (!currentWorkspace) return dashboardStats;

        const totalProjects = currentWorkspace.projects.length;
        const totalProjectTasks = currentWorkspace.projects.flatMap((p) => p.tasks).length;
        const activeProjects = currentWorkspace.projects.filter(
            (p) => p.status !== "CANCELLED" && p.status !== "COMPLETED").length;
        const completedTasks = currentWorkspace.projects
            .flatMap((p) => p.tasks)
            .filter((t) => t.status === "DONE")
            .length;
        const myTasks = currentWorkspace.projects
            .flatMap((p) => p.tasks)
            .filter((t) => t.assignee.email === currentWorkspace.owner.email)
            .length;

        const today = new Date();
        today.setHours(0, 0, 0, 0); // normalize to start of day

        const overdueIssues = currentWorkspace.projects
            .flatMap((p) => p.tasks)
            .filter((t) => {
                if (!t.due_date || t.status === 'DONE') return false;
                const dueDate = new Date(t.due_date);
                dueDate.setHours(0, 0, 0, 0);
                return dueDate < today;
            })
            .length;

        return {
            totalProjects,
            totalProjectTasks,
            activeProjects,
            completedTasks,
            myTasks,
            overdueIssues
        }
    }, [currentWorkspace])

    const statCards = [
        {
            icon: FolderOpen,
            title: "Total Projects",
            value: stats.totalProjects,
            subtitle: `projects in ${currentWorkspace?.name}`,
            bgColor: "bg-blue-500/10",
            textColor: "text-blue-500",
        },
        {
            icon: CheckCircle,
            title: "Completed Tasks",
            value: stats.completedTasks,
            subtitle: `of ${stats.totalProjectTasks} total`,
            bgColor: "bg-emerald-500/10",
            textColor: "text-emerald-500",
        },
        {
            icon: Users,
            title: "My Tasks",
            value: stats.myTasks,
            subtitle: "assigned to me",
            bgColor: "bg-purple-500/10",
            textColor: "text-purple-500",
        },
        {
            icon: AlertTriangle,
            title: "Overdue",
            value: stats.overdueIssues,
            subtitle: "need attention",
            bgColor: "bg-amber-500/10",
            textColor: "text-amber-500",
        },
    ];

    console.log('Due Date from DB: ', currentWorkspace?.projects.flatMap((p) => p.tasks));
    console.log(new Date().toISOString())

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 my-9">
            {statCards.map(
                ({ icon: Icon, title, value, subtitle, bgColor, textColor }, i) => (
                    <div key={i} className="bg-white dark:bg-zinc-950 dark:bg-linear-to-br dark:from-zinc-800/70 dark:to-zinc-900/50 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition duration-200 rounded-md" >
                        <div className="p-6 py-4">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">
                                        {title}
                                    </p>
                                    <p className="text-3xl font-bold text-zinc-800 dark:text-white">
                                        {value}
                                    </p>
                                    {subtitle && (
                                        <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                                            {subtitle}
                                        </p>
                                    )}
                                </div>
                                <div className={`p-3 rounded-xl ${bgColor} bg-opacity-20`}>
                                    <Icon size={20} className={textColor} />
                                </div>
                            </div>
                        </div>
                    </div>
                )
            )}
        </div>
    );
}

export default StatsGrid;