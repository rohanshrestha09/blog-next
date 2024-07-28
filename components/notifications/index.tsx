import Head from 'next/head';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Divider, List, Skeleton } from 'antd';
import InfiniteScroll from 'react-infinite-scroll-component';
import { withAuth } from 'auth';
import NotificationCard from './components/NotificationCard';
import { useFilterStore } from 'store/hooks';
import { errorNotification } from 'utils/notification';
import { FILTERS } from 'constants/reduxKeys';
import { getGenre } from 'request/blog';
import { getProfile } from 'request/auth';
import { queryKeys } from 'utils';
import { getNotifications, markAllAsRead } from 'request/notification';
import { AUTH, GENRE, NOTIFICATION } from 'constants/queryKeys';

const Notifications = () => {
  const { size, setSize } = useFilterStore(FILTERS.NOTIFICATION_FILTER);

  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useQuery({
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

        {isLoading ? (
          Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className='py-1' avatar round paragraph={{ rows: 1 }} active />
          ))
        ) : (
          <InfiniteScroll
            dataLength={notifications?.result?.length ?? 0}
            next={() => setSize(10)}
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
  ctx.res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=59');

  const config = { headers: { Cookie: ctx.req.headers.cookie || '' } };

  await queryClient.prefetchQuery({
    queryFn: () => getProfile(config),
    queryKey: queryKeys(AUTH).details(),
  });

  await queryClient.prefetchQuery({
    queryFn: () => getNotifications({ size: 20 }, config),
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
