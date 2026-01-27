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
    alternates: {
        canonical: "https://englivo.com",
    },
    title: {
        default: "Englivo — English Fluency for Professionals",
        template: "%s | Englivo",
    },
    description:
        "Stop translating in your head. Build real English fluency with AI-powered speaking practice, CEFR-based feedback, and live coaching for professionals.",

    verification: {
        google: "jk58qo7u4JdJ31q1TTYOQu6y7qzBPFYmmyj86rSi6TU",
    },

    icons: {
        icon: "/favicon.ico?v=3",
        shortcut: "/favicon.ico?v=3",
        apple: "/apple-icon.png?v=3",
    },

    openGraph: {
        title: "Englivo — English Fluency for Professionals",
        description:
            "AI-powered English fluency training for professionals. Stop translating. Start speaking naturally.",
        url: "https://englivo.com",
        siteName: "Englivo",
        images: [
            {
                url: "https://englivo.com/og-image.png",
                width: 1200,
                height: 630,
                alt: "Englivo — English Fluency for Professionals",
            },
        ],
        type: "website",
    },

    twitter: {
        card: "summary_large_image",
        title: "Englivo — English Fluency for Professionals",
        description:
            "Stop translating in your head. Build real English fluency with AI-powered speaking practice.",
        images: ["https://englivo.com/og-image.png"],
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
                    <Script id="website-schema" type="application/ld+json">
                        {`
                          {
                            "@context": "https://schema.org",
                            "@type": "WebSite",
                            "name": "Englivo",
                            "url": "https://englivo.com",
                            "potentialAction": {
                              "@type": "SearchAction",
                              "target": "https://englivo.com/blog?q={search_term_string}",
                              "query-input": "required name=search_term_string"
                            }
                          }
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
