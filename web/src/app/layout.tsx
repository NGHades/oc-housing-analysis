import { Inter } from "next/font/google"
import type { Metadata } from "next"
import { ThemeProvider } from "next-themes"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export const metadata: Metadata = {
  title: "Orange County Housing",
  description: "Progress reports on the Orange County housing market.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-sans min-h-full bg-white text-gray-900 antialiased`}
      >
        <ThemeProvider
          defaultTheme="light"
          enableSystem={false}
          forcedTheme="light"
          disableTransitionOnChange
          attribute="class"
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
