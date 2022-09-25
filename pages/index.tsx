import Head from 'next/head';
import type { GetServerSideProps, GetServerSidePropsContext, NextPage } from 'next';
import { DehydratedState, QueryClient, dehydrate } from '@tanstack/react-query';
import AuthAxios from '../apiAxios/authAxios';
import { AUTH } from '../constants/queryKeys';

const Home: NextPage = () => {
  return (
    <div>
      <Head>
        <title>Create Next App</title>
        <link href='/favicon.ico' rel='icon' />
      </Head>

      <main></main>
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

  const authAxios = new AuthAxios(ctx.req && ctx.req.headers.cookie);

  ctx.res.setHeader('Cache-Control', 'public, s-maxage=86400');

  await queryClient.prefetchQuery({
    queryFn: () => authAxios.auth(),
    queryKey: [AUTH],
  });

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  };
};
