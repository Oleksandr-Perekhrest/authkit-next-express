// outsource dependencies
import type { Metadata } from "next";

// local dependencies
import Card from "@/components/card";
import ProfileView from "./profile-view";
import GradientBackground from "@/components/gradient-background";

export const metadata: Metadata = { title: "Profile" };

export default function ProfilePage() {
    return (
        <main className="relative isolate flex flex-1 overflow-hidden">
            <GradientBackground variant="profile" />
            <div className="flex flex-1 items-center justify-center px-4 py-16">
                <Card title="Profile" variant="profile">
                    <ProfileView />
                </Card>
            </div>
        </main>
    );
}
