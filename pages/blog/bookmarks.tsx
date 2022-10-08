import Head from 'next/head';
import { GetServerSideProps, GetServerSidePropsContext, NextPage } from 'next';
import { NextRouter, useRouter } from 'next/router';
import { shallowEqual, useSelector } from 'react-redux';
import { dehydrate, DehydratedState, QueryClient, useQuery } from '@tanstack/react-query';
import { Button, Divider, Empty } from 'antd';
import { isEmpty } from 'lodash';
import { useAuth } from '../../utils/UserAuth';
import AuthAxios from '../../apiAxios/authAxios';
import BlogAxios from '../../apiAxios/blogAxios';
import BlogList from '../../components/Blogs/BlogList';
import SearchFilter from '../../components/Blogs/SortFilter';
import { NAV_KEYS, SORT_FILTER_KEYS } from '../../constants/reduxKeys';
import { AUTH, GET_BOOKMARKS, GET_GENRE } from '../../constants/queryKeys';
import type { RootState } from '../../store';

const { HOME_NAV } = NAV_KEYS;

const { BOOKMARKS_SORT } = SORT_FILTER_KEYS;

const Bookmarks: NextPage = () => {
  const router: NextRouter = useRouter();

  const {
    genre: { [BOOKMARKS_SORT]: genre },
    pageSize: { [BOOKMARKS_SORT]: pageSize },
    search: { [BOOKMARKS_SORT]: search },
  } = useSelector((state: RootState) => state.sortFilter, shallowEqual);

  const { authUser } = useAuth();

  const authAxios = new AuthAxios();

  const { data: blogs, isLoading } = useQuery({
    queryFn: () => authAxios.getBookmarks({ genre, pageSize, search }),
    queryKey: [GET_BOOKMARKS, { genre, pageSize, search }],
  });

  return (
    <div className='w-full flex justify-center'>
      <Head>
        <title>Bookmarks | BlogSansar</title>
        <link href='/favicon.ico' rel='icon' />
      </Head>

      {authUser && (
        <main className='w-full flex flex-col'>
          <header className='w-full text-2xl uppercase self-start'>Bookmarks</header>

          <Divider />

          <SearchFilter sortFilterKey={BOOKMARKS_SORT} isLoading={isLoading} />

          {isEmpty(blogs?.data) ? (
            <Empty>
              <Button className='h-10 uppercase rounded-lg' onClick={() => router.push(HOME_NAV)}>
                Browse Blogs
              </Button>
            </Empty>
          ) : (
            blogs?.data.map((blog) => (
              <BlogList key={blog._id} blog={blog} editable={blog.author._id === authUser._id} />
            ))
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

  const authAxios = new AuthAxios(ctx.req && ctx.req.headers.cookie);

  const blogAxios = new BlogAxios(ctx.req && ctx.req.headers.cookie);

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
    queryFn: () => blogAxios.getGenre(),
    queryKey: [GET_GENRE],
  });

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  };
};
