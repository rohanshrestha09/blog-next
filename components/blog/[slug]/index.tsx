import { useRouter } from 'next/router';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import { NextSeo } from 'next-seo';
import { Fragment } from 'react';
import {
  dehydrate,
  DehydratedState,
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import moment from 'moment';
import { Divider, Image, Skeleton, Tooltip, Switch, Modal, Empty } from 'antd';
import parse from 'html-react-parser';
import InfiniteScroll from 'react-infinite-scroll-component';
import { isEmpty } from 'lodash';
import he from 'he';
import { BsBookmark, BsBookmarkFill, BsHeart, BsHeartFill } from 'react-icons/bs';
import { VscComment } from 'react-icons/vsc';
import { useAuth } from 'auth';
import BlogCard from 'components/common/BlogCard';
import UserSkeleton from 'components/common/UserSkeleton';
import { DiscussionForm } from '../components/DiscussionForm';
import { DiscussionList } from '../components/DiscussionList';
import { errorNotification, successNotification } from 'utils/notification';
import { queryKeys } from 'utils';
import { getProfile } from 'request/auth';
import { getUserBlogs } from 'request/user';
import {
  bookmarkBlog,
  createComment,
  getBlog,
  getComments,
  getGenre,
  getLikes,
  likeBlog,
  unbookmarkBlog,
  unlikeBlog,
} from 'request/blog';
import { useModalStore, useFilterStore, useReadingModeStore } from 'store/hooks';
import { AUTH, BLOG, COMMENT, GENRE, USER } from 'constants/queryKeys';
import { FILTERS, MODALS } from 'constants/reduxKeys';
import { Blog } from 'interface/models';

const Blog = () => {
  const { query, push } = useRouter();

  const queryClient = useQueryClient();

  const { authUser } = useAuth();

  const { isReadingMode, turnOnReadingMode, turnOffReadingMode } = useReadingModeStore();

  const {
    isOpen: isDiscussionModalOpen,
    openModal: openDiscussionModal,
    closeModal: closeDiscussionModal,
  } = useModalStore(MODALS.DISCUSSION_MODAL);

  const {
    isOpen: isLikeModalOpen,
    openModal: openLikeModal,
    closeModal: closeLikeModal,
  } = useModalStore(MODALS.LIKE_MODAL);

  const { size: likeSize, setSize: setCommentSize } = useFilterStore(FILTERS.LIKE_FILTER);

  const { size: commentSize } = useFilterStore(FILTERS.COMMENT_FILTER);

  const { data: blog } = useQuery({
    queryFn: () => getBlog(String(query?.slug)),
    queryKey: queryKeys(BLOG).detail(String(query?.slug)),
    enabled: !!query?.slug,
  });

  const { data: likers } = useQuery({
    queryFn: () => getLikes({ slug: String(query?.slug), size: likeSize }),
    queryKey: queryKeys(USER).list({ slug: String(query?.slug), size: likeSize }),
    enabled: !!query?.slug,
  });

  const { data: comments } = useQuery({
    queryFn: () => getComments({ slug: String(query?.slug), size: commentSize }),
    queryKey: queryKeys(COMMENT).list({ slug: String(query?.slug), size: commentSize }),
    keepPreviousData: true,
  });

  const { data: userBlogs, isFetchedAfterMount: isUserBlogFetchedAfterMount } = useQuery({
    queryFn: () => (blog?.authorId ? getUserBlogs({ id: blog?.authorId, size: 4 }) : undefined),
    queryKey: queryKeys(USER, BLOG).list({ id: blog?.authorId, size: 4 }),
    enabled: !!blog,
  });

  const handleBookmark = useMutation(bookmarkBlog, {
    onSuccess: (res) => {
      successNotification(res.message);
      queryClient.refetchQueries(queryKeys(BLOG).detail(query?.slug as string));
    },
    onError: errorNotification,
  });

  const handleUnbookmark = useMutation(unbookmarkBlog, {
    onSuccess: (res) => {
      successNotification(res.message);
      queryClient.refetchQueries(queryKeys(BLOG).detail(query?.slug as string));
    },
    onError: errorNotification,
  });

  const handleLike = useMutation(likeBlog, {
    onSuccess: (res) => {
      successNotification(res.message);
      queryClient.refetchQueries(queryKeys(BLOG).detail(query?.slug as string));
      queryClient.refetchQueries(queryKeys(USER).list({ slug: query?.slug, size: 20 }));
    },
    onError: errorNotification,
  });

  const handleUnlike = useMutation(unlikeBlog, {
    onSuccess: (res) => {
      successNotification(res.message);
      queryClient.refetchQueries(queryKeys(BLOG).detail(query?.slug as string));
      queryClient.refetchQueries(queryKeys(USER).list({ slug: query?.slug, size: 20 }));
    },
    onError: errorNotification,
  });

  const handleCreateComment = useMutation(createComment, {
    onSuccess: (res) => {
      successNotification(res.message);
      queryClient.refetchQueries(
        queryKeys(COMMENT).list({ slug: String(query?.slug), size: commentSize }),
      );
      queryClient.refetchQueries(queryKeys(BLOG).detail(query?.slug as string));
    },
    onError: errorNotification,
  });

  return (
    <Fragment>
      <NextSeo
        title={blog?.title}
        description={he.decode(blog?.content?.replace(/<[^>]+>/g, '') || '')}
        openGraph={{
          type: 'article',
          url: `${process.env.NEXT_PUBLIC_BASE_URL}/blog/${query?.slug}`,
          title: blog?.title,
          description: he.decode(blog?.content?.replace(/<[^>]+>/g, '') || ''),
          article: {
            publishedTime: blog?.createdAt?.toString(),
            modifiedTime: blog?.updatedAt?.toString(),
            authors: [blog?.author?.name || 'BlogSansar', `${blog?.author?.website}`],
            tags: blog?.genre,
          },
          images: [
            {
              url: `${blog?.image}`,
              alt: blog?.title,
            },
          ],
        }}
      />

      <main className='w-full flex flex-col gap-9 py-4' style={{ overflowWrap: 'anywhere' }}>
        <div className='flex items-center gap-4 relative'>
          <Image
            alt=''
            className='min-w-[50px] rounded-full object-cover'
            height={50}
            width={50}
            src={
              blog?.author?.image ||
              'data:image/png;base64,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'
            }
          />

          <span>
            <p
              className='text-base text-white cursor-pointer'
              style={{ overflowWrap: 'anywhere' }}
              onClick={() => push(`/profile/${blog?.authorId}`)}
            >
              {blog?.author?.name}
            </p>

            <p>Posted on {moment(blog?.createdAt).format('ll')}</p>
          </span>

          <span className='absolute right-0 flex gap-4 items-center'>
            {blog?.hasBookmarked ? (
              <Tooltip title='Unbookmark' placement='left'>
                <BsBookmarkFill
                  className='cursor-pointer transition-all hover:text-zinc-400'
                  size='18'
                  onClick={() => blog?.slug && handleUnbookmark.mutate(blog?.slug)}
                />
              </Tooltip>
            ) : (
              <Tooltip title='Bookmark' placement='left'>
                <BsBookmark
                  className='cursor-pointer transition-all hover:text-zinc-400'
                  size='18'
                  onClick={() => blog?.slug && handleBookmark.mutate(blog?.slug)}
                />
              </Tooltip>
            )}
          </span>
        </div>

        <div className='sm:flex items-center items-base gap-4 hidden'>
          <p className='text-lg'>Reading Mode:</p>
          <Switch
            checked={isReadingMode}
            onChange={(checked) => (checked ? turnOnReadingMode() : turnOffReadingMode())}
          />
        </div>

        <p className='text-3xl text-white'>{blog?.title}</p>

        {blog?.image && <Image alt='' src={blog?.image} />}

        <div className='w-full text-base reset tiny-content'>
          {blog?.content && parse(blog?.content)}
        </div>

        <div className='w-full'>
          <span className='flex justify-between'>
            <p
              className='text-[#1890ff] text-base cursor-pointer hover:text-blue-600'
              onClick={openLikeModal}
            >
              View {blog?._count?.likedBy} Likes
            </p>

            <p
              className='text-[#1890ff] text-base cursor-pointer hover:text-blue-600'
              onClick={openDiscussionModal}
            >
              {blog?._count?.comments} Discussions
            </p>
          </span>

          <Divider className='mt-4 mb-2' />

          <span className='flex items-center [&>*]:py-2 [&>*]:basis-1/2 [&>*]:rounded-lg [&>*]:text-base [&>*]:cursor-pointer [&>*]:transition-all hover:[&>*]:bg-zinc-800'>
            <span
              className={`flex items-center justify-center gap-2 ${
                blog?.hasLiked && 'text-blue-500'
              }`}
              onClick={() => {
                if (!blog?.slug) return;

                blog?.hasLiked ? handleUnlike.mutate(blog.slug) : handleLike.mutate(blog.slug);
              }}
            >
              {blog?.hasLiked ? <BsHeartFill /> : <BsHeart />} Like
            </span>

            <span className='flex items-center justify-center gap-2' onClick={openDiscussionModal}>
              <VscComment size='17' /> Discussions
            </span>
          </span>

          <Divider className='mt-2' />

          <header className='text-2xl pb-4 uppercase'>More from {blog?.author?.name}</header>

          {userBlogs?.count && !isUserBlogFetchedAfterMount
            ? Array.from({ length: 1 }).map((_, i) => (
                <Skeleton key={i} className='py-8' avatar round paragraph={{ rows: 3 }} active />
              ))
            : userBlogs?.result?.map((blog) => (
                <BlogCard key={blog.slug} blog={blog} editable={blog.authorId === authUser?.id} />
              ))}
        </div>

        <Modal className='font-sans' open={isLikeModalOpen} onCancel={closeLikeModal} footer={null}>
          {isEmpty(likers?.result) ? (
            <Empty />
          ) : (
            <div className='pt-7'>
              {likers?.result?.map((user) => (
                <UserSkeleton key={user.id} user={user} descriptionMode='followersCount' />
              ))}
            </div>
          )}
        </Modal>

        <Modal
          className='font-sans'
          open={isDiscussionModalOpen}
          onCancel={closeDiscussionModal}
          footer={null}
        >
          {authUser && (
            <DiscussionForm
              onSubmit={(content) => {
                if (!blog?.slug) return;
                handleCreateComment.mutate({ slug: blog?.slug, data: { content } });
              }}
            />
          )}

          <InfiniteScroll
            dataLength={comments?.result?.length ?? 0}
            next={() => setCommentSize(10)}
            hasMore={comments?.result ? comments?.result?.length < comments?.count : false}
            loader={<Skeleton avatar round paragraph={{ rows: 1 }} active />}
          >
            {comments?.result && (
              <DiscussionList data={comments?.result} count={comments?.result?.length} />
            )}
          </InfiniteScroll>
        </Modal>
      </main>
    </Fragment>
  );
};

export default Blog;

export const getServerSideProps: GetServerSideProps = async (
  ctx: GetServerSidePropsContext,
): Promise<
  | {
      props: { dehydratedState: DehydratedState };
    }
  | { notFound: true }
> => {
  const queryClient = new QueryClient();

  ctx.res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=59');

  const config = { headers: { Cookie: ctx.req.headers.cookie || '' } };

  await queryClient.prefetchQuery({
    queryFn: () => getProfile(config),
    queryKey: queryKeys(AUTH).details(),
  });

  await queryClient.prefetchQuery({
    queryFn: () => getBlog(String(ctx.params?.slug), config),
    queryKey: queryKeys(BLOG).detail(String(ctx.params?.slug)),
  });

  const blog = queryClient.getQueryData(queryKeys(BLOG).detail(String(ctx.params?.slug))) as Blog;

  if (!blog) {
    return {
      notFound: true,
    };
  }

  await queryClient.prefetchQuery({
    queryFn: () => getUserBlogs({ id: blog?.authorId, size: 4 }, config),
    queryKey: queryKeys(USER, BLOG).list({ id: blog?.authorId, size: 4 }),
  });

  await queryClient.prefetchQuery({
    queryFn: () => getLikes({ slug: String(ctx.params?.slug), size: 20 }, config),
    queryKey: queryKeys(USER).list({ slug: String(ctx.params?.slug), size: 20 }),
  });

  await queryClient.prefetchQuery({
    queryFn: () => getComments({ slug: String(ctx.params?.slug), size: 20 }, config),
    queryKey: queryKeys(COMMENT).list({ slug: String(ctx.params?.slug), size: 20 }),
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
