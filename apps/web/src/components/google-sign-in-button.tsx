// local dependencies
import GoogleIcon from "@/components/google-icon";

export default function GoogleSignInButton() {
    return (
        <a
            href="/api/auth/google"
            className="flex w-full items-center justify-center gap-2.5 rounded border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-600 dark:text-neutral-200 dark:hover:bg-neutral-800"
        >
            <GoogleIcon />
            Continue with Google
        </a>
    );
}
