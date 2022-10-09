import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import { DehydratedState, QueryClient, dehydrate } from '@tanstack/react-query';
import UserAxios from '../../apiAxios/userAxios';
import { GET_USER } from '../../constants/queryKeys';

const UserProfile = () => {
  return <div>[userId]</div>;
};

export default UserProfile;

export const getServerSideProps: GetServerSideProps = async (
  ctx: GetServerSidePropsContext
): Promise<{
  props: { dehydratedState: DehydratedState };
}> => {
  const queryClient = new QueryClient();

  const userAxios = new UserAxios(ctx.req && ctx.req.headers.cookie);

  ctx.res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=59');

  await queryClient.prefetchQuery({
    queryFn: () => userAxios.getUser(ctx.params ? (ctx.params.userId as string) : ''),
    queryKey: [GET_USER, ctx.params && ctx.params.userId],
  });

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  };
};
