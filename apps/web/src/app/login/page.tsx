// outsource dependencies
import type { Metadata } from "next";

// local dependencies
import LoginForm from "./login-form";

export const metadata: Metadata = { title: "Log in" };

export default function LoginPage() {
    return (
        <main>
            <h1>Log in</h1>
            <LoginForm />
        </main>
    );
}
