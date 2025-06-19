'use client';

import Header from '@/components/ui/Header';
import { DataProvider } from '@/context/DataContext';
import { LoaderProvider } from '@/context/LoaderContext';
import { ToastProvider } from '@/context/ToastContext';
import { ToastContainer } from '@/components/ui/Toast';
import PageLoader from '@/components/ui/PageLoader';
import { useLoader } from '@/context/LoaderContext';
import FirebaseSyncWrapper from '@/components/FirebaseSyncWrapper';

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
    <ToastProvider>
      <LoaderProvider>
        <DataProvider>
          <FirebaseSyncWrapper>
            <AppContent>{children}</AppContent>
          </FirebaseSyncWrapper>
        </DataProvider>
      </LoaderProvider>
    </ToastProvider>
  );
}