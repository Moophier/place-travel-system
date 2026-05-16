import type { Metadata } from "next"
import { SessionProvider } from "@/components/SessionProvider"
import "./globals.css"

export const metadata: Metadata = {
  title: "文迹 · Literary Footprints — 情怀文旅资产平台",
  description: "用 Design.md 书写你的文学朝圣路线，每一张卡片都是情感的独享资产",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@300;400;600;700;900&family=Cinzel+Decorative:wght@400;700&family=Cinzel:wght@400;600&family=IM+Fell+English:ital@0;1&display=swap" rel="stylesheet" />
      </head>
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  )
}
