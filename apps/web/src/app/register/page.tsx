// outsource dependencies
import type { Metadata } from "next";

// local dependencies
import Card from "@/components/card";
import RegisterForm from "./register-form";
import GradientBackground from "@/components/gradient-background";

export const metadata: Metadata = { title: "Register" };

export default function RegisterPage() {
    return (
        <main className="relative isolate flex flex-1 overflow-hidden">
            <GradientBackground variant="register" />
            <div className="flex flex-1 items-center justify-center px-4 py-16">
                <Card title="Create an account" variant="register">
                    <RegisterForm />
                </Card>
            </div>
        </main>
    );
}
