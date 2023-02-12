import Head from 'next/head';
import { GetServerSidePropsContext, NextPage } from 'next';
import { NextRouter, useRouter } from 'next/router';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { dehydrate, DehydratedState, QueryClient, useQuery } from '@tanstack/react-query';
import { Button, ConfigProvider, Divider, Empty, List, Skeleton } from 'antd';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useAuth } from '../../utils/UserAuth';
import withAuth from '../../utils/auth';
import AuthAxios from '../../api/AuthAxios';
import BlogAxios from '../../api/BlogAxios';
import BlogList from '../../components/Blogs/BlogList';
import SearchFilter from '../../components/Blogs/SortFilter';
import { setPageSize } from '../../store/sortFilterSlice';
import { NAV_KEYS, BOOKMARKS_KEYS } from '../../constants/reduxKeys';
import { AUTH, GET_BOOKMARKS, GET_GENRE } from '../../constants/queryKeys';

const { HOME_NAV } = NAV_KEYS;

const { BOOKMARKS } = BOOKMARKS_KEYS;

const Bookmarks: NextPage = () => {
  const router: NextRouter = useRouter();

  const {
    genre: { [BOOKMARKS]: genre },
    pageSize: { [BOOKMARKS]: pageSize },
    search: { [BOOKMARKS]: search },
  } = useSelector((state: RootState) => state.sortFilter, shallowEqual);

  const dispatch = useDispatch();

  const { authUser } = useAuth();

  const authAxios = AuthAxios();

  const {
    data: blogs,
    isPreviousData,
    isLoading,
  } = useQuery({
    queryFn: () => authAxios.getBookmarks({ genre, pageSize, search }),
    queryKey: [GET_BOOKMARKS, { genre, pageSize, search }],
    keepPreviousData: true,
  });

  return (
    <div className='w-full flex justify-center'>
      <Head>
        <title>Bookmarks | BlogSansar</title>
        <link href='/favicon.ico' rel='icon' />
      </Head>

      {authUser && (
        <main className='w-full flex flex-col'>
          <header className='w-full text-2xl uppercase'>Bookmarks</header>

          <Divider />

          <SearchFilter sortFilterKey={BOOKMARKS} isLoading={isPreviousData} />

          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className='py-8' avatar round paragraph={{ rows: 3 }} active />
            ))
          ) : (
            <InfiniteScroll
              dataLength={blogs?.data.length ?? 0}
              next={() => dispatch(setPageSize({ key: BOOKMARKS, pageSize: 10 }))}
              hasMore={blogs?.data ? blogs?.data.length < blogs?.count : false}
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
                  dataSource={blogs?.data}
                  renderItem={(blog) => (
                    <BlogList
                      key={blog._id}
                      blog={blog}
                      editable={blog.author._id === authUser._id}
                    />
                  )}
                />
              </ConfigProvider>
            </InfiniteScroll>
          )}
        </main>
      )}
    </div>
  );
};

export default Bookmarks;

export const getServerSideProps = withAuth(
  async (
    ctx: GetServerSidePropsContext
  ): Promise<{
    props: { dehydratedState: DehydratedState };
  }> => {
    const queryClient = new QueryClient();

    const authAxios = AuthAxios(ctx.req.headers.cookie);

    const blogAxios = BlogAxios(ctx.req.headers.cookie);

    ctx.res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=59');

    await queryClient.prefetchQuery({
      queryFn: () => authAxios.auth(),
      queryKey: [AUTH],
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
