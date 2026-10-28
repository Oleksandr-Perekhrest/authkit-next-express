// outsource dependencies
import type { Metadata } from "next";

// local dependencies
import RegisterForm from "./register-form";
import GradientBackground from "@/components/gradient-background";

export const metadata: Metadata = { title: "Register" };

export default function RegisterPage() {
    return (
        <main className="relative isolate flex flex-1 overflow-hidden">
            <GradientBackground variant="register" />
            <div className="flex flex-1 items-center justify-center px-4 py-16">
                <div className="w-full max-w-sm space-y-6 rounded-xl border border-white/60 bg-white/70 p-6 shadow-sm backdrop-blur-sm dark:border-neutral-700/60 dark:bg-neutral-900/70">
                    <h1 className="text-2xl font-semibold">
                        Create an account
                    </h1>
                    <RegisterForm />
                </div>
            </div>
        </main>
    );
}
