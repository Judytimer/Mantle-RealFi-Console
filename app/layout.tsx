import { Toaster } from 'sonner'
import type { Metadata } from 'next'
import localFont from 'next/font/local'

import './globals.css'

const font = localFont({
  src: [
    {
      path: './fonts/NunitoSans.tff',
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
        <main>{children}</main>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  )
}
