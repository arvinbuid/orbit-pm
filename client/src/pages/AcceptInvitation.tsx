import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEventHandler } from "react";
import { Loader2Icon, LockKeyhole, UserRound } from "lucide-react";
import { useAuth, useClerk, useOrganizationList, useSignIn, useSignUp } from "@clerk/clerk-react";
import { useNavigate, useSearchParams } from "react-router-dom";

const AcceptInvitation = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { isLoaded: authLoaded, isSignedIn } = useAuth();
    const { signOut } = useClerk();
    const { isLoaded: signInLoaded, signIn, setActive: setActiveSignIn } = useSignIn();
    const { isLoaded: signUpLoaded, signUp, setActive: setActiveSignUp } = useSignUp();
    const { setActive } = useOrganizationList();

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isProcessingTicket, setIsProcessingTicket] = useState(false);
    const [isFinalizing, setIsFinalizing] = useState(false);

    const token = searchParams.get("__clerk_ticket");
    const invitationStatus = searchParams.get("__clerk_status");
    const workspaceId = searchParams.get("workspaceId");
    const redirectTo = searchParams.get("redirectTo") || "/team";

    const isReady = authLoaded && signInLoaded && signUpLoaded;

    const completeInvitation = useCallback(async (sessionId?: string | null) => {
        setIsFinalizing(true);

        if (sessionId && setActiveSignIn && invitationStatus === "sign_in") {
            await setActiveSignIn({ session: sessionId });
        }

        if (sessionId && setActiveSignUp && invitationStatus === "sign_up") {
            await setActiveSignUp({ session: sessionId });
        }

        if (workspaceId) {
            localStorage.setItem("currentWorkspaceId", workspaceId);

            if (setActive) {
                void setActive({ organization: workspaceId }).catch((err) => {
                    console.error("Unable to set active organization during invitation completion:", err);
                });
            }
        }
        navigate(redirectTo, { replace: true });
    }, [
        invitationStatus,
        navigate,
        redirectTo,
        setActive,
        setActiveSignIn,
        setActiveSignUp,
        workspaceId,
    ]);

    useEffect(() => {
        if (!isReady || !token || invitationStatus !== "sign_in" || isSignedIn) {
            return;
        }

        let cancelled = false;

        const runSignIn = async () => {
            try {
                setError(null);
                setIsProcessingTicket(true);

                const signInAttempt = await signIn.create({
                    strategy: "ticket",
                    ticket: token,
                });

                if (cancelled) {
                    return;
                }

                if (signInAttempt.status === "complete") {
                    await completeInvitation(signInAttempt.createdSessionId);
                    return;
                }

                setError("Invitation sign-in is incomplete. Please try the link again.");
            } catch (err: any) {
                if (!cancelled) {
                    const message = err?.errors?.[0]?.longMessage || err?.errors?.[0]?.message;
                    setError(message || "Unable to complete invitation sign-in.");
                    console.error(err);
                }
            } finally {
                if (!cancelled) {
                    setIsProcessingTicket(false);
                }
            }
        };

        runSignIn();

        return () => {
            cancelled = true;
        };
    }, [completeInvitation, invitationStatus, isReady, isSignedIn, signIn, token]);

    useEffect(() => {
        if (!isReady || !isSignedIn || invitationStatus !== "complete") {
            return;
        }

        completeInvitation().catch((err) => {
            setError("Unable to finalize the workspace invitation.");
            console.error(err);
        });
    }, [completeInvitation, invitationStatus, isReady, isSignedIn]);

    const submitLabel = useMemo(() => {
        if (isSubmitting) return "Joining workspace...";
        return "Accept Invitation";
    }, [isSubmitting]);

    const handleSignUp: FormEventHandler<HTMLFormElement> = async (e) => {
        e.preventDefault();

        if (!token || !isReady) {
            return;
        }

        if (isSignedIn) {
            setError("There is already an active session in this browser. Sign out and continue with the invited account.");
            return;
        }

        try {
            setError(null);
            setIsSubmitting(true);

            const signUpAttempt = await signUp.create({
                strategy: "ticket",
                ticket: token,
                password,
                ...(firstName.trim() ? { firstName: firstName.trim() } : {}),
                ...(lastName.trim() ? { lastName: lastName.trim() } : {}),
            });

            if (signUpAttempt.status === "complete") {
                await completeInvitation(signUpAttempt.createdSessionId);
                return;
            }

            setError("Invitation sign-up is incomplete. Please try again.");
        } catch (err: any) {
            const message = err?.errors?.[0]?.longMessage || err?.errors?.[0]?.message;
            setError(message || "Unable to complete invitation sign-up.");
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white dark:bg-zinc-950 px-6">
                <p className="text-sm text-gray-600 dark:text-zinc-400">No invitation token found.</p>
            </div>
        );
    }

    if (!isReady || isProcessingTicket || isFinalizing || invitationStatus === "complete") {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-white dark:bg-zinc-950 text-gray-900 dark:text-white px-6">
                <Loader2Icon className="size-6 animate-spin text-blue-500" />
                <p className="text-sm text-gray-600 dark:text-zinc-400">
                    {invitationStatus === "complete" || isFinalizing
                        ? "Finalizing workspace access..."
                        : "Preparing your invitation..."}
                </p>
                {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
        );
    }

    if ((invitationStatus === "sign_in" || invitationStatus === "sign_up") && isSignedIn) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white dark:bg-zinc-950 px-6">
                <div className="w-full max-w-md rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm space-y-4">
                    <div>
                        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Invitation requires a clean session</h1>
                        <p className="mt-2 text-sm text-gray-600 dark:text-zinc-400">
                            There is already an active Clerk session in this browser. Sign out, then continue the invitation with the invited account.
                        </p>
                    </div>

                    {error && <p className="text-sm text-red-500">{error}</p>}

                    <button
                        type="button"
                        onClick={() => signOut({ redirectUrl: window.location.href })}
                        className="w-full rounded-md bg-blue-600 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500"
                    >
                        Sign Out And Continue
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-zinc-950 px-6">
            <div className="w-full max-w-md rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
                <div className="mb-6">
                    <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Accept workspace invitation</h1>
                    <p className="mt-2 text-sm text-gray-600 dark:text-zinc-400">
                        Finish creating your account to join this workspace.
                    </p>
                </div>

                <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <label className="text-sm text-gray-700 dark:text-zinc-300">
                            First name
                            <div className="relative mt-1">
                                <UserRound className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    className="w-full rounded-md border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 py-2 pl-10 pr-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
                                />
                            </div>
                        </label>

                        <label className="text-sm text-gray-700 dark:text-zinc-300">
                            Last name
                            <div className="relative mt-1">
                                <UserRound className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    className="w-full rounded-md border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 py-2 pl-10 pr-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
                                />
                            </div>
                        </label>
                    </div>

                    <label className="text-sm text-gray-700 dark:text-zinc-300 block">
                        Password
                        <div className="relative mt-1">
                            <LockKeyhole className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full rounded-md border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 py-2 pl-10 pr-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
                            />
                        </div>
                    </label>

                    {error && <p className="text-sm text-red-500">{error}</p>}

                    <button
                        type="submit"
                        disabled={isSubmitting || !password.trim()}
                        className="w-full rounded-md bg-blue-600 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {submitLabel}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AcceptInvitation;
