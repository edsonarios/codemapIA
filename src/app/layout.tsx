import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Head from 'next/head'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CodeMap IA',
  description:
    'Generate a map of your project and generate an explanation using AI',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="text-white">
      <Head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </Head>
      <div className="fixed top-0 z-[-2] h-screen w-screen bg-neutral-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-5%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
