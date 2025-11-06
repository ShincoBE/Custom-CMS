import { SignUp } from "@clerk/clerk-react";

export const SignUpPage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-900">
        <SignUp path="/sign-up" signInUrl="/sign-in" forceRedirectUrl="/admin/dashboard" />
    </div>
  );
}