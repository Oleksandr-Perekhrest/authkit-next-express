// outsource dependencies
import { connection } from "next/server";
import { healthResponseSchema } from "@authkit/shared";

async function getApiStatus() {
    try {
        const res = await fetch(`${process.env.API_URL}/health`);
        const result = healthResponseSchema.safeParse(await res.json());
        return result.success ? result.data.status : "invalid response";
    } catch {
        return "unavailable";
    }
}

export default async function Home() {
    await connection();
    const status = await getApiStatus();

    return (
        <main className="p-8">
            <h1 className="text-2xl font-semibold">authkit-next-express</h1>
            <p className="mt-2">API: {status}</p>
        </main>
    );
}
