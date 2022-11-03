import Head from 'next/head';
import type { GetServerSideProps, GetServerSidePropsContext, NextPage } from 'next';
import { shallowEqual, useSelector } from 'react-redux';
import { DehydratedState, QueryClient, dehydrate, useQuery } from '@tanstack/react-query';
import { isEmpty } from 'lodash';
import { Empty, Tabs } from 'antd';
import AuthAxios from '../apiAxios/authAxios';
import BlogAxios from '../apiAxios/blogAxios';
import UserAxios from '../apiAxios/userAxios';
import BlogList from '../components/Blogs/BlogList';
import SortFilter from '../components/Blogs/SortFilter';
import {
  AUTH,
  GET_ALL_BLOGS,
  GET_BLOG_SUGGESTIONS,
  GET_FOLLOWING_BLOGS,
  GET_GENRE,
  GET_USER_SUGGESTIONS,
} from '../constants/queryKeys';
import { SORT_TYPE, HOME_KEYS } from '../constants/reduxKeys';
import { useAuth } from '../utils/UserAuth';
import type { IBlogs } from '../interface/blog';
import type { RootState } from '../store';

const { HOME, FOLLOWING } = HOME_KEYS;

const { LIKES } = SORT_TYPE;

const Home: NextPage = () => {
  const { authUser } = useAuth();

  const {
    sort: { [HOME]: sort },
    search: { [HOME]: search },
    genre: { [HOME]: genre },
    pageSize,
  } = useSelector((state: RootState) => state.sortFilter, shallowEqual);

  const authAxios = new AuthAxios();

  const blogAxios = new BlogAxios();

  const { data: allBlogs, isLoading } = useQuery({
    queryFn: () => blogAxios.getAllBlog({ sort, genre, pageSize: pageSize[HOME], search }),
    queryKey: [GET_ALL_BLOGS, { genre, sort, pageSize: pageSize[HOME], search }],
  });

  const { data: followingBlogs } = useQuery({
    queryFn: () => authAxios.getFollowingBlogs({ pageSize: pageSize[FOLLOWING] }),
    queryKey: [GET_FOLLOWING_BLOGS, { pageSize: pageSize[FOLLOWING] }],
  });

  const getTabItems = (label: string, key: HOME_KEYS, blogs?: IBlogs) => {
    return {
      key,
      label: <span className='sm:mx-2 mx-auto flex items-center gap-1.5'>{label}</span>,
      children: (
        <div className='w-full pt-3'>
          {key === HOME && <SortFilter sortFilterKey={HOME} isLoading={isLoading} hasSort />}

          {isEmpty(blogs?.data) ? (
            <Empty />
          ) : (
            blogs?.data.map((blog) => (
              <BlogList key={blog._id} blog={blog} editable={blog.author._id === authUser?._id} />
            ))
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

  const authAxios = new AuthAxios(ctx.req.headers.cookie);

  const blogAxios = new BlogAxios(ctx.req.headers.cookie);

  const userAxios = new UserAxios(ctx.req.headers.cookie);

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
