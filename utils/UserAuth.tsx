import { useQuery } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import Cookies from 'js-cookie';
import { auth } from '../apiAxios/user';
import { AUTH } from '../constants/queryKeys';
import UserContext from './userContext';
import AppLayout from '../components/AppLayout';

/* eslint-disable react/prop-types */
const UserAuth: React.FC<{
  children: React.ReactNode;
}> = ({ children }): JSX.Element => {
  const { data: userInfo, refetch } = useQuery({
    queryFn: () => auth({ cookie: Cookies.get('token') }),
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
