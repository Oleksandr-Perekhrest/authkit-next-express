// outsource dependencies
import type { Metadata } from "next";

// local dependencies
import RegisterForm from "./register-form";

export const metadata: Metadata = { title: "Register" };

export default function RegisterPage() {
    return (
        <main className="flex min-h-screen items-center justify-center px-4">
            <div className="w-full max-w-sm space-y-6">
                <h1 className="text-2xl font-semibold">Create an account</h1>
                <RegisterForm />
            </div>
        </main>
    );
}
