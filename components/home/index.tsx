import Head from 'next/head';
import type { GetServerSideProps, GetServerSidePropsContext, NextPage } from 'next';
import { shallowEqual, useSelector, useDispatch } from 'react-redux';
import { DehydratedState, QueryClient, dehydrate, useQuery } from '@tanstack/react-query';
import { Empty as RenderEmpty, Tabs, List, Skeleton, Button, ConfigProvider } from 'antd';
import InfiniteScroll from 'react-infinite-scroll-component';
import { GithubOutlined } from '@ant-design/icons';
import BlogCard from 'components/common/BlogCard';
import SortFilter from 'components/common/SortFilter';
import { setSize } from 'store/sortFilterSlice';
import { AUTH, BLOG, GENRE, USER } from 'constants/queryKeys';
import { SORT_TYPE, HOME_KEYS } from 'constants/reduxKeys';
import { useAuth } from 'auth';
import { getFollowingBlogs, getProfile } from 'api/auth';
import { queryKeys } from 'utils';
import { getAllBlogs, getGenre } from 'api/blog';
import { getUserSuggestions } from 'api/user';
import { Blog } from 'interface/models';
import { isEmpty } from 'lodash';

const { HOME, FOLLOWING } = HOME_KEYS;

const { LIKE_COUNT } = SORT_TYPE;

const Empty = () => (
  <RenderEmpty className='bg-zinc-900 py-8 mx-0 rounded-lg'>
    <Button
      className='rounded-lg'
      icon={<GithubOutlined />}
      type='primary'
      target='_blank'
      href='https://github.com/rohanshrestha09'
    >
      Visit Github
    </Button>
  </RenderEmpty>
);

const Home: NextPage = () => {
  const { authUser } = useAuth();

  const {
    sort: { [HOME]: sort },
    search: { [HOME]: search },
    genre: { [HOME]: genre },
    size,
  } = useSelector((state: RootState) => state.sortFilter, shallowEqual);

  const dispatch = useDispatch();
  const {
    data: blogs,
    isPreviousData,
    isFetchedAfterMount,
  } = useQuery({
    queryFn: () => getAllBlogs({ sort, genre, size: size[HOME], search }),
    queryKey: queryKeys(BLOG).list({ genre, sort, size: size[HOME], search }),
    keepPreviousData: true,
  });

  const { data: followingBlogs } = useQuery({
    queryFn: () => getFollowingBlogs({ size: size[FOLLOWING] }),
    queryKey: queryKeys(BLOG).list({ size: size[FOLLOWING] }),
    keepPreviousData: true,
  });

  const getTabItems = (label: string, key: HOME_KEYS, blogs?: { data: Blog[]; count: number }) => {
    return {
      key,
      label: <span className='sm:mx-2 mx-auto flex items-center gap-1.5'>{label}</span>,
      children: (
        <div className='w-full pt-3'>
          {key === HOME && <SortFilter sortFilterKey={HOME} isLoading={isPreviousData} hasSort />}

          {!isEmpty(blogs?.data) && !isFetchedAfterMount ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className='py-8' avatar round paragraph={{ rows: 3 }} active />
            ))
          ) : (
            <InfiniteScroll
              dataLength={blogs?.data?.length ?? 0}
              next={() => dispatch(setSize({ key, size: 10 }))}
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
      key: HOME,
      label: 'For You',
      blogs: blogs && {
        data: blogs.result,
        count: blogs.count,
      },
    },
    {
      key: FOLLOWING,
      label: 'Following',
      blogs: followingBlogs && {
        data: followingBlogs.result,
        count: followingBlogs.count,
      },
    },
  ].map(({ key, label, blogs }) => getTabItems(label, key, blogs));

  return (
    <div className='w-full flex justify-center'>
      <Head>
        <title>Home | BlogSansar</title>
        <link href='/favicon.ico' rel='icon' />
      </Head>

      <main className='w-full flex flex-col'>
        <header className='text-2xl uppercase pb-2'>Home</header>

        <Tabs className='w-full' defaultActiveKey={HOME} items={items} />
      </main>
    </div>
  );
};

export default Home;

export const getServerSideProps: GetServerSideProps = async (
  ctx: GetServerSidePropsContext,
): Promise<{
  props: { dehydratedState: DehydratedState };
}> => {
  const queryClient = new QueryClient();
  ctx.res.setHeader('Cache-Control', 'public, s-maxage=86400');

  await queryClient.prefetchQuery({
    queryFn: getProfile,
    queryKey: queryKeys(AUTH).details(),
  });

  await queryClient.prefetchQuery({
    queryFn: () => getAllBlogs({}),
    queryKey: queryKeys(BLOG).list({ genre: [], sort: LIKE_COUNT, size: 20, search: '' }),
  });

  await queryClient.prefetchQuery({
    queryFn: () => getFollowingBlogs({}),
    queryKey: queryKeys(BLOG).list({ size: 20 }),
  });

  await queryClient.prefetchQuery({
    queryFn: () => getUserSuggestions({}),
    queryKey: queryKeys(USER).list({ size: 20, search: '' }),
  });

  await queryClient.prefetchQuery({
    queryFn: getGenre,
    queryKey: queryKeys(GENRE).details(),
  });

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  };
};
