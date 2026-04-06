import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";

const AuthPageWrapper = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen px-4 pt-12 md:px-6 md:pt-20">
      <div className="mx-auto w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-2">
          <ArrowLeft className="w-3 h-3 text-blue-600 hover:text-blue-700 hover:font-medium transition-colors" />
          <p className="text-sm text-blue-600 hover:text-blue-700 hover:font-medium transition-colors">
            Back to Home
          </p>
        </Link>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
};

export default AuthPageWrapper;
