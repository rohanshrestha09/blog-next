import Head from 'next/head';
import { useRouter, NextRouter } from 'next/router';
import { GetServerSideProps, GetServerSidePropsContext, NextPage } from 'next';
import { shallowEqual, useSelector } from 'react-redux';
import {
  DehydratedState,
  QueryClient,
  dehydrate,
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { isEmpty } from 'lodash';
import { Image, Button, Divider, Empty } from 'antd';
import { useAuth } from '../../utils/UserAuth';
import AuthAxios from '../../api/AuthAxios';
import UserAxios from '../../api/UserAxios';
import BlogList from '../../components/Blogs/BlogList';
import UserProfileSider from '../../components/Profile/UserProfileSider';
import { errorNotification, successNotification } from '../../utils/notification';
import {
  AUTH,
  GET_USER,
  GET_USER_BLOGS,
  GET_USER_FOLLOWERS,
  GET_USER_FOLLOWING,
} from '../../constants/queryKeys';
import { NAV_KEYS, PROFILE_KEYS } from '../../constants/reduxKeys';
import type { RootState } from '../../store';

const { USER_PROFILE } = PROFILE_KEYS;

const { HOME_NAV } = NAV_KEYS;

const UserProfile: NextPage = () => {
  const {
    query: { userId },
    push,
  }: NextRouter = useRouter();

  const {
    pageSize: { [USER_PROFILE]: pageSize },
  } = useSelector((state: RootState) => state.sortFilter, shallowEqual);

  const queryClient = useQueryClient();

  const { authUser } = useAuth();

  const userAxios = new UserAxios();

  const { data: user } = useQuery({
    queryFn: () => userAxios.getUser(String(userId)),
    queryKey: [GET_USER, userId],
  });

  const { data: blogs } = useQuery({
    queryFn: () => userAxios.getUserBlogs({ user: String(userId), pageSize }),
    queryKey: [GET_USER_BLOGS, userId, { pageSize }],
  });

  const handleFollowUser = useMutation(
    ({ id, shouldFollow }: { id: string; shouldFollow: boolean }) =>
      new AuthAxios().followUser({ id, shouldFollow }),
    {
      onSuccess: (res) => {
        successNotification(res.message);
        queryClient.refetchQueries([AUTH]);
        queryClient.refetchQueries([GET_USER_FOLLOWERS]);
        queryClient.refetchQueries([GET_USER_FOLLOWING]);
      },
      onError: (err: Error) => errorNotification(err),
    }
  );

  return (
    <div className='w-full flex justify-center'>
      <Head>
        <title>{`${user && user.fullname} | BlogSansar`}</title>
        <link href='/favicon.ico' rel='icon' />
      </Head>

      {user && (
        <main className='w-full flex flex-col'>
          <header className='text-2xl uppercase pb-4'>Profile</header>

          <div className='w-full flex flex-wrap sm:flex-row flex-col sm:items-center gap-3 justify-between'>
            <span className='flex items-center gap-4'>
              <Image
                alt=''
                className='min-w-[50px] rounded-full object-cover'
                height={50}
                width={50}
                src={
                  user.image ||
                  'data:image/png;base64,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'
                }
              />

              <p className='text-xl text-white' style={{ overflowWrap: 'anywhere' }}>
                {user.fullname}
              </p>
            </span>

            <UserProfileSider />

            <Button
              type='primary'
              className='sm:order-2 rounded-lg'
              danger={authUser?.following.includes(user._id as never)}
              disabled={authUser?._id === user._id}
              onClick={() =>
                handleFollowUser.mutate({
                  id: user._id,
                  shouldFollow: !authUser?.following.includes(user._id as never),
                })
              }
            >
              {authUser?.following.includes(user._id as never) ? 'Unfollow' : 'Follow'}
            </Button>
          </div>

          <Divider />

          <header className='text-2xl uppercase pb-2'>{`${user.fullname}'s Blogs`}</header>

          <div className='w-full pt-3'>
            {isEmpty(blogs?.data) ? (
              <Empty>
                <Button className='h-10 uppercase rounded-lg' onClick={() => push(HOME_NAV)}>
                  Browse Blogs
                </Button>
              </Empty>
            ) : (
              blogs?.data.map((blog) => (
                <BlogList key={blog._id} blog={blog} editable={blog.author._id === authUser?._id} />
              ))
            )}
          </div>
        </main>
      )}
    </div>
  );
};

export default UserProfile;

export const getServerSideProps: GetServerSideProps = async (
  ctx: GetServerSidePropsContext
): Promise<{
  props: { dehydratedState: DehydratedState };
}> => {
  const queryClient = new QueryClient();

  const userAxios = new UserAxios(ctx.req.headers.cookie);

  const authAxios = new AuthAxios(ctx.req.headers.cookie);

  ctx.res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=59');

  await queryClient.prefetchQuery({
    queryFn: () => authAxios.auth(),
    queryKey: [AUTH],
  });

  await queryClient.prefetchQuery({
    queryFn: () => userAxios.getUser(String(ctx.params?.userId)),
    queryKey: [GET_USER, ctx.params?.userId],
  });

  await queryClient.prefetchQuery({
    queryFn: () => userAxios.getUserBlogs({ user: String(ctx.params?.userId) }),
    queryKey: [GET_USER_BLOGS, ctx.params?.userId, { pageSize: 20 }],
  });

  await queryClient.prefetchQuery({
    queryFn: () => userAxios.getUserFollowers({ user: String(ctx.params?.userId) }),
    queryKey: [GET_USER_FOLLOWERS, ctx.params?.userId, { pageSize: 20, search: '' }],
  });

  await queryClient.prefetchQuery({
    queryFn: () => userAxios.getUserFollowing({ user: String(ctx.params?.userId) }),
    queryKey: [GET_USER_FOLLOWING, ctx.params?.userId, { pageSize: 20, search: '' }],
  });

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  };
};
