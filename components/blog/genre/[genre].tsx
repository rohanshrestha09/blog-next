import { useRouter } from 'next/router';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import { Fragment } from 'react';
import { NextSeo } from 'next-seo';
import { dehydrate, QueryClient, DehydratedState, useQuery } from '@tanstack/react-query';
import { Divider, List, PageHeader, Skeleton } from 'antd';
import InfiniteScroll from 'react-infinite-scroll-component';
import { capitalize } from 'lodash';
import { useAuth } from 'auth';
import BlogCard from 'components/common/BlogCard';
import { useFilterStore } from 'store/hooks';
import { getProfile } from 'request/auth';
import { getAllBlogs, getBlogSuggestions, getGenre } from 'request/blog';
import { getUserSuggestions } from 'request/user';
import { queryKeys } from 'utils';
import { AUTH, BLOG, GENRE, USER } from 'constants/queryKeys';
import { FILTERS } from 'constants/reduxKeys';
import { Genre } from 'interface/models';

const GenericBlogs = () => {
  const { query, back } = useRouter();

  const { size, setSize } = useFilterStore(FILTERS.GENERIC_BLOG_FILTER);

  const { authUser } = useAuth();

  const { data: blogs, isLoading } = useQuery({
    queryFn: () => getAllBlogs({ genre: [capitalize(String(query?.genre)) as Genre], size }),
    queryKey: queryKeys(BLOG).list({ genre: [capitalize(String(query?.genre))], size }),
  });

  return (
    <Fragment>
      <NextSeo noindex nofollow title={`Blog / ${capitalize(query?.genre as string)}`} />

      <main className='w-full flex flex-col'>
        <PageHeader
          className='pt-0 px-0'
          onBack={() => back()}
          title={<header className='font-light text-2xl uppercase'>{query?.genre}</header>}
          footer={<Divider className='my-0' />}
        />

        <div className='w-full pt-3'>
          {isLoading ? (
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
    </Fragment>
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
    queryFn: () =>
      getAllBlogs({ genre: [capitalize(String(ctx.params?.genre)) as Genre], size: 20 }, config),
    queryKey: queryKeys(BLOG).list({ genre: [capitalize(String(ctx.params?.genre))], size: 20 }),
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
