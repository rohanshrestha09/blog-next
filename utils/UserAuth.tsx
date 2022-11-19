import { createContext, useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import AuthAxios from '../api/AuthAxios';
import AppLayout from '../components/Layout/AppLayout';
import { AUTH } from '../constants/queryKeys';
import type IContext from '../interface/context';

export const UserContext = createContext<IContext | any>(null);

const UserAuth: React.FC<{
  children: React.ReactNode;
}> = ({ children }): JSX.Element => {
  const { data: authUser } = useQuery({
    queryFn: () => new AuthAxios().auth(),
    queryKey: [AUTH],
  });

  return (
    <UserContext.Provider value={{ authUser }}>
      <AppLayout>
        {children} <ReactQueryDevtools />
      </AppLayout>
    </UserContext.Provider>
  );
};

export default UserAuth;

export const useAuth = () => useContext(UserContext) as IContext;
