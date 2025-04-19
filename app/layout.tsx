import type { ReactNode } from "react";
import "@/app/globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { WorkoutProvider } from "@/lib/workout-context";
import Script from "next/script";
import { Particles } from "@/components/ui/particles";
import { DynamicThemeColor } from "@/components/dynamic-theme-color";
export const metadata = {
  title: "LiftMate - Fitness Tracking",
  description: "Track your workouts and fitness progress",
  generator: "v0.dev",
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>{/* Ensure no whitespace here */}
      <meta name="viewport" content="initial-scale=1, viewport-fit=cover" />
      <meta name="theme-color" media="(prefers-color-scheme: light)" content="#00796b"/>
      <meta name="theme-color" media="(prefers-color-scheme: dark)"  content="#004d40"/>
        {/* PWA Tags for Add to Home Screen */}
        <meta name="mobile-web-app-capable" content="yes" />{/* Standard */}
        <meta name="apple-mobile-web-app-capable" content="yes" />{/* Apple specific */}
        {/* Theme color is now handled dynamically by DynamicThemeColor component */}
        <meta name="apple-mobile-web-app-title" content="LiftMate" />
        {/* Add Font Awesome for the loading icons */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
          integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />{/* Ensure no whitespace here */}
      </head>
      <body className="overflow-hidden">
{/* No need for the status bar background div with our new approach */}
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <DynamicThemeColor />
          <WorkoutProvider>
            {/* Particles background effect */}
            <Particles
              className="fixed inset-0 z-0"
              quantity={100}
              staticity={30}
              ease={50}
              size={1}
            />
            <div className="app-container h-screen flex flex-col relative z-10">{children}</div>
          </WorkoutProvider>
        </ThemeProvider>
        {/* Add Font Awesome script */}
        <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/js/all.min.js"
          integrity="sha512-GWzVrcGlo0TxTRvz9ttioyYJ+Wwk9Ck0G81D+eO63BaqHaJ3YZX9wuqjwgfcV/MrB2PhaVX9DkYVhbFpStnqpQ=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
