import type { Metadata } from "next";
import { Inter, DM_Serif_Display } from "next/font/google"; // Import requested fonts
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

// Configure Fonts
const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
    display: "swap",
});

const dmSerif = DM_Serif_Display({
    weight: "400",
    subsets: ["latin"],
    variable: "--font-dm-serif",
    display: "swap",
});

export const metadata: Metadata = {
    title: "ESL Tutoring",
    description: "Advanced ESL Tutoring Platform",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <ClerkProvider>
            <html lang="en" suppressHydrationWarning>
                <body className={`${inter.variable} ${dmSerif.variable} font-sans antialiased`} suppressHydrationWarning>
                    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                        {children}
                    </ThemeProvider>
                </body>
            </html>
        </ClerkProvider>
    );
}
