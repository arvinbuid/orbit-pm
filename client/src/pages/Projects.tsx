import { useState, useEffect } from "react";
import { useAppSelector } from "../app/hooks";
import { Plus, Search, FolderOpen } from "lucide-react";
import CreateNewProjectForm from "../components/CreateNewProjectForm";
import ProjectCard from "../components/ProjectCard";

type FilteredProduct = {
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
}

const Projects = () => {
    const [filteredProjects, setFilteredProjects] = useState<FilteredProduct[] | undefined>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [filters, setFilters] = useState({ status: "ALL", priority: "ALL", });

    const projects = useAppSelector((state) => state.workspace.currentWorkspace?.projects);

    useEffect(() => {
        let filtered = projects;
        const filterProjects = () => {
            if (searchTerm !== "") {
                filtered = filtered!.filter((project) =>
                    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    project.description.toLowerCase().includes(searchTerm.toLowerCase())
                );
            }
            if (filters.status !== "ALL") filtered = filtered!.filter((project) => project.status === filters.status);
            if (filters.priority !== "ALL") filtered = filtered!.filter((project) => project.priority === filters.priority);

            setFilteredProjects(filtered);
        };
        filterProjects();
    }, [filters.priority, filters.status, projects, searchTerm]);

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                    <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-1"> Projects </h1>
                    <p className="text-gray-500 dark:text-zinc-400 text-sm"> Manage and track your projects </p>
                </div>
                <button
                    onClick={() => setIsDialogOpen(true)}
                    className="flex items-center px-5 py-2 text-sm rounded bg-linear-to-br from-blue-500 to-blue-600 text-white hover:opacity-90 transition"
                >
                    <Plus className="size-4 mr-2" /> New Project
                </button>
                {/* Create New Project Form Modal */}
                <CreateNewProjectForm isDialogOpen={isDialogOpen} setIsDialogOpen={setIsDialogOpen} />
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-zinc-400 w-4 h-4" />
                    <input
                        type="text"
                        onChange={(e) => setSearchTerm(e.target.value)}
                        value={searchTerm}
                        className="w-full pl-10 text-sm pr-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-400 focus:border-blue-500 outline-none" placeholder="Search projects..."
                    />
                </div>
                {/* Status */}
                <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="px-3 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white text-sm cursor-pointer"
                >
                    <option value="ALL" className="dark:text-zinc-900">All Status</option>
                    <option value="ACTIVE" className="dark:text-zinc-900">Active</option>
                    <option value="PLANNING" className="dark:text-zinc-900">Planning</option>
                    <option value="COMPLETED" className="dark:text-zinc-900">Completed</option>
                    <option value="ON_HOLD" className="dark:text-zinc-900">On Hold</option>
                    <option value="CANCELLED" className="dark:text-zinc-900">Cancelled</option>
                </select>
                {/* Priority */}
                <select
                    value={filters.priority}
                    onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                    className="px-3 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white text-sm cursor-pointer"
                >
                    <option value="ALL" className="dark:text-zinc-900">All Priority</option>
                    <option value="HIGH" className="dark:text-zinc-900">High</option>
                    <option value="MEDIUM" className="dark:text-zinc-900">Medium</option>
                    <option value="LOW" className="dark:text-zinc-900">Low</option>
                </select>
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects?.length === 0 ? (
                    <div className="col-span-full text-center py-16">
                        <div className="w-24 h-24 mx-auto mb-6 bg-gray-200 dark:bg-zinc-800 rounded-full flex items-center justify-center">
                            <FolderOpen className="w-12 h-12 text-gray-400 dark:text-zinc-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                            No projects found
                        </h3>
                        <p className="text-gray-500 dark:text-zinc-400 mb-6 text-sm">
                            Create your first project to get started
                        </p>
                        <button
                            onClick={() => setIsDialogOpen(true)}
                            className="flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mx-auto text-sm"
                        >
                            <Plus className="size-4" />
                            Create Project
                        </button>
                    </div>
                ) : (
                    filteredProjects?.map((project) => (
                        <ProjectCard key={project.id} project={project} />
                    ))
                )}
            </div>
        </div>
    );
}

export default Projects;