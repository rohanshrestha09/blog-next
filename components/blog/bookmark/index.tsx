import Head from 'next/head';
import { NextRouter, useRouter } from 'next/router';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { dehydrate, useQuery } from '@tanstack/react-query';
import { Button, ConfigProvider, Divider, Empty, List, Skeleton } from 'antd';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useAuth, withAuth } from 'auth';
import BlogCard from 'components/common/BlogCard';
import SearchFilter from 'components/common/SortFilter';
import { setSize } from 'store/sortFilterSlice';
import { NAV_KEYS, BOOKMARKS_KEYS } from 'constants/reduxKeys';
import { AUTH, GENRE, BLOG } from 'constants/queryKeys';
import { getBookmarks, getProfile } from 'api/auth';
import { queryKeys } from 'utils';
import { getGenre } from 'api/blog';

const { HOME_NAV } = NAV_KEYS;

const { BOOKMARKS } = BOOKMARKS_KEYS;

const Bookmarks = () => {
  const router: NextRouter = useRouter();

  const {
    genre: { [BOOKMARKS]: genre },
    size: { [BOOKMARKS]: size },
    search: { [BOOKMARKS]: search },
  } = useSelector((state: RootState) => state.sortFilter, shallowEqual);

  const dispatch = useDispatch();

  const { authUser } = useAuth();

  const {
    data: blogs,
    isPreviousData,
    isFetchedAfterMount,
  } = useQuery({
    queryFn: () => getBookmarks({ genre, size, search }),
    queryKey: queryKeys(BLOG).list({ genre, size, search }),
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

        <SearchFilter sortFilterKey={BOOKMARKS} isLoading={isPreviousData} />

        {blogs?.count && !isFetchedAfterMount ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className='py-8' avatar round paragraph={{ rows: 3 }} active />
          ))
        ) : (
          <InfiniteScroll
            dataLength={blogs?.result?.length ?? 0}
            next={() => dispatch(setSize({ key: BOOKMARKS, size: 10 }))}
            hasMore={blogs?.result ? blogs?.result?.length < blogs?.count : false}
            loader={<Skeleton avatar round paragraph={{ rows: 2 }} active />}
          >
            <ConfigProvider
              renderEmpty={() => (
                <Empty>
                  <Button
                    className='h-10 uppercase rounded-lg'
                    onClick={() => router.push(HOME_NAV)}
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

  await queryClient.prefetchQuery({
    queryFn: getProfile,
    queryKey: queryKeys(AUTH).details(),
  });

  await queryClient.prefetchQuery({
    queryFn: () => getBookmarks({}),
    queryKey: queryKeys(BLOG).list({ genre: [], size: 20, search: '' }),
  });

  await queryClient.prefetchQuery({
    queryFn: getGenre,
    queryKey: queryKeys(GENRE).lists(),
  });

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  };
});
