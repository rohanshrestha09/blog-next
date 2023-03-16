import Head from 'next/head';
import { NextRouter, useRouter } from 'next/router';
import { GetServerSideProps, GetServerSidePropsContext, NextPage } from 'next';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { dehydrate, QueryClient, DehydratedState, useQuery } from '@tanstack/react-query';
import { Divider, List, PageHeader, Skeleton } from 'antd';
import InfiniteScroll from 'react-infinite-scroll-component';
import { capitalize } from 'lodash';
import { useAuth } from '../../utils/UserAuth';
import BlogAxios from '../../api/BlogAxios';
import AuthAxios from '../../api/AuthAxios';
import BlogList from '../../components/Blogs/BlogList';
import { setSize } from '../../store/sortFilterSlice';
import { AUTH, GET_ALL_BLOGS, GET_GENRE } from '../../constants/queryKeys';
import { HOME_KEYS } from '../../constants/reduxKeys';

const { GENERIC_BLOGS } = HOME_KEYS;

const GenericBlogs: NextPage = () => {
  const {
    query: { genre },
    back,
  }: NextRouter = useRouter();

  const dispatch = useDispatch();

  const {
    size: { [GENERIC_BLOGS]: size },
  } = useSelector((state: RootState) => state.sortFilter, shallowEqual);

  const { authUser } = useAuth();

  const blogAxios = BlogAxios();

  const { data: blogs, isFetchedAfterMount } = useQuery({
    queryFn: () => blogAxios.getAllBlog({ genre: [capitalize(String(genre))], size }),
    queryKey: [GET_ALL_BLOGS, { genre: [capitalize(String(genre))], size }],
  });

  return (
    <div className='w-full flex justify-center'>
      <Head>
        <title>{`Blog / ${capitalize(genre as string)}`}</title>
        <link href='/favicon.ico' rel='icon' />
      </Head>

      <main className='w-full flex flex-col'>
        <PageHeader
          className='pt-0 px-0'
          onBack={() => back()}
          title={<header className='font-light text-2xl uppercase'>{genre}</header>}
          footer={<Divider className='my-0' />}
        />

        <div className='w-full pt-3'>
          {blogs?.count && !isFetchedAfterMount ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className='py-8' avatar round paragraph={{ rows: 3 }} active />
            ))
          ) : (
            <InfiniteScroll
              dataLength={blogs?.data.length ?? 0}
              next={() => dispatch(setSize({ key: GENERIC_BLOGS, size: 10 }))}
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
                    editable={blog.author._id === authUser?._id}
                  />
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
  ctx: GetServerSidePropsContext
): Promise<{
  props: { dehydratedState: DehydratedState };
}> => {
  const queryClient = new QueryClient();

  const blogAxios = BlogAxios(ctx.req.headers.cookie);

  const authAxios = AuthAxios(ctx.req.headers.cookie);

  ctx.res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=59');

  await queryClient.prefetchQuery({
    queryFn: () => authAxios.auth(),
    queryKey: [AUTH],
  });

  await queryClient.prefetchQuery({
    queryFn: () => blogAxios.getAllBlog({ genre: [capitalize(String(ctx.params?.genre))] }),
    queryKey: [GET_ALL_BLOGS, { genre: [capitalize(String(ctx.params?.genre))], size: 20 }],
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
