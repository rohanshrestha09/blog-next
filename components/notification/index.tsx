import Head from 'next/head';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Divider, List, Skeleton } from 'antd';
import InfiniteScroll from 'react-infinite-scroll-component';
import { withAuth } from 'auth';
import NotificationCard from './components/NotificationCard';
import { setSize } from 'store/sortFilterSlice';
import { errorNotification } from 'utils/notification';
import { NOTIFICATIONS_KEYS } from 'constants/reduxKeys';
import { getGenre } from 'request/blog';
import { getProfile } from 'request/auth';
import { queryKeys } from 'utils';
import { getNotifications, markAllAsRead } from 'request/notification';
import { AUTH, GENRE, NOTIFICATION } from 'constants/queryKeys';

const { NOTIFICATIONS } = NOTIFICATIONS_KEYS;

const Notifications = () => {
  const {
    size: { [NOTIFICATIONS]: size },
  } = useSelector((state: RootState) => state.sortFilter, shallowEqual);

  const dispatch = useDispatch();

  const queryClient = useQueryClient();

  const { data: notifications, isFetchedAfterMount } = useQuery({
    queryFn: () => getNotifications({ size }),
    queryKey: queryKeys(NOTIFICATION).list({ size }),
    keepPreviousData: true,
  });

  const handleMarkAllAsRead = useMutation(markAllAsRead, {
    onSuccess: () => queryClient.refetchQueries(queryKeys(NOTIFICATION).all),
    onError: errorNotification,
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
            onClick={() => notifications?.unread && handleMarkAllAsRead.mutate(undefined)}
          >
            Mark all as read
          </p>
        </header>

        <Divider />

        {!isFetchedAfterMount ? (
          Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className='py-1' avatar round paragraph={{ rows: 1 }} active />
          ))
        ) : (
          <InfiniteScroll
            dataLength={notifications?.result?.length ?? 0}
            next={() => dispatch(setSize({ key: NOTIFICATIONS, size: 10 }))}
            hasMore={
              notifications?.result ? notifications?.result?.length < notifications?.count : false
            }
            loader={<Skeleton avatar round paragraph={{ rows: 1 }} active />}
          >
            <List
              itemLayout='vertical'
              dataSource={notifications?.result}
              renderItem={(notification) => <NotificationCard notification={notification} />}
            />
          </InfiniteScroll>
        )}
      </main>
    </div>
  );
};

export default Notifications;

export const getServerSideProps = withAuth(async (ctx, queryClient) => {
  ctx.res.setHeader('Cache-Control', 'public, s-maxage=86400');

  const config = { headers: { Cookie: ctx.req.headers.cookie || '' } };

  await queryClient.prefetchQuery({
    queryFn: () => getProfile(config),
    queryKey: queryKeys(AUTH).details(),
  });

  await queryClient.prefetchQuery({
    queryFn: () => getNotifications({}, config),
    queryKey: queryKeys(NOTIFICATION).list({ size: 20 }),
  });

  await queryClient.prefetchQuery({
    queryFn: () => getGenre(config),
    queryKey: queryKeys(GENRE).lists(),
  });

  return {
    props: {},
  };
});
