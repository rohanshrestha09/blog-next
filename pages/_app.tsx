import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { useState } from 'react';
import { Provider } from 'react-redux';
import { QueryClientProvider, QueryClient, Hydrate, DehydratedState } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import Auth from 'auth';
import AppLayout from 'components/layout';
import store from '../store';

function MyApp({ Component, pageProps }: AppProps<{ dehydratedState: DehydratedState }>) {
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

  return (
    <QueryClientProvider client={queryClient}>
      <Hydrate state={pageProps.dehydratedState}>
        <Provider store={store}>
          <Auth>
            <AppLayout>
              <ReactQueryDevtools />

              <Component {...pageProps} />
            </AppLayout>
          </Auth>
        </Provider>
      </Hydrate>
    </QueryClientProvider>
  );
}

export default MyApp;
