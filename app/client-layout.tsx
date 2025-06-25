'use client';

import Header from '@/components/ui/Header';
import { DataProvider } from '@/context/DataContext';
import { LoaderProvider } from '@/context/LoaderContext';
import { ToastProvider } from '@/context/ToastContext';
import { ToastContainer } from '@/components/ui/Toast';
import PageLoader from '@/components/ui/PageLoader';
import { useLoader } from '@/context/LoaderContext';
import FirebaseSyncWrapper from '@/components/FirebaseSyncWrapper';
import Script from 'next/script';

function AppContent({ children }: { children: React.ReactNode }) {
  const { isLoading, hideLoader, message } = useLoader();
  
  return (
    <>
      <PageLoader show={isLoading} onFinished={hideLoader} message={message} />
      <Header />
      <main className="mx-auto py-6 md:pb-6 pb-17">
        {children}
      </main>
      <ToastContainer />
    </>
  );
}

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Global Site Tag (gtag.js) - Google Analytics */}
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
      />
      <Script
        id="gtag-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
      <ToastProvider>
        <LoaderProvider>
          <DataProvider>
            <FirebaseSyncWrapper>
              <AppContent>{children}</AppContent>
            </FirebaseSyncWrapper>
          </DataProvider>
        </LoaderProvider>
      </ToastProvider>
    </>
  );
}