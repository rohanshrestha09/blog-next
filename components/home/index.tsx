import type { GetServerSideProps, GetServerSidePropsContext } from 'next';
import { useRouter } from 'next/router';
import { Fragment, useEffect } from 'react';
import { NextSeo } from 'next-seo';
import { DehydratedState, QueryClient, dehydrate, useQuery } from '@tanstack/react-query';
import { Empty as RenderEmpty, Tabs, List, Skeleton, Button, ConfigProvider } from 'antd';
import InfiniteScroll from 'react-infinite-scroll-component';
import { GithubOutlined } from '@ant-design/icons';
import BlogCard from 'components/common/BlogCard';
import Filter from 'components/common/Filter';
import { useFilterStore, useModalStore } from 'store/hooks';
import { useAuth } from 'auth';
import { getAllBlogs, getBlogSuggestions, getGenre } from 'request/blog';
import { getFollowingBlogs, getProfile } from 'request/auth';
import { getUserSuggestions } from 'request/user';
import { queryKeys } from 'utils';
import { SORT_TYPE, FILTERS, MODALS } from 'constants/reduxKeys';
import { AUTH, BLOG, FOLLOWING as FOLLOWING_QUERY_KEY, GENRE, USER } from 'constants/queryKeys';
import { Blog } from 'models/blog';

const { LIKE_COUNT } = SORT_TYPE;

const Empty = () => (
  <RenderEmpty className='bg-zinc-900 py-8 mx-0 rounded-lg'>
    <Button
      className='rounded-lg text-white hover:text-white'
      icon={<GithubOutlined />}
      type='primary'
      target='_blank'
      href='https://github.com/rohanshrestha09'
    >
      Visit Github
    </Button>
  </RenderEmpty>
);

const Home = () => {
  const { authUser } = useAuth();

  const { query } = useRouter();

  const { openModal: openLoginModal, closeModal: closeLoginModal } = useModalStore(
    MODALS.LOGIN_MODAL,
  );

  const {
    size,
    sort,
    search,
    genre,
    setSize: setHomeBlogSize,
  } = useFilterStore(FILTERS.HOME_BLOG_FILTER);

  const { size: followingBlogSize, setSize: setFollowingBlogSize } = useFilterStore(
    FILTERS.FOLLOWING_BLOG_FILTER,
  );

  const {
    data: blogs,
    isPreviousData,
    isLoading,
  } = useQuery({
    queryFn: () => getAllBlogs({ sort, genre, size, search }),
    queryKey: queryKeys(BLOG).list({ genre, sort, size, search }),
    keepPreviousData: true,
  });

  const { data: followingBlogs } = useQuery({
    queryFn: () => getFollowingBlogs({ size: followingBlogSize }),
    queryKey: queryKeys(FOLLOWING_QUERY_KEY, BLOG).list({ size: followingBlogSize }),
    keepPreviousData: true,
  });

  useEffect(() => {
    if (query?.fallback === 'true') {
      openLoginModal();
    }

    return () => {
      closeLoginModal();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const getTabItems = (
    label: string,
    key: FILTERS,
    setSize: (size: number) => void,
    blogs?: { data: Blog[]; count: number },
  ) => {
    return {
      key,
      label: <span className='sm:mx-2 mx-auto flex items-center gap-1.5'>{label}</span>,
      children: (
        <div className='w-full pt-3'>
          {key === FILTERS.HOME_BLOG_FILTER && (
            <Filter filterType={FILTERS.HOME_BLOG_FILTER} isLoading={isPreviousData} hasSort />
          )}

          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className='py-8' avatar round paragraph={{ rows: 3 }} active />
            ))
          ) : (
            <InfiniteScroll
              dataLength={blogs?.data?.length ?? 0}
              next={() => setSize(10)}
              hasMore={blogs?.data ? blogs?.data?.length < blogs?.count : false}
              loader={<Skeleton avatar round paragraph={{ rows: 2 }} active />}
              endMessage={<Empty />}
            >
              <ConfigProvider renderEmpty={() => <></>}>
                <List
                  itemLayout='vertical'
                  dataSource={blogs?.data}
                  renderItem={(blog) => (
                    <BlogCard
                      key={blog?.id}
                      blog={blog}
                      editable={blog?.authorId === authUser?.id}
                    />
                  )}
                />
              </ConfigProvider>
            </InfiniteScroll>
          )}
        </div>
      ),
    };
  };

  const items = [
    {
      key: FILTERS.HOME_BLOG_FILTER,
      label: 'For You',
      setSize: setHomeBlogSize,
      blogs: blogs && {
        data: blogs.result,
        count: blogs.count,
      },
    },
    {
      key: FILTERS.FOLLOWING_BLOG_FILTER,
      label: 'Following',
      setSize: setFollowingBlogSize,
      blogs: followingBlogs && {
        data: followingBlogs.result,
        count: followingBlogs.count,
      },
    },
  ].map(({ key, label, setSize, blogs }) => getTabItems(label, key, setSize, blogs));

  return (
    <Fragment>
      <NextSeo noindex nofollow title='Home | Blogsansar' />

      <div className='w-full flex justify-center'>
        <main className='w-full flex flex-col'>
          <header className='text-2xl uppercase pb-2'>Home</header>

          <Tabs className='w-full' defaultActiveKey={FILTERS.HOME_BLOG_FILTER} items={items} />
        </main>
      </div>
    </Fragment>
  );
};

export default Home;

export const getServerSideProps: GetServerSideProps = async (
  ctx: GetServerSidePropsContext,
): Promise<{
  props: { dehydratedState: DehydratedState };
}> => {
  const queryClient = new QueryClient();

  ctx.res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=59');

  const config = { headers: { Cookie: ctx.req.headers.cookie || '' } };

  await queryClient.prefetchQuery({
    queryFn: () => getProfile(config),
    queryKey: queryKeys(AUTH).details(),
  });

  await queryClient.prefetchQuery({
    queryFn: () => getAllBlogs({ genre: [], sort: LIKE_COUNT, size: 20, search: '' }, config),
    queryKey: queryKeys(BLOG).list({ genre: [], sort: LIKE_COUNT, size: 20, search: '' }),
  });

  await queryClient.prefetchQuery({
    queryFn: () => getUserSuggestions({ size: 3 }, config),
    queryKey: queryKeys(USER).list({ size: 3 }),
  });

  await queryClient.prefetchQuery({
    queryFn: () => getBlogSuggestions({ size: 4 }, config),
    queryKey: queryKeys(BLOG).list({ size: 4 }),
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
};
