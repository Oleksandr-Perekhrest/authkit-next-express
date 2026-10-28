export default function GoogleSignInButton() {
    return (
        <a
            href="/api/auth/google"
            className="block w-full rounded border border-neutral-300 py-2 text-center text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-600 dark:text-neutral-200 dark:hover:bg-neutral-800"
        >
            Continue with Google
        </a>
    );
}
