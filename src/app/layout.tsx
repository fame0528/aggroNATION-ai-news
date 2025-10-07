import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from '@/context/ThemeContext';
import { ServiceInitializer } from '@/components';
import '@/styles/globals.css';

// Note: Server services initialization moved to ServiceInitializer component

const inter = Inter({ subsets: ['latin'] });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  title: 'aggroNATION - The Ultimate AI News Aggregation Platform',
  description: 'Discover and explore the latest AI news, research papers, Twitter discussions, and YouTube content from 50+ curated sources, all in one intelligent interface.',
  keywords: 'AI news, artificial intelligence, machine learning, deep learning, AI research, OpenAI, ChatGPT, tech news, AI aggregation',
  authors: [{ name: 'aggroNATION Team' }],
  creator: 'aggroNATION',
  publisher: 'aggroNATION',
  robots: 'index, follow',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  openGraph: {
    type: 'website',
    title: 'aggroNATION - The Ultimate AI News Platform',
    description: 'Real-time AI news from 50+ sources including OpenAI, DeepMind, Anthropic, top researchers, and YouTube channels',
    siteName: 'aggroNATION',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'aggroNATION - Ultimate AI News Platform',
    description: 'Real-time AI news aggregation from 50+ premium sources',
  },
  alternates: {
    canonical: '/',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="aggroNATION" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="aggroNATION" />
      </head>
      <body className={`${inter.className} min-h-screen bg-gray-50 dark:bg-gray-900`}>
        <ThemeProvider>
          <ServiceInitializer />
          <div id="root" className="relative">
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 6000,
                style: {
                  background: 'var(--color-bg-secondary)',
                  color: 'var(--color-text-primary)',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border)',
                  fontSize: '14px',
                  maxWidth: '400px',
                  lineHeight: '1.4',
                },
                success: {
                  iconTheme: {
                    primary: 'var(--color-success)',
                    secondary: 'white',
                  },
                  style: {
                    background: 'var(--color-success-bg, #dcfce7)',
                    color: 'var(--color-success-text, #166534)',
                    border: '1px solid var(--color-success-border, #bbf7d0)',
                  },
                },
                error: {
                  iconTheme: {
                    primary: 'var(--color-error)',
                    secondary: 'white',
                  },
                  style: {
                    background: 'var(--color-error-bg, #fef2f2)',
                    color: 'var(--color-error-text, #dc2626)',
                    border: '1px solid var(--color-error-border, #fecaca)',
                  },
                },
              }}
            />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}