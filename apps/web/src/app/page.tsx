// local dependencies
import HomeHero from "@/components/home-hero";
import GradientBackground from "@/components/gradient-background";

export default function Home() {
    return (
        <main className="relative isolate flex flex-1 overflow-hidden">
            <GradientBackground variant="home" />
            <div className="flex flex-1 items-center justify-center px-4 py-16">
                <HomeHero />
            </div>
        </main>
    );
}
