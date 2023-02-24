import { NextRouter, useRouter } from 'next/router';
import { createContext, Fragment, useContext, useEffect, useRef } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { io } from 'socket.io-client';
import { auth } from './firebase';
import AuthAxios from '../api/AuthAxios';
import UserAxios from '../api/UserAxios';
import AppLayout from '../components/Layout/AppLayout';
import { AUTH } from '../constants/queryKeys';
import type IContext from '../interface/context';

export const UserContext = createContext<IContext | any>(null);

const UserAuth: React.FC<{
  children: React.ReactNode;
}> = ({ children }): JSX.Element => {
  const { pathname }: NextRouter = useRouter();

  const socket = useRef(io(process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:5000'));

  const { data: authUser } = useQuery({
    queryFn: () => AuthAxios().auth(),
    queryKey: [AUTH],
    onSuccess: (authUser) => socket.current.emit('add user', authUser._id),
  });

  const handleGoogleSignIn = useMutation((user: User) => UserAxios().googleSignIn(user));

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (authUser) return;

      if (user) handleGoogleSignIn.mutate(user);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser]);

  switch (pathname) {
    case '/security/reset-password':
    case '/security/reset-password/[user]/[token]':
      return <Fragment>{children}</Fragment>;

    default:
      return (
        <UserContext.Provider value={{ authUser, socket }}>
          <AppLayout>
            {children} <ReactQueryDevtools />
          </AppLayout>
        </UserContext.Provider>
      );
  }
};

export default UserAuth;

export const useAuth = () => useContext(UserContext) as IContext;
