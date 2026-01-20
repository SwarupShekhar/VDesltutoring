import type { Metadata } from "next";
import { Inter, DM_Serif_Display } from "next/font/google"; // Import requested fonts
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Analytics } from "@vercel/analytics/next";
import Script from "next/script";
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
    metadataBase: new URL("https://englivo.com"),
    title: {
        default: "Englivo | Advanced ESL Tutoring & AI Practice",
        template: "%s | Englivo"
    },
    description: "Master English with AI-powered conversation practice and expert human tutoring. Real-time feedback, CEFR assessment, and fluency training.",
    keywords: ["ESL tutoring", "AI English Tutor", "Live Practice", "English Fluency", "CEFR Assessment"],
    authors: [{ name: "Swarup Shekhar" }],
    creator: "Swarup Shekhar",
    openGraph: {
        type: "website",
        locale: "en_US",
        url: "https://englivo.com",
        title: "Englivo | Advanced ESL Tutoring & AI Practice",
        description: "Master English with AI-powered conversation practice and expert human tutoring.",
        siteName: "Englivo",
        images: [
            {
                url: "/og-image.jpg", // Assuming an OG image exists or will exist
                width: 1200,
                height: 630,
                alt: "Englivo Platform Preview",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Englivo",
        description: "Advanced ESL Tutoring & AI Practice",
        images: ["/og-image.jpg"],
    },
    verification: {
        google: "jk58qo7u4JdJ31q1TTYOQu6y7qzBPFYmmyj86rSi6TU",
    },
    alternates: {
        canonical: "./",
    },
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
                    {/* Google Analytics */}
                    <Script
                        src="https://www.googletagmanager.com/gtag/js?id=G-7MTWCZ41GW"
                        strategy="afterInteractive"
                    />
                    <Script id="google-analytics" strategy="afterInteractive">
                        {`
                          window.dataLayer = window.dataLayer || [];
                          function gtag(){dataLayer.push(arguments);}
                          gtag('js', new Date());

                          gtag('config', 'G-7MTWCZ41GW');
                        `}
                    </Script>
                    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                        {children}
                        <Analytics />
                    </ThemeProvider>
                </body>
            </html>
        </ClerkProvider>
    );
}
