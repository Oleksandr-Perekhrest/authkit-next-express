// outsource dependencies
import { Suspense } from "react";
import { Toaster } from "sonner";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";

// local dependencies
import "./globals.css";
import UrlToast from "@/components/url-toast";
import SiteHeader from "@/components/site-header";
import AuthProvider from "@/components/auth-provider";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "AuthKit",
    description: "JWT authentication example with Next.js 16 and Express 5.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
    const jar = await cookies();
    const initialStatus = jar.has("refresh_token") ? "loading" : "anonymous";

    return (
        <html
            lang="en"
            className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
        >
            {/* browser extensions (e.g. ColorZilla's cz-shortcut-listen) add attributes to <body> before hydration */}
            <body suppressHydrationWarning className="min-h-full flex flex-col">
                <AuthProvider initialStatus={initialStatus}>
                    <SiteHeader />
                    {children}
                    <Toaster position="top-center" richColors />
                    <Suspense fallback={null}>
                        <UrlToast />
                    </Suspense>
                </AuthProvider>
            </body>
        </html>
    );
}
