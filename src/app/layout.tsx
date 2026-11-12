import type { Metadata } from "next";
import { Bricolage_Grotesque, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/ui/themes";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

const bricolage = Bricolage_Grotesque({
    variable: "--font-display",
    subsets: ["latin"],
    axes: ["opsz"],
});

export const metadata: Metadata = {
    metadataBase: new URL(
        process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    ),

    title: "Outpost: Agentic Workspace",
    description:
        "An AI Agent That Draws And Writes Alongside You And Your Team, Live.",

    icons: {
        icon: "/icon.png",
        apple: "/apple-icon.png",
    },

    manifest: "/manifest.json",

    openGraph: {
        title: "Outpost: Agentic Workspace",
        description:
            "An AI Agent That Draws And Writes Alongside You And Your Team, Live.",
        images: [
            {
                url: "/social/og-image.png",
                width: 1200,
                height: 630,
                alt: "Outpost",
            },
        ],
    },

    twitter: {
        card: "summary_large_image",
        images: ["/social/og-image.png"],
    },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
    return (
        <html
            lang="en"
            className={`dark ${geistSans.variable} ${geistMono.variable} ${bricolage.variable} h-full antialiased`}
        >
            <body className="min-h-full flex flex-col">
                <ClerkProvider
                    appearance={{
                        theme: dark,
                        variables: { colorPrimary: "oklch(0.74 0.16 55)" },
                    }}
                >
                    {children}
                </ClerkProvider>
            </body>
        </html>
    );
}
