import { useState } from "react";
import { Mail, UserPlus } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { fetchWorkspaces } from "../features/workspaceSlice";
import axios from "axios";
import toast from "react-hot-toast";
import api from "../configs/api";

interface AddProjectMemberProps {
    isDialogOpen: boolean;
    setIsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const AddProjectMember = ({ isDialogOpen, setIsDialogOpen }: AddProjectMemberProps) => {
    const [email, setEmail] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [searchParams] = useSearchParams();
    const { currentWorkspace } = useAppSelector((state) => state.workspace);
    const { getToken } = useAuth();
    const dispatch = useAppDispatch();

    const id = searchParams.get('id')
    const project = currentWorkspace?.projects.find((p) => p.id === id);
    const projectMembersEmails = project?.members.map((member) => member.user.email);
    const availableMembers = currentWorkspace?.members.filter(
        (member) => !projectMembersEmails?.includes(member.user.email)
    ) ?? [];
    const hasAvailableMembers = availableMembers.length > 0;

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            setIsAdding(true);
            const token = await getToken();
            const { data } = await api.post(`/api/projects/${project?.id}/addMember`, { email }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            toast.success(data.message);
            dispatch(fetchWorkspaces({ getToken }));
            setIsAdding(false);
            setIsDialogOpen(false);
        } catch (error) {
            setIsAdding(false);
            if (axios.isAxiosError(error)) {
                toast.error(error.response?.data?.message || error.message);
            } else {
                toast.error("An unexpected error occurred");
            }
        } finally {
            setIsAdding(false);
        }
    };

    if (!isDialogOpen) return null;

    return (
        <div className="flex items-center justify-center z-50 fixed inset-0 bg-black/20 dark:bg-black/50 backdrop-blur">
            <div className="bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-xl p-6 w-full max-w-md text-zinc-900 dark:text-zinc-200">
                {/* Header */}
                <div className="mb-4">
                    <h2 className="text-xl font-bold flex items-center gap-2 mb-2">
                        <UserPlus className="size-5 text-zinc-900 dark:text-zinc-200" /> Add Member to Project
                    </h2>
                    {currentWorkspace && (
                        <p className="text-sm text-zinc-700 dark:text-zinc-400">
                            Adding to Project: <span className="text-blue-600 dark:text-blue-400">{project?.name}</span>
                        </p>
                    )}
                </div>

                {/* Form */}
                <form
                    onSubmit={handleSubmit}
                    className="space-y-4"
                >
                    {/* Email */}
                    <div className="space-y-2">
                        <label
                            htmlFor="email"
                            className="text-sm font-medium text-zinc-900 dark:text-zinc-200"
                        >
                            Email Address
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-400 w-4 h-4" />
                            {/* List All non-project members from current workspace */}
                            <select
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={!hasAvailableMembers}
                                className="pl-10 mt-1 w-full rounded border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-200 text-sm placeholder-zinc-400 dark:placeholder-zinc-500 py-2 focus:outline-none focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                                required
                            >
                                <option value="" disabled className="disabled:cursor-not-allowed disabled:opacity-60">
                                    {hasAvailableMembers ? "Select a member" : "No current members to assign"}
                                </option>
                                {availableMembers.map((member) => (
                                    <option key={member.user.id} value={member.user.email}>
                                        {member.user.email}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => setIsDialogOpen(false)}
                            className="px-5 py-2 text-sm rounded border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isAdding || !currentWorkspace || !hasAvailableMembers || !email}
                            className="px-5 py-2 text-sm rounded bg-linear-to-br from-blue-500 to-blue-600 hover:opacity-90 text-white disabled:opacity-50 transition"
                        >
                            {isAdding ? "Adding..." : "Add Member"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddProjectMember;
