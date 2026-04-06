import { SignIn } from "@clerk/clerk-react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const SignInPage = () => {
    return (
        <div className="flex justify-center mt-12 md:mt-24 h-screen">
            <div>
                <Link to='/' className="flex items-center gap-2">
                    <ArrowLeft className="w-3 h-3 text-blue-600 hover:text-blue-700 hover:font-medium transition-colors" />
                    <p className="text-sm text-blue-600 hover:text-blue-700 hover:font-medium transition-colors">Back to Home</p>
                </Link>
                <div className="mt-4">
                    <SignIn
                        routing="path"
                        path="/sign-in"
                        signUpUrl="/sign-up"
                        fallback={<h1>Loading...</h1>}
                        fallbackRedirectUrl="/dashboard"
                        forceRedirectUrl="/dashboard"
                    />
                </div>
            </div>
        </div>
    );
}

export default SignInPage;