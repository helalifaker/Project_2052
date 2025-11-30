import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers/Providers";
import { LoadingBar } from "@/components/ui/loading-bar";
import { SkipLink } from "@/components/ui/visually-hidden";

export const metadata: Metadata = {
  title: "Project 2052 | Lease Proposal Platform",
  description:
    "End-to-end proposal, negotiation, and financial modeling platform for Project 2052.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <SkipLink href="#main-content">Skip to main content</SkipLink>
        <LoadingBar />
        <Providers>
          <main id="main-content" tabIndex={-1}>
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
