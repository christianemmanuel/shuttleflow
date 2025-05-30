'use client';

import './globals.css';
import { Inter } from 'next/font/google';
import Header from '@/components/ui/Header';
import { DataProvider } from '@/context/DataContext';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-100 min-h-screen`}>
        <DataProvider>
          <Header />
          <main className="mx-auto py-6">
            {children}
          </main>
        </DataProvider>
      </body>
    </html>
  );
}