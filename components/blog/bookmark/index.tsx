import Head from 'next/head';
import { useRouter } from 'next/router';
import { dehydrate, useQuery } from '@tanstack/react-query';
import { Button, ConfigProvider, Divider, Empty, List, Skeleton } from 'antd';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useAuth, withAuth } from 'auth';
import BlogCard from 'components/common/BlogCard';
import Filter from 'components/common/Filter';
import { getBookmarks, getProfile } from 'request/auth';
import { getGenre } from 'request/blog';
import { useFilterStore } from 'store/hooks';
import { queryKeys } from 'utils';
import { FILTERS } from 'constants/reduxKeys';
import { AUTH, GENRE, BOOKMARK } from 'constants/queryKeys';

const Bookmarks = () => {
  const router = useRouter();

  const { size, search, genre, setSize } = useFilterStore(FILTERS.BOOKMARK_FILTER);

  const { authUser } = useAuth();

  const {
    data: blogs,
    isPreviousData,
    isFetchedAfterMount,
  } = useQuery({
    queryFn: () => getBookmarks({ genre, size, search }),
    queryKey: queryKeys(BOOKMARK).list({ genre, size, search }),
    keepPreviousData: true,
  });

  return (
    <div className='w-full flex justify-center'>
      <Head>
        <title>Bookmarks | BlogSansar</title>
        <link href='/favicon.ico' rel='icon' />
      </Head>

      <main className='w-full flex flex-col'>
        <header className='w-full text-2xl uppercase'>Bookmarks</header>

        <Divider />

        <Filter filterType={FILTERS.BOOKMARK_FILTER} isLoading={isPreviousData} />

        {blogs?.count && !isFetchedAfterMount ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className='py-8' avatar round paragraph={{ rows: 3 }} active />
          ))
        ) : (
          <InfiniteScroll
            dataLength={blogs?.result?.length ?? 0}
            next={() => setSize(10)}
            hasMore={blogs?.result ? blogs?.result?.length < blogs?.count : false}
            loader={<Skeleton avatar round paragraph={{ rows: 2 }} active />}
          >
            <ConfigProvider
              renderEmpty={() => (
                <Empty>
                  <Button
                    className='h-10 btn-secondary rounded-lg'
                    onClick={() => router.push('/')}
                  >
                    Browse Blogs
                  </Button>
                </Empty>
              )}
            >
              <List
                itemLayout='vertical'
                dataSource={blogs?.result}
                renderItem={(blog) => (
                  <BlogCard key={blog?.id} blog={blog} editable={blog?.authorId === authUser?.id} />
                )}
              />
            </ConfigProvider>
          </InfiniteScroll>
        )}
      </main>
    </div>
  );
};

export default Bookmarks;

export const getServerSideProps = withAuth(async (ctx, queryClient) => {
  ctx.res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=59');

  const config = { headers: { Cookie: ctx.req.headers.cookie || '' } };

  await queryClient.prefetchQuery({
    queryFn: () => getProfile(config),
    queryKey: queryKeys(AUTH).details(),
  });

  await queryClient.prefetchQuery({
    queryFn: () => getBookmarks({}, config),
    queryKey: queryKeys(BOOKMARK).list({ genre: [], size: 20, search: '' }),
  });

  await queryClient.prefetchQuery({
    queryFn: () => getGenre(config),
    queryKey: queryKeys(GENRE).lists(),
  });

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  };
});
