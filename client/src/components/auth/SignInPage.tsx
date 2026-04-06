import { ClerkLoaded, ClerkLoading, SignIn } from "@clerk/clerk-react";
import { Loader2Icon } from "lucide-react";
import AuthPageWrapper from "./AuthPageWrapper";

const SignInPage = () => {
    return (
        <AuthPageWrapper>
            <ClerkLoading>
                <div className="flex min-h-[32rem] items-center justify-center rounded-3xl border border-slate-200 bg-white shadow-sm">
                    <Loader2Icon className="size-6 animate-spin text-blue-600" />
                </div>
            </ClerkLoading>
            <ClerkLoaded>
                <SignIn
                    routing="path"
                    path="/sign-in"
                    signUpUrl="/sign-up"
                    fallbackRedirectUrl="/dashboard"
                    forceRedirectUrl="/dashboard"
                />
            </ClerkLoaded>
        </AuthPageWrapper>
    );
}

export default SignInPage;
