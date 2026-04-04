import { useEffect, useState } from 'react'
import { loadTheme } from '../features/themeSlice';
import { Loader2Icon } from 'lucide-react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar';
import { SignIn, useAuth, useOrganizationList, useUser, } from '@clerk/clerk-react';
import { fetchWorkspaces } from '../features/workspaceSlice';

const Layout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { error, initialized, loading, workspaces } = useAppSelector(state => state.workspace)
    const dispatch = useAppDispatch();
    const { user, isLoaded } = useUser()
    const { getToken, orgId } = useAuth()
    const {
        userMemberships,
        isLoaded: isOrganizationsLoaded,
    } = useOrganizationList({ userMemberships: true })
    const organizationCount = userMemberships.data?.length ?? 0;
    const hasClerkOrganizations = Boolean(orgId) || organizationCount > 0;

    // Initial load of theme
    useEffect(() => {
        dispatch(loadTheme())
    }, [dispatch])

    // Initial load of workspaces
    useEffect(() => {
        if (isLoaded && user && !initialized && !loading) {
            dispatch(fetchWorkspaces({ getToken }))
        }
    }, [user, isLoaded, initialized, loading, dispatch, getToken])

    // Clerk org creation and the backend workspace sync are asynchronous.
    // Keep checking briefly while Clerk already shows a membership but the API has not caught up yet.
    useEffect(() => {
        if (!isLoaded || !isOrganizationsLoaded || !user || loading || error) return;
        if (!initialized || workspaces.length > 0 || !hasClerkOrganizations) return;

        const timeoutId = window.setTimeout(() => {
            dispatch(fetchWorkspaces({ getToken }))
        }, 1500)

        return () => window.clearTimeout(timeoutId)
    }, [
        user,
        isLoaded,
        isOrganizationsLoaded,
        hasClerkOrganizations,
        initialized,
        loading,
        error,
        workspaces.length,
        dispatch,
        getToken,
        orgId,
    ])

    if (!isLoaded || (user && !isOrganizationsLoaded)) {
        return (
            <div className='flex items-center justify-center h-screen bg-white dark:bg-zinc-950'>
                <Loader2Icon className="size-7 text-blue-500 animate-spin" />
            </div>
        )
    }

    if (!user) {
        return (
            <div className='flex items-center justify-center h-screen bg-white dark:bg-zinc-950'>
                <SignIn />
            </div>
        )
    }

    if (loading) {
        return (
            <div className='flex items-center justify-center h-screen bg-white dark:bg-zinc-950'>
                <Loader2Icon className="size-7 text-blue-500 animate-spin" />
            </div>
        )
    }

    if (!initialized || (hasClerkOrganizations && workspaces.length === 0 && !error)) {
        return (
            <div className='flex items-center justify-center h-screen bg-white dark:bg-zinc-950'>
                <Loader2Icon className="size-7 text-blue-500 animate-spin" />
            </div>
        )
    }

    if (error) {
        return (
            <div className='flex flex-col items-center justify-center gap-4 h-screen bg-white dark:bg-zinc-950 text-gray-900 dark:text-slate-100 px-6 text-center'>
                <p>Unable to load your workspaces right now.</p>
                <button
                    type="button"
                    onClick={() => dispatch(fetchWorkspaces({ getToken }))}
                    className='px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-500'
                >
                    Try again
                </button>
            </div>
        )
    }

    if (workspaces.length === 0) {
        return <Navigate to="/create-organization" replace />
    }

    return (
        <div className="flex bg-white dark:bg-zinc-950 text-gray-900 dark:text-slate-100">
            <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
            <div className="flex-1 flex flex-col h-screen">
                <Navbar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
                <div className="flex-1 h-full p-6 xl:p-10 xl:px-16 overflow-y-scroll">
                    <Outlet />
                </div>
            </div>
        </div>
    )
}

export default Layout
