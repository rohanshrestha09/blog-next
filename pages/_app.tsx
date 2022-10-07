import '../styles/antd.dark.min.css';
import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { useState } from 'react';
import { Provider } from 'react-redux';
import { QueryClientProvider, QueryClient, Hydrate } from '@tanstack/react-query';
import store from '../store';
import UserAuth from '../utils/UserAuth';

function MyApp({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(
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
        <Provider store={store}>
          <UserAuth>
            <Component {...pageProps} />
          </UserAuth>
        </Provider>
      </Hydrate>
    </QueryClientProvider>
  );
}

export default MyApp;
