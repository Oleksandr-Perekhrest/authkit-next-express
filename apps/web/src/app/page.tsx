// local dependencies
import HomeHero from "@/components/home-hero";
import GradientBackground from "@/components/gradient-background";

export default function Home() {
    return (
        <main className="relative isolate flex flex-1">
            <GradientBackground variant="home" />
            <div className="flex w-full flex-col items-center px-4 pb-16 pt-10">
                <HomeHero />
            </div>
        </main>
    );
}
