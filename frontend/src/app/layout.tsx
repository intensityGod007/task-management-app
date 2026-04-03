import type { Metadata } from 'next';
import { DM_Sans, Fraunces, JetBrains_Mono } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/lib/auth-context';
import './globals.css';

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  weight: ['300', '400', '500', '600'],
});

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  weight: ['300', '400', '600', '700'],
  style: ['normal', 'italic'],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  weight: ['400', '500'],
});

export const metadata: Metadata = {
  title: 'Momentum — Task Management',
  description: 'Stay focused. Move forward.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${fraunces.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-bg-primary text-text-primary antialiased">
        <AuthProvider>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#242424',
                color: '#F5F5F5',
                border: '1px solid #2A2A2A',
                borderRadius: '10px',
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '14px',
              },
              success: { iconTheme: { primary: '#10B981', secondary: '#0F0F0F' } },
              error: { iconTheme: { primary: '#EF4444', secondary: '#0F0F0F' } },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
