import { ClerkLoaded, ClerkLoading, SignUp } from "@clerk/clerk-react";
import { Loader2Icon } from "lucide-react";
import AuthPageWrapper from "./AuthPageWrapper";

const SignUpPage = () => {
    return (
        <AuthPageWrapper>
            <ClerkLoading>
                <div className="flex min-h-128 items-center justify-center rounded-3xl border border-slate-200 bg-white shadow-sm">
                    <Loader2Icon className="size-6 animate-spin text-blue-600" />
                </div>
            </ClerkLoading>
            <ClerkLoaded>
                <SignUp
                    routing="path"
                    path="/sign-up"
                    signInUrl="/sign-in"
                    fallbackRedirectUrl="/dashboard"
                    forceRedirectUrl="/dashboard"
                />
            </ClerkLoaded>
        </AuthPageWrapper>
    );
}

export default SignUpPage;
