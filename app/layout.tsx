"use client"
import Header from "@/components/header"
import { CustomAlertProvider } from "@/hooks/use-custom-alerts"
import { ClerkProvider } from "@clerk/nextjs"
import { Inter } from "next/font/google"
import type React from "react"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <title>ReLinkeder Post Generator</title>
          <meta name="description" content="Generate linkedin posts with AI" />
          <link rel="icon" href="/logo.svg" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta name="theme-color" content="#ffffff" />
          <meta name="og:title" content="ReLinkeder Post Generator" />
          <meta name="og:description" content="Generate linkedin posts with AI" />
          <meta name="og:image" content="/logo.svg" />
        </head>
        <body className={inter.className}>
          <CustomAlertProvider>
            <Header />
            <main className="min-h-screen bg-gray-50">{children}</main>
          </CustomAlertProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
