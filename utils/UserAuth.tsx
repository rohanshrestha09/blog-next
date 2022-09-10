import { useQuery } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import UserAxios from '../apiAxios/userAxios';
import { AUTH } from '../constants/queryKeys';
import UserContext from './userContext';
import AppLayout from '../components/Layout/AppLayout';

const UserAuth: React.FC<{
  children: React.ReactNode;
}> = ({ children }): JSX.Element => {
  const { data: user, refetch } = useQuery({
    queryFn: () => new UserAxios().auth(),
    queryKey: [AUTH],
  });

  const userLogout = (): void => {
    refetch();
  };

  return (
    <UserContext.Provider value={{ user, userLogout }}>
      <AppLayout>
        {children} <ReactQueryDevtools />
      </AppLayout>
    </UserContext.Provider>
  );
};

export default UserAuth;
