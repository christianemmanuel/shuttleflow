import './globals.css';
import { Inter } from 'next/font/google';
import ClientLayout from './client-layout';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'ShuttleFlow - Smart Badminton Queuing Management',
  description: 'Smart badminton court management system',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-100 min-h-screen`}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}