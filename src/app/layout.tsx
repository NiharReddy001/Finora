import type { Metadata } from 'next';
import './globals.css';
import { FinanceProvider } from '@/context/FinanceContext';
import AppShell from '@/components/layout/AppShell';

export const metadata: Metadata = {
  title: 'Finora — Finance Intelligence',
  description:
    'Actionable financial intelligence dashboard for modern capital clarity.',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/apple-touch-icon.svg', type: 'image/svg+xml' },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <FinanceProvider>
          <AppShell>{children}</AppShell>
        </FinanceProvider>
      </body>
    </html>
  );
}
