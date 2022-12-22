import Head from 'next/head';
import { GetServerSidePropsContext, NextPage } from 'next';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import {
  dehydrate,
  DehydratedState,
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { Divider, Empty, List, Skeleton } from 'antd';
import { isEmpty } from 'lodash';
import InfiniteScroll from 'react-infinite-scroll-component';
import withAuth from '../utils/auth';
import AuthAxios from '../api/AuthAxios';
import UserAxios from '../api/UserAxios';
import BlogAxios from '../api/BlogAxios';
import NotificationList from '../components/Notifications';
import NotificationAxios from '../api/NotificationAxios';
import { setPageSize } from '../store/sortFilterSlice';
import { errorNotification } from '../utils/notification';
import {
  AUTH,
  GET_BLOG_SUGGESTIONS,
  GET_GENRE,
  GET_NOTIFICATIONS,
  GET_USER_SUGGESTIONS,
} from '../constants/queryKeys';
import { NOTIFICATIONS_KEYS } from '../constants/reduxKeys';

const { NOTIFICATIONS } = NOTIFICATIONS_KEYS;

const Notifications: NextPage = () => {
  const {
    pageSize: { [NOTIFICATIONS]: pageSize },
  } = useSelector((state: RootState) => state.sortFilter, shallowEqual);

  const dispatch = useDispatch();

  const queryClient = useQueryClient();

  const notificationAxois = new NotificationAxios();

  const { data: notifications } = useQuery({
    queryFn: () => notificationAxois.getNotifications({ pageSize }),
    queryKey: [GET_NOTIFICATIONS, { pageSize }],
    keepPreviousData: true,
  });

  const handleMarkAllAsRead = useMutation(() => notificationAxois.markAllAsRead(), {
    onSuccess: () => queryClient.refetchQueries([GET_NOTIFICATIONS]),
    onError: (err: AxiosError) => errorNotification(err),
  });

  return (
    <div className='w-full flex justify-center'>
      <Head>
        <title>Notifications | BlogSansar</title>
        <link href='/favicon.ico' rel='icon' />
      </Head>

      <main className='w-full flex flex-col'>
        <header className='flex items-center justify-between'>
          <p className='text-2xl uppercase'>Notifications</p>
          <p
            className='text-sm text-[#1890ff] cursor-pointer hover:text-blue-600 transition-all duration-300'
            onClick={() => notifications?.unread && handleMarkAllAsRead.mutate()}
          >
            Mark all as read
          </p>
        </header>

        <Divider />

        {isEmpty(notifications?.data) ? (
          <Empty />
        ) : (
          <InfiniteScroll
            dataLength={notifications?.data.length ?? 0}
            next={() => dispatch(setPageSize({ key: NOTIFICATIONS, pageSize: 10 }))}
            hasMore={
              notifications?.data ? notifications?.data.length < notifications?.count : false
            }
            loader={<Skeleton avatar round paragraph={{ rows: 1 }} active />}
          >
            <List
              itemLayout='vertical'
              dataSource={notifications?.data}
              renderItem={(notification) => (
                <NotificationList key={notification._id} notification={notification} />
              )}
            />
          </InfiniteScroll>
        )}
      </main>
    </div>
  );
};

export default Notifications;

export const getServerSideProps = withAuth(
  async (
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
  }
);
