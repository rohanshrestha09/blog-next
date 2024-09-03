import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { Provider } from 'react-redux';
import { QueryClientProvider, QueryClient, Hydrate, DehydratedState } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import Auth from 'auth';
import AppLayout from 'components/layout';
import store from '../store';

function MyApp({ Component, pageProps }: AppProps<{ dehydratedState: DehydratedState }>) {
  const { pathname } = useRouter();

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: false,
          },
        },
      }),
  );

  const staticPaths = [
    '/auth/reset-password',
    '/auth/reset-password/[email]/[token]',
    '/404',
  ];

  return (
    <QueryClientProvider client={queryClient}>
      <Hydrate state={pageProps.dehydratedState}>
        <Provider store={store}>
          {staticPaths.some((path) => pathname.startsWith(path)) ? (
            <Component {...pageProps} />
          ) : (
            <Auth>
              <AppLayout>
                <Component {...pageProps} />
              </AppLayout>
            </Auth>
          )}

          <ReactQueryDevtools />
        </Provider>
      </Hydrate>
    </QueryClientProvider>
  );
}

export default MyApp;
