// outsource dependencies
import type { Metadata } from "next";

// local dependencies
import RegisterForm from "./register-form";

export const metadata: Metadata = { title: "Register" };

export default function RegisterPage() {
    return (
        <main>
            <h1>Create an account</h1>
            <RegisterForm />
        </main>
    );
}
