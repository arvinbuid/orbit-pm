import { Plus } from "lucide-react";
import { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import StatsGrid from "../components/StatsGrid";
import ProjectOverview from "../components/ProjectOverview";
import CreateNewProjectForm from "../components/CreateNewProjectForm";
import RecentActivity from "../components/RecentActivity";
import TaskSummary from "../components/TaskSummary";

const Dashboard = () => {
    const { user } = useUser();
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    return (
        <div className="mx-auto w-full max-w-6xl space-y-6 lg:space-y-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0 flex-1">
                    <h1 className="mb-1 text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
                        Welcome back, {user?.fullName || "User"}
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-zinc-400">
                        Here's what's happening with your projects today
                    </p>
                </div>

                <button
                    onClick={() => setIsDialogOpen(true)}
                    className="flex w-full shrink-0 items-center justify-center gap-2 rounded bg-linear-to-br from-blue-500 to-blue-600 px-5 py-2 text-sm text-white transition hover:opacity-90 sm:w-auto"
                >
                    <Plus size={16} /> New Project
                </button>
            </div>

            <CreateNewProjectForm isDialogOpen={isDialogOpen} setIsDialogOpen={setIsDialogOpen} />

            <StatsGrid />

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3 xl:gap-8">
                <div className="space-y-6 xl:col-span-2 xl:space-y-8">
                    <ProjectOverview />
                    <RecentActivity />
                </div>
                <div className="min-w-0">
                    <TaskSummary />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
