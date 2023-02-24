import Head from 'next/head';
import type { GetServerSideProps, GetServerSidePropsContext, NextPage } from 'next';
import { shallowEqual, useSelector, useDispatch } from 'react-redux';
import { DehydratedState, QueryClient, dehydrate, useQuery } from '@tanstack/react-query';
import { Empty as RenderEmpty, Tabs, List, Skeleton, Button, ConfigProvider } from 'antd';
import InfiniteScroll from 'react-infinite-scroll-component';
import { GithubOutlined } from '@ant-design/icons';
import AuthAxios from '../api/AuthAxios';
import BlogAxios from '../api/BlogAxios';
import BlogList from '../components/Blogs/BlogList';
import SortFilter from '../components/Blogs/SortFilter';
import { setPageSize } from '../store/sortFilterSlice';
import { AUTH, GET_ALL_BLOGS, GET_FOLLOWING_BLOGS, GET_GENRE } from '../constants/queryKeys';
import { SORT_TYPE, HOME_KEYS } from '../constants/reduxKeys';
import { useAuth } from '../utils/UserAuth';
import type { IBlogs } from '../interface/blog';

const { HOME, FOLLOWING } = HOME_KEYS;

const { LIKES } = SORT_TYPE;

const Empty: React.FC = () => (
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
    pageSize,
  } = useSelector((state: RootState) => state.sortFilter, shallowEqual);

  const dispatch = useDispatch();

  const authAxios = AuthAxios();

  const blogAxios = BlogAxios();

  const {
    data: allBlogs,
    isPreviousData,
    isFetchedAfterMount,
  } = useQuery({
    queryFn: () => blogAxios.getAllBlog({ sort, genre, pageSize: pageSize[HOME], search }),
    queryKey: [GET_ALL_BLOGS, { genre, sort, pageSize: pageSize[HOME], search }],
    keepPreviousData: true,
  });

  const { data: followingBlogs } = useQuery({
    queryFn: () => authAxios.getFollowingBlogs({ pageSize: pageSize[FOLLOWING] }),
    queryKey: [GET_FOLLOWING_BLOGS, { pageSize: pageSize[FOLLOWING] }],
    keepPreviousData: true,
  });

  const getTabItems = (label: string, key: HOME_KEYS, blogs?: IBlogs) => {
    return {
      key,
      label: <span className='sm:mx-2 mx-auto flex items-center gap-1.5'>{label}</span>,
      children: (
        <div className='w-full pt-3'>
          {key === HOME && <SortFilter sortFilterKey={HOME} isLoading={isPreviousData} hasSort />}

          {blogs?.count && !isFetchedAfterMount ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className='py-8' avatar round paragraph={{ rows: 3 }} active />
            ))
          ) : (
            <InfiniteScroll
              dataLength={blogs?.data.length ?? 0}
              next={() => dispatch(setPageSize({ key, pageSize: 10 }))}
              hasMore={blogs?.data ? blogs?.data.length < blogs?.count : false}
              loader={<Skeleton avatar round paragraph={{ rows: 2 }} active />}
              endMessage={<Empty />}
            >
              <ConfigProvider renderEmpty={() => <></>}>
                <List
                  itemLayout='vertical'
                  dataSource={blogs?.data}
                  renderItem={(blog) => (
                    <BlogList
                      key={blog._id}
                      blog={blog}
                      editable={blog.author._id === authUser?._id}
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
    { key: HOME, label: 'For You', blogs: allBlogs },
    { key: FOLLOWING, label: 'Following', blogs: followingBlogs },
  ].map(({ key, label, blogs }) => getTabItems(label, key, blogs));

  return (
    <div className='w-full flex justify-center'>
      <Head>
        <title>Home | BlogSansar</title>
        <link href='/favicon.ico' rel='icon' />
      </Head>

      <main className='w-full flex flex-col'>
        <header className='text-2xl uppercase pb-2'>Home</header>

        <Tabs className='w-full' defaultActiveKey={HOME} items={items as []} />
      </main>
    </div>
  );
};

export default Home;

export const getServerSideProps: GetServerSideProps = async (
  ctx: GetServerSidePropsContext
): Promise<{
  props: { dehydratedState: DehydratedState };
}> => {
  const queryClient = new QueryClient();

  const authAxios = AuthAxios(ctx.req.headers.cookie);

  const blogAxios = BlogAxios(ctx.req.headers.cookie);

  ctx.res.setHeader('Cache-Control', 'public, s-maxage=86400');

  await queryClient.prefetchQuery({
    queryFn: () => authAxios.auth(),
    queryKey: [AUTH],
  });

  await queryClient.prefetchQuery({
    queryFn: () => blogAxios.getAllBlog({}),
    queryKey: [GET_ALL_BLOGS, { genre: [], sort: LIKES, pageSize: 20, search: '' }],
  });

  await queryClient.prefetchQuery({
    queryFn: () => authAxios.getFollowingBlogs({}),
    queryKey: [GET_FOLLOWING_BLOGS, { pageSize: 20 }],
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
