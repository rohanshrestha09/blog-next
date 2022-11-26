import Head from 'next/head';
import { GetServerSideProps, GetServerSidePropsContext, NextPage } from 'next';
import { NextRouter, useRouter } from 'next/router';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { dehydrate, DehydratedState, QueryClient, useQuery } from '@tanstack/react-query';
import { Button, Divider, Empty, List, Skeleton } from 'antd';
import { isEmpty } from 'lodash';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useAuth } from '../../utils/UserAuth';
import AuthAxios from '../../api/AuthAxios';
import BlogAxios from '../../api/BlogAxios';
import UserAxios from '../../api/UserAxios';
import BlogList from '../../components/Blogs/BlogList';
import SearchFilter from '../../components/Blogs/SortFilter';
import { setPageSize } from '../../store/sortFilterSlice';
import { NAV_KEYS, BOOKMARKS_KEYS } from '../../constants/reduxKeys';
import {
  AUTH,
  GET_BLOG_SUGGESTIONS,
  GET_BOOKMARKS,
  GET_GENRE,
  GET_USER_SUGGESTIONS,
} from '../../constants/queryKeys';

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

  const authAxios = new AuthAxios();

  const { data: blogs, isLoading } = useQuery({
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

          <SearchFilter sortFilterKey={BOOKMARKS} isLoading={isLoading} />

          {isEmpty(blogs?.data) ? (
            <Empty>
              <Button className='h-10 uppercase rounded-lg' onClick={() => router.push(HOME_NAV)}>
                Browse Blogs
              </Button>
            </Empty>
          ) : (
            <InfiniteScroll
              dataLength={blogs?.data.length ?? 0}
              next={() => dispatch(setPageSize({ key: BOOKMARKS, pageSize: 10 }))}
              hasMore={blogs?.data ? blogs?.data.length < blogs?.count : false}
              loader={<Skeleton avatar round paragraph={{ rows: 2 }} active />}
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
            </InfiniteScroll>
          )}
        </main>
      )}
    </div>
  );
};

export default Bookmarks;

export const getServerSideProps: GetServerSideProps = async (
  ctx: GetServerSidePropsContext
): Promise<{
  props: { dehydratedState: DehydratedState };
}> => {
  const queryClient = new QueryClient();

  const authAxios = new AuthAxios(ctx.req.headers.cookie);

  const userAxios = new UserAxios(ctx.req.headers.cookie);

  const blogAxios = new BlogAxios(ctx.req.headers.cookie);

  ctx.res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=59');

  await queryClient.prefetchQuery({
    queryFn: () => authAxios.auth(),
    queryKey: [AUTH],
  });

  await queryClient.prefetchQuery({
    queryFn: () => authAxios.getBookmarks({}),
    queryKey: [GET_BOOKMARKS, { genre: [], pageSize: 20, search: '' }],
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
