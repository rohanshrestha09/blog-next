import Head from 'next/head';
import type { GetServerSideProps, GetServerSidePropsContext, NextPage } from 'next';
import { DehydratedState, QueryClient, dehydrate } from '@tanstack/react-query';
import UserAxios from '../apiAxios/userAxios';
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

  const userAxios = new UserAxios(ctx.req && ctx.req.headers.cookie);

  await queryClient.prefetchQuery({
    queryFn: () => userAxios.auth(),
    queryKey: [AUTH],
  });

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  };
};
