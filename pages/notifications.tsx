import Head from 'next/head';
import { GetServerSideProps, GetServerSidePropsContext, NextPage } from 'next';
import { dehydrate, DehydratedState, QueryClient, useQuery } from '@tanstack/react-query';
import { Divider, Empty } from 'antd';
import AuthAxios from '../api/AuthAxios';
import UserAxios from '../api/UserAxios';
import BlogAxios from '../api/BlogAxios';
import NotificationAxios from '../api/NotificationAxios';
import {
  AUTH,
  GET_BLOG_SUGGESTIONS,
  GET_GENRE,
  GET_NOTIFICATIONS,
  GET_USER_SUGGESTIONS,
} from '../constants/queryKeys';
import { NOTIFICATIONS_KEYS } from '../constants/reduxKeys';
import { shallowEqual, useSelector } from 'react-redux';
import { RootState } from '../store';
import NotificationList from '../components/Notifications';
import { isEmpty } from 'lodash';

const { NOTIFICATIONS } = NOTIFICATIONS_KEYS;

const Notifications: NextPage = () => {
  const {
    pageSize: { [NOTIFICATIONS]: pageSize },
  } = useSelector((state: RootState) => state.sortFilter, shallowEqual);

  const notificationAxois = new NotificationAxios();

  const { data: notifications } = useQuery({
    queryFn: () => notificationAxois.getNotifications({ pageSize }),
    queryKey: [GET_NOTIFICATIONS, { pageSize }],
  });

  return (
    <div className='w-full flex justify-center'>
      <Head>
        <title>Notifications | BlogSansar</title>
        <link href='/favicon.ico' rel='icon' />
      </Head>

      <main className='w-full flex flex-col'>
        <header className='text-2xl uppercase'>Notifications</header>

        <Divider />

        {isEmpty(notifications?.data) ? (
          <Empty />
        ) : (
          notifications?.data.map((notification) => (
            <NotificationList key={notification._id} notification={notification} />
          ))
        )}
      </main>
    </div>
  );
};

export default Notifications;

export const getServerSideProps: GetServerSideProps = async (
  ctx: GetServerSidePropsContext
): Promise<{
  props: { dehydratedState: DehydratedState };
}> => {
  const queryClient = new QueryClient();

  ctx.res.setHeader('Cache-Control', 'public, s-maxage=86400');

  const authAxios = new AuthAxios(ctx.req.headers.cookie);

  const notificaitonAxios = new NotificationAxios(ctx.req.headers.cookie);

  const blogAxios = new BlogAxios(ctx.req.headers.cookie);

  const userAxios = new UserAxios(ctx.req.headers.cookie);

  await queryClient.prefetchQuery({
    queryFn: () => authAxios.auth(),
    queryKey: [AUTH],
  });

  await queryClient.prefetchQuery({
    queryFn: () => notificaitonAxios.getNotifications({}),
    queryKey: [GET_NOTIFICATIONS, { pageSize: 20 }],
  });

  await queryClient.prefetchQuery({
    queryFn: () => userAxios.getUserSuggestions({ pageSize: 3 }),
    queryKey: [GET_USER_SUGGESTIONS, { pageSize: 3 }],
  });

  await queryClient.prefetchQuery({
    queryFn: () => blogAxios.getBlogSuggestions({ pageSize: 4 }),
    queryKey: [GET_BLOG_SUGGESTIONS, { pageSize: 4 }],
  });

  await queryClient.prefetchQuery({
    queryFn: () => blogAxios.getGenre(),
    queryKey: [GET_GENRE],
  });

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  };
};
