import { useQuery } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import Cookies from 'js-cookie';
import { auth } from '../api/user';
import { AUTH } from '../constants/queryKeys';
import UserContext from './userContext';
import AppLayout from '../components/AppLayout';

/* eslint-disable react/prop-types */
const UserAuth: React.FC<{
  children: React.ReactNode;
}> = ({ children }): JSX.Element => {
  const cookie = Cookies.get('token') ? `token=${Cookies.get('token')}` : undefined;

  const { data: userInfo, refetch } = useQuery({
    queryFn: () => auth({ cookie }),
    queryKey: [AUTH],
  });

  const userLogout = (): void => {
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
