import { SignUp } from "@clerk/clerk-react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const SignUpPage = () => {
    return (
        <div className="flex justify-center items-center h-screen">
            <div>
                <Link to='/' className="flex items-center gap-2 text-blue-600 hover:text-blue-700 hover:font-medium transition-all">
                    <ArrowLeft className="w-3 h-3" />
                    <p className="text-sm">Back to Home</p>
                </Link>
                <div className="mt-4">
                    <SignUp
                        routing="path"
                        path="/sign-up"
                        signInUrl="/sign-in"
                        fallback={<h1>Loading...</h1>}
                        fallbackRedirectUrl="/dashboard"
                        forceRedirectUrl="/dashboard"
                    />
                </div>
            </div>
        </div>
    );
}

export default SignUpPage;