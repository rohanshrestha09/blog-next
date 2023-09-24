import { useRouter } from 'next/router';
import type { GetServerSidePropsContext } from 'next';
import { createContext, useContext } from 'react';
import { dehydrate, QueryClient, useMutation, useQuery } from '@tanstack/react-query';
import { getProfile, logout } from 'api/auth';
import { queryKeys } from 'utils';
import { AUTH } from 'constants/queryKeys';
import type { AxiosError } from 'axios';
import type { IContext, TGetServerSidePropsReturnType } from 'interface';

export const AuthContext = createContext<IContext>({});

interface Props {
  children: React.ReactNode;
}

const Auth: React.FC<Props> = ({ children }) => {
  const router = useRouter();

  const handleLogout = useMutation(logout);

  const { data: authUser } = useQuery({
    queryFn: getProfile,
    queryKey: queryKeys(AUTH).details(),
    onError: (err: AxiosError) => {
      if (err?.response?.status === 401) {
        handleLogout.mutate(undefined);
        router.push('/fallback');
      }
    },
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
    const queryClient = new QueryClient();

    const { req } = context;

    const { token } = req.cookies;

    if (!token) {
      return {
        redirect: {
          destination: '/',
        },
      };
    }

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
