import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "PRD-to-UI | AI UI Generator",
    description: "Transform your PRDs into beautiful React components with AI",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${inter.className} bg-white text-black min-h-screen`}>
                {children}
            </body>
        </html>
    );
}
