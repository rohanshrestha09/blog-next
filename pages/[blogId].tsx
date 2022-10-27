import Head from 'next/head';
import { NextRouter, useRouter } from 'next/router';
import { GetServerSideProps, GetServerSidePropsContext, NextPage } from 'next';
import {
  dehydrate,
  DehydratedState,
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import moment from 'moment';
import { Divider, Image, Tooltip } from 'antd';
import parse from 'html-react-parser';
import { BsBookmark, BsBookmarkFill, BsHeart, BsHeartFill } from 'react-icons/bs';
import { VscComment } from 'react-icons/vsc';
import { useAuth } from '../utils/UserAuth';
import BlogAxios from '../apiAxios/blogAxios';
import UserAxios from '../apiAxios/userAxios';
import AuthAxios from '../apiAxios/authAxios';
import BlogList from '../components/Blogs/BlogList';
import { openModal } from '../store/modalSlice';
import { errorNotification, successNotification } from '../utils/notification';
import {
  AUTH,
  GET_BLOG,
  GET_BLOG_SUGGESTIONS,
  GET_COMMENTS,
  GET_GENRE,
  GET_LIKERS,
  GET_USER_BLOGS,
  GET_USER_SUGGESTIONS,
} from '../constants/queryKeys';
import { MODAL_KEYS } from '../constants/reduxKeys';
import type { IBlogData } from '../interface/blog';
import { useDispatch } from 'react-redux';
import Discussions from '../components/Blogs/Discussions';
import Likes from '../components/Blogs/Likes';

const { DISCUSSIONS_MODAL, LIKERS_MODAL } = MODAL_KEYS;

const Blog: NextPage = () => {
  const {
    query: { blogId },
    push,
  }: NextRouter = useRouter();

  const queryClient = useQueryClient();

  const dispatch = useDispatch();

  const blogAxios = new BlogAxios();

  const userAxios = new UserAxios();

  const { authUser } = useAuth();

  const { data: blog, refetch: refetchBlog } = useQuery({
    queryFn: () => blogAxios.getBlog(String(blogId)),
    queryKey: [GET_BLOG, blogId],
  });

  const { data: userBlogs } = useQuery({
    queryFn: () => userAxios.getUserBlogs({ user: String(blog?.author._id), pageSize: 4 }),
    queryKey: [GET_USER_BLOGS, blog?.author._id, { pageSize: 4 }],
    enabled: !!blog,
  });

  const handleBookmark = useMutation(
    ({ id, shouldBookmark }: { id: string; shouldBookmark: boolean }) =>
      blogAxios.bookmarkBlog({ id, shouldBookmark }),
    {
      onSuccess: (res) => {
        successNotification(res.message);
        queryClient.refetchQueries([AUTH]);
      },
      onError: (err: Error | any) => errorNotification(err),
    }
  );

  const handleLike = useMutation(
    ({ id, shouldLike }: { id: string; shouldLike: boolean }) =>
      blogAxios.likeBlog({ id, shouldLike }),
    {
      onSuccess: (res) => {
        successNotification(res.message);
        refetchBlog();
        queryClient.refetchQueries([GET_LIKERS]);
      },
      onError: (err: Error | any) => errorNotification(err),
    }
  );

  return (
    <div className='w-full flex justify-center'>
      <Head>
        <title>{blog && blog.title}</title>
        <link href='/favicon.ico' rel='icon' />
      </Head>

      {blog && (
        <main className='w-full flex flex-col gap-9 py-4' style={{ overflowWrap: 'anywhere' }}>
          <div className='flex items-center gap-4 relative'>
            <Image
              alt=''
              className='min-w-[50px] rounded-full object-cover'
              height={50}
              width={50}
              src={
                blog.author.image ||
                'data:image/png;base64,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'
              }
            />

            <span>
              <p
                className='text-base text-white cursor-pointer'
                style={{ overflowWrap: 'anywhere' }}
                onClick={() => push(`/profile/${blog.author._id}`)}
              >
                {blog.author.fullname}
              </p>

              <p>Posted on {moment(blog.createdAt).format('ll')}</p>
            </span>

            <span className='absolute right-0 flex gap-4 items-center'>
              {authUser?.bookmarks.includes(blog._id as never) ? (
                <Tooltip title='Unbookmark' placement='left'>
                  <BsBookmarkFill
                    className='cursor-pointer transition-all hover:text-zinc-400'
                    size='18'
                    onClick={() =>
                      handleBookmark.mutate({
                        id: String(blogId),
                        shouldBookmark: !authUser?.bookmarks.includes(blog._id as never),
                      })
                    }
                  />
                </Tooltip>
              ) : (
                <Tooltip title='Bookmark' placement='left'>
                  <BsBookmark
                    className='cursor-pointer transition-all hover:text-zinc-400'
                    size='18'
                    onClick={() =>
                      handleBookmark.mutate({
                        id: String(blogId),
                        shouldBookmark: !authUser?.bookmarks.includes(blog._id as never),
                      })
                    }
                  />
                </Tooltip>
              )}
            </span>
          </div>

          <p className='text-3xl text-white'>{blog.title}</p>

          {blog.image && <Image src={blog.image} />}

          <div className='w-full text-base'>{parse(blog.content)}</div>

          <div className='w-full'>
            <span className='flex justify-between'>
              <p
                className='text-[#1890ff] text-base cursor-pointer hover:text-blue-600'
                onClick={() => dispatch(openModal({ key: LIKERS_MODAL }))}
              >
                View {blog.likesCount} Likes
              </p>

              <p
                className='text-[#1890ff] text-base cursor-pointer hover:text-blue-600'
                onClick={() => dispatch(openModal({ key: DISCUSSIONS_MODAL }))}
              >
                {blog.commentsCount} Discussions
              </p>
            </span>

            <Divider className='mt-4 mb-2' />

            <span className='flex items-center [&>*]:py-2 [&>*]:basis-1/2 [&>*]:rounded-lg [&>*]:text-base [&>*]:cursor-pointer [&>*]:transition-all hover:[&>*]:bg-zinc-800'>
              <span
                className={`flex items-center justify-center gap-2 ${
                  blog.likers.includes(authUser?._id as never) && 'text-blue-500'
                }`}
                onClick={() =>
                  handleLike.mutate({
                    id: String(blogId),
                    shouldLike: !blog.likers.includes(authUser?._id as never),
                  })
                }
              >
                {blog.likers.includes(authUser?._id as never) ? <BsHeartFill /> : <BsHeart />} Like
              </span>

              <span
                className='flex items-center justify-center gap-2'
                onClick={() => dispatch(openModal({ key: DISCUSSIONS_MODAL }))}
              >
                <VscComment size='17' /> Discussions
              </span>
            </span>

            <Divider className='mt-2' />

            <header className='text-2xl pb-4 uppercase'>More from {blog.author.fullname}</header>

            {userBlogs &&
              userBlogs.data.map((blog) => (
                <BlogList key={blog._id} blog={blog} editable={blog.author._id === authUser?._id} />
              ))}
          </div>

          <Likes />

          <Discussions />
        </main>
      )}
    </div>
  );
};

export default Blog;

export const getServerSideProps: GetServerSideProps = async (
  ctx: GetServerSidePropsContext
): Promise<{
  props: { dehydratedState: DehydratedState };
}> => {
  const queryClient = new QueryClient();

  const blogAxios = new BlogAxios(ctx.req.headers.cookie);

  const userAxios = new UserAxios(ctx.req.headers.cookie);

  const authAxios = new AuthAxios(ctx.req.headers.cookie);

  ctx.res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=59');

  await queryClient.prefetchQuery({
    queryFn: () => authAxios.auth(),
    queryKey: [AUTH],
  });

  await queryClient.prefetchQuery({
    queryFn: () => blogAxios.getBlog(String(ctx.params?.blogId)),
    queryKey: [GET_BLOG, ctx.params?.blogId],
  });

  const blog = queryClient.getQueryData([GET_BLOG, ctx.params?.blogId]) as IBlogData;

  await queryClient.prefetchQuery({
    queryFn: () => userAxios.getUserBlogs({ user: String(blog?.author._id), pageSize: 4 }),
    queryKey: [GET_USER_BLOGS, blog?.author._id, { pageSize: 4 }],
  });

  await queryClient.prefetchQuery({
    queryFn: () => blogAxios.getLikers({ id: String(ctx.params?.blogId), pageSize: 20 }),
    queryKey: [GET_LIKERS, ctx.params?.blogId, { pageSize: 20 }],
  });

  await queryClient.prefetchQuery({
    queryFn: () => blogAxios.getComments({ id: String(ctx.params?.blogId), pageSize: 20 }),
    queryKey: [GET_COMMENTS, ctx.params?.blogId, { pageSize: 20 }],
  });

  await queryClient.prefetchQuery({
    queryFn: () => userAxios.getUserSuggestions({ pageSize: 4 }),
    queryKey: [GET_USER_SUGGESTIONS, { pageSize: 4 }],
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
