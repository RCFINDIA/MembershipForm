import type { Metadata } from 'next'
import './globals.css'
import '@fontsource/noto-sans/400.css'; // Regular
import '@fontsource/noto-sans/700.css';
export const metadata: Metadata = {
  title: 'Rolbol Membership Registration Form',
  description: 'Fill the memberhsip form Now to avail you membership in our community and be a part of our Family',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
