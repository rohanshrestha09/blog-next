import { NextRouter, useRouter } from 'next/router';
import { createContext, Fragment, useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { getProfile } from 'api/auth';
// import AppLayout from '../components/Layout/AppLayout';
import { AUTH } from '../constants/queryKeys';
import { queryKeys } from 'utils';
import { type IContext } from 'interface';

export const UserContext = createContext<IContext | any>(null);

const UserAuth: React.FC<{
  children: React.ReactNode;
}> = ({ children }): JSX.Element => {
  const { pathname }: NextRouter = useRouter();

  const { data: authUser } = useQuery({
    queryFn: getProfile,
    queryKey: queryKeys(AUTH).details(),
  });

  switch (pathname) {
    case '/security/reset-password':
    case '/security/reset-password/[user]/[token]':
      return <Fragment>{children}</Fragment>;

    default:
      return (
        <UserContext.Provider value={{ authUser }}>
          {/* <AppLayout> */}
          {children} <ReactQueryDevtools />
          {/* </AppLayout> */}
        </UserContext.Provider>
      );
  }
};

export default UserAuth;

export const useAuth = () => useContext(UserContext) as IContext;
