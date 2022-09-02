import Head from 'next/head';
import type { GetServerSideProps, GetServerSidePropsContext, NextPage } from 'next';
import { DehydratedState, QueryClient, dehydrate } from '@tanstack/react-query';
import { auth } from '../apiAxios/user';
import { AUTH } from '../constants/queryKeys';

const Home: NextPage = () => {
  return (
    <div>
      <Head>
        <title>Create Next App</title>
        <link href='/favicon.ico' rel='icon' />
      </Head>

      <main>
        <label className='btn modal-button w-24' htmlFor='registerModal'>
          open Register
        </label>
        <label className='btn modal-button w-24' htmlFor='loginModal'>
          open login
        </label>
      </main>
    </div>
  );
};

export default Home;

export const getServerSideProps: GetServerSideProps = async (
  ctx: GetServerSidePropsContext
): Promise<{
  props: { dehydratedState: DehydratedState };
}> => {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryFn: () => auth({ cookie: ctx.req && ctx.req.headers.cookie }),
    queryKey: [AUTH],
  });

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  };
};
