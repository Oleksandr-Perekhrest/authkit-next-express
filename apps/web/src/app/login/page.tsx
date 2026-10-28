// outsource dependencies
import type { Metadata } from "next";

// local dependencies
import LoginForm from "./login-form";

export const metadata: Metadata = { title: "Log in" };

export default function LoginPage() {
    return (
        <main className="flex min-h-screen items-center justify-center px-4">
            <div className="w-full max-w-sm space-y-6">
                <h1 className="text-2xl font-semibold">Log in</h1>
                <LoginForm />
            </div>
        </main>
    );
}
