// outsource dependencies
import type { Metadata } from "next";

// local dependencies
import Card from "@/components/card";
import LoginForm from "./login-form";
import GradientBackground from "@/components/gradient-background";

export const metadata: Metadata = { title: "Log in" };

export default function LoginPage() {
    return (
        <main className="relative isolate flex flex-1 overflow-hidden">
            <GradientBackground variant="login" />
            <div className="flex flex-1 items-center justify-center px-4 py-16">
                <Card title="Log in" variant="login">
                    <LoginForm />
                </Card>
            </div>
        </main>
    );
}
