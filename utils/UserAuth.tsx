import { dehydrate, DehydratedState, QueryClient, useQuery } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { auth } from '../api/user';
import { AUTH } from '../constants/queryKeys';

import UserContext from './userContext';
import { GetServerSideProps } from 'next';
import AppLayout from '../components/AppLayout';

/* eslint-disable react/prop-types */
const UserAuth: React.FC<{
  children: React.ReactNode;
}> = ({ children }): JSX.Element => {
  const { data: userInfo, refetch } = useQuery({
    queryFn: () => auth(),
    queryKey: [AUTH],
    onError: () => localStorage.removeItem('token'),
  });

  const userLogout = (): void => {
    localStorage.removeItem('token');
    userInfo && window.location.reload();
    refetch();
  };

  return (
    <UserContext.Provider value={{ userInfo: userInfo && userInfo.user, userLogout }}>
      <AppLayout>
        {children} <ReactQueryDevtools />
      </AppLayout>
    </UserContext.Provider>
  );
};

export default UserAuth;

export const getServerSideProps: GetServerSideProps = async (): Promise<{
  props: { dehydratedState: DehydratedState };
}> => {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({ queryFn: () => auth(), queryKey: [AUTH] });

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  };
};
