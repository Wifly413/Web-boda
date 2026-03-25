import type { Metadata, Viewport } from 'next'
import { Cormorant_Garamond, Montserrat } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const cormorant = Cormorant_Garamond({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-serif"
});

const montserrat = Montserrat({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-sans"
});

export const viewport: Viewport = {
  themeColor: '#F5F0EB',
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  title: 'Nuestra Boda - Comparte tus Fotos',
  description: 'Sube y comparte tus fotos de nuestra boda. Gracias por ser parte de este momento especial.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={`${cormorant.variable} ${montserrat.variable} font-sans antialiased`}>
        {children}
        <Toaster position="top-center" />
        <Analytics />
      </body>
    </html>
  )
}
