import type { GetServerSidePropsContext } from 'next';
import { createContext, useContext } from 'react';
import { dehydrate, QueryClient, useQuery } from '@tanstack/react-query';
import { getProfile } from 'request/auth';
import { queryKeys } from 'utils';
import { AUTH } from 'constants/queryKeys';
import { IContext, TGetServerSidePropsReturnType } from 'utils/types';

export const AuthContext = createContext<IContext>({});

interface Props {
  children: React.ReactNode;
}

const Auth: React.FC<Props> = ({ children }) => {
  const { data: authUser } = useQuery({
    queryFn: getProfile,
    queryKey: queryKeys(AUTH).details(),
  });

  return <AuthContext.Provider value={{ authUser }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

export const withAuth = (
  gssp: (
    context: GetServerSidePropsContext,
    queryClient: QueryClient,
  ) => Promise<TGetServerSidePropsReturnType>,
) => {
  return async (context: GetServerSidePropsContext) => {
    const { req } = context;

    const { token } = req.cookies;

    if (!token) {
      return {
        redirect: {
          destination: '/?fallback=true',
        },
      };
    }

    const queryClient = new QueryClient();

    try {
      const { props } = await gssp(context, queryClient);

      return {
        props: {
          ...props,
          dehydratedState: dehydrate(queryClient),
        },
      };
    } catch (err) {
      return { notFound: true };
    }
  };
};

export default Auth;
