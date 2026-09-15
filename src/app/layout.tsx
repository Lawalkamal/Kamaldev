import type { Metadata } from "next";
import "./globals.css";
import VisualEditsMessenger from "../visual-edits/VisualEditsMessenger";
import ErrorReporter from "@/components/ErrorReporter";
import Preloader from "@/components/Preloader";
import SmoothScroll from "@/components/SmoothScroll";
import { PRELOADER_GUARD_SCRIPT } from "@/lib/preloader";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Kamal. — Web Developer & UI Designer",
  description: "Premium portfolio showcasing modern web development and UI design work",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // `data-preloader` is written onto <html> by the guard script before
  // hydration — an intentional mismatch, so React is told not to report it.
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="antialiased">
        {/* First thing in the body, so it runs while the parser is still
            reading the document — before anything is painted. */}
        <script
          id="preloader-guard"
          dangerouslySetInnerHTML={{ __html: PRELOADER_GUARD_SCRIPT }}
        />
        <ErrorReporter />
        <Script
          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/scripts//route-messenger.js"
          strategy="afterInteractive"
          data-target-origin="*"
          data-message-type="ROUTE_CHANGE"
          data-include-search-params="true"
          data-only-in-iframe="true"
          data-debug="true"
          data-custom-data='{"appName": "YourApp", "version": "1.0.0", "greeting": "hi"}'
        />
        <SmoothScroll />
        <Preloader />
        {children}
        <VisualEditsMessenger />
      </body>
    </html>
  );
}
