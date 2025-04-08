import type { ReactNode } from "react"
import "@/app/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { WorkoutProvider } from "@/lib/workout-context"
import Script from "next/script"

export const metadata = {
  title: "LiftMate - Fitness Tracking",
  description: "Track your workouts and fitness progress",
  generator: "v0.dev"
}

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        <link rel="manifest" href="/manifest.json" />
        {/* Apple PWA Tags for Add to Home Screen */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="LiftMate" />
        {/* Add Font Awesome for the loading icons */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
          integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </head>
      <body className="overflow-hidden">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <WorkoutProvider>
            <div className="app-container h-screen flex flex-col">{children}</div>
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
  )
}
