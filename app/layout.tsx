import { Toaster } from 'sonner'
import type { Metadata } from 'next'
import localFont from 'next/font/local'

import Header from '@/components/business/Header'
import WalletProvider from '@/lib/providers/WalletProvider'

import './globals.css'

const font = localFont({
  src: [
    {
      path: './fonts/NunitoSans.ttf',
      weight: '400',
      style: 'normal',
    },
  ],
  variable: '--font-nunito-sans',
})

export const metadata: Metadata = {
  title: 'Mantle RealFi Console App',
  description: 'Mantle RealFi Console App',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${font.variable} antialiased`}>
        <main>
          <WalletProvider>
            <Header />
            {children}
          </WalletProvider>
        </main>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  )
}
