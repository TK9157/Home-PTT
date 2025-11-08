import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'PTT - Push to Talk',
  description: 'Real-time voice communication system',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

