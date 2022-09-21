import { useQuery } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import UserAxios from '../apiAxios/userAxios';
import { AUTH } from '../constants/queryKeys';
import UserContext from './userContext';
import AppLayout from '../components/Layout/AppLayout';

const UserAuth: React.FC<{
  children: React.ReactNode;
}> = ({ children }): JSX.Element => {
  const { data: user } = useQuery({
    queryFn: () => new UserAxios().auth(),
    queryKey: [AUTH],
  });

  return (
    <UserContext.Provider value={{ user }}>
      <AppLayout>
        {children} <ReactQueryDevtools />
      </AppLayout>
    </UserContext.Provider>
  );
};

export default UserAuth;
