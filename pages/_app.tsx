import '../styles/globals.css';
import type { AppProps } from 'next/app';
import React from 'react';
import { QueryClientProvider, QueryClient, Hydrate } from '@tanstack/react-query';
import UserAuth from '../utils/UserAuth';

function MyApp({ Component, pageProps }: AppProps) {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <Hydrate state={pageProps.dehydratedState}>
        <UserAuth>
          <Component {...pageProps} />
        </UserAuth>
      </Hydrate>
    </QueryClientProvider>
  );
}

export default MyApp;
