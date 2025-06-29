import './globals.css';
import { Noto_Sans } from 'next/font/google';
import ClientLayout from './client-layout';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from "@vercel/speed-insights/next"

const notoSans = Noto_Sans({ 
  subsets: ['latin'],
  weight: ['400', '500', '700'] // You can adjust weights as needed
});


export const metadata = {
  title: 'ShuttleFlow - Smart Badminton Queueing Management',
  description: 'Smart badminton court management system',
  icons: {
    icon: '/favicon.ico',
    // Optional: add different sizes
    apple: '/apple-touch-icon.png'
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${notoSans.className} bg-gray-100 min-h-screen`}>
        <ClientLayout>{children}</ClientLayout>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}