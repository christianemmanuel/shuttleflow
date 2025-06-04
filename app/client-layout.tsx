'use client';

import Header from '@/components/ui/Header';
import { DataProvider } from '@/context/DataContext';
import { LoaderProvider } from '@/context/LoaderContext';
import PageLoader from '@/components/ui/PageLoader';
import { useLoader } from '@/context/LoaderContext';

function AppContent({ children }: { children: React.ReactNode }) {
  const { isLoading, hideLoader, message } = useLoader();
  
  return (
    <>
      <PageLoader show={isLoading} onFinished={hideLoader} message={message} />
      <Header />
      <main className="mx-auto py-6">
        {children}
      </main>
    </>
  );
}

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LoaderProvider>
      <DataProvider>
        <AppContent>{children}</AppContent>
      </DataProvider>
    </LoaderProvider>
  );
}