import { SignIn } from "@clerk/clerk-react";

export const SignInPage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-900">
        <SignIn path="/sign-in" signUpUrl="/sign-up" forceRedirectUrl="/admin/dashboard" />
    </div>
  );
}