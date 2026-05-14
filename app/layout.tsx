import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CardNova Admin',
  description:
    'Admin dashboard for CardNova - manage trades, withdrawals, gift cards, and users with ease.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en' className='h-full antialiased'>
      <body className='min-h-full flex flex-col'>{children}</body>
    </html>
  )
}
