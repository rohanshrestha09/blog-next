import Head from 'next/head';
import { useRouter } from 'next/router';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { dehydrate, QueryClient, DehydratedState, useQuery } from '@tanstack/react-query';
import { Divider, List, PageHeader, Skeleton } from 'antd';
import InfiniteScroll from 'react-infinite-scroll-component';
import { capitalize } from 'lodash';
import { useAuth } from 'auth';
import BlogCard from 'components/common/BlogCard';
import { setSize } from 'store/sortFilterSlice';
import { getProfile } from 'api/auth';
import { getAllBlogs, getGenre } from 'api/blog';
import { queryKeys } from 'utils';
import { AUTH, BLOG, GENRE } from 'constants/queryKeys';
import { HOME_KEYS } from 'constants/reduxKeys';
import { Genre } from 'interface/models';

const { GENERIC_BLOGS } = HOME_KEYS;

const GenericBlogs = () => {
  const { query, back } = useRouter();

  const dispatch = useDispatch();

  const {
    size: { [GENERIC_BLOGS]: size },
  } = useSelector((state: RootState) => state.sortFilter, shallowEqual);

  const { authUser } = useAuth();

  const { data: blogs, isFetchedAfterMount } = useQuery({
    queryFn: () => getAllBlogs({ genre: [capitalize(String(query?.genre)) as Genre], size }),
    queryKey: queryKeys(BLOG).list({ genre: [capitalize(String(query?.genre))], size }),
  });

  return (
    <div className='w-full flex justify-center'>
      <Head>
        <title>{`Blog / ${capitalize(query?.genre as string)}`}</title>
        <link href='/favicon.ico' rel='icon' />
      </Head>

      <main className='w-full flex flex-col'>
        <PageHeader
          className='pt-0 px-0'
          onBack={() => back()}
          title={<header className='font-light text-2xl uppercase'>{query?.genre}</header>}
          footer={<Divider className='my-0' />}
        />

        <div className='w-full pt-3'>
          {blogs?.count && !isFetchedAfterMount ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className='py-8' avatar round paragraph={{ rows: 3 }} active />
            ))
          ) : (
            <InfiniteScroll
              dataLength={blogs?.result?.length ?? 0}
              next={() => dispatch(setSize({ key: GENERIC_BLOGS, size: 10 }))}
              hasMore={blogs?.result ? blogs?.result?.length < blogs?.count : false}
              loader={<Skeleton avatar round paragraph={{ rows: 2 }} active />}
            >
              <List
                itemLayout='vertical'
                dataSource={blogs?.result}
                renderItem={(blog) => (
                  <BlogCard key={blog?.id} blog={blog} editable={blog?.authorId === authUser?.id} />
                )}
              />
            </InfiniteScroll>
          )}
        </div>
      </main>
    </div>
  );
};

export default GenericBlogs;

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
    queryFn: () => getAllBlogs({ genre: [capitalize(String(ctx.params?.genre)) as Genre] }, config),
    queryKey: queryKeys(BLOG).list({ genre: [capitalize(String(ctx.params?.genre))], size: 20 }),
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
