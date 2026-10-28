// outsource dependencies
import type { Metadata } from "next";

// local dependencies
import ProfileView from "./profile-view";

export const metadata: Metadata = { title: "Profile" };

export default function ProfilePage() {
    return (
        <main className="flex min-h-screen items-center justify-center px-4">
            <div className="w-full max-w-sm space-y-6">
                <h1 className="text-2xl font-semibold">Profile</h1>
                <ProfileView />
            </div>
        </main>
    );
}
