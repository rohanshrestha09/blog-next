import Head from 'next/head';
import { NextRouter, useRouter } from 'next/router';
import { GetServerSideProps, GetServerSidePropsContext, NextPage } from 'next';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { dehydrate, DehydratedState, QueryClient, useQuery } from '@tanstack/react-query';
import { isEmpty } from 'lodash';
import { Button, Empty, Tabs, Image, Divider } from 'antd';
import { IconType } from 'react-icons';
import { BsBook } from 'react-icons/bs';
import { MdOutlinePublishedWithChanges, MdOutlineUnpublished } from 'react-icons/md';
import { useAuth } from '../../utils/UserAuth';
import AuthAxios from '../../apiAxios/authAxios';
import BlogAxios from '../../apiAxios/blogAxios';
import ProfileSider from '../../components/Profile/ProfileSider';
import BlogList from '../../components/Blogs/BlogList';
import EditProfile from '../../components/Profile/EditProfile';
import SortFilter from '../../components/Blogs/SortFilter';
import { openModal } from '../../store/modalSlice';
import { changeKey } from '../../store/authBlogSlice';
import {
  AUTH,
  GET_AUTH_BLOGS,
  GET_AUTH_FOLLOWERS,
  GET_AUTH_FOLLOWING,
  GET_GENRE,
} from '../../constants/queryKeys';
import {
  PROFILE_KEYS,
  AUTH_PROFILE_KEYS,
  MODAL_KEYS,
  NAV_KEYS,
  SORT_TYPE,
  SORT_ORDER,
} from '../../constants/reduxKeys';
import type { RootState } from '../../store';

const { ALL_BLOGS, PUBLISHED, UNPUBLISHED } = AUTH_PROFILE_KEYS;

const { AUTH_PROFILE } = PROFILE_KEYS;

const { LIKES } = SORT_TYPE;

const { ASCENDING } = SORT_ORDER;

const { CREATE_NAV } = NAV_KEYS;

const { EDIT_PROFILE_MODAL } = MODAL_KEYS;

const Profile: NextPage = () => {
  const router: NextRouter = useRouter();

  const { key, isPublished } = useSelector((state: RootState) => state.authBlog, shallowEqual);

  const {
    search: { [AUTH_PROFILE]: search },
    pageSize: { [AUTH_PROFILE]: pageSize },
    sort: { [AUTH_PROFILE]: sort },
    sortOrder: { [AUTH_PROFILE]: sortOrder },
    genre: { [AUTH_PROFILE]: genre },
  } = useSelector((state: RootState) => state.sortFilter, shallowEqual);

  const dispatch = useDispatch();

  const { authUser } = useAuth();

  const authAxios = new AuthAxios();

  const { data: blogs, isLoading } = useQuery({
    queryFn: () => authAxios.getAllBlogs({ sortOrder, isPublished, sort, genre, pageSize, search }),
    queryKey: [GET_AUTH_BLOGS, { sortOrder, isPublished, sort, genre, pageSize, search }],
  });

  const getTabItems = (label: string, key: AUTH_PROFILE_KEYS, Icon: IconType) => {
    return {
      key,
      label: (
        <span className='sm:mx-2 mx-auto flex items-center gap-1.5'>
          <Icon className='inline' /> {label}
        </span>
      ),
      children: (
        <div className='w-full pt-3'>
          <SortFilter sortFilterKey={AUTH_PROFILE} isLoading={isLoading} hasSort hasSortOrder />

          {isEmpty(blogs?.data) ? (
            <Empty>
              <Button className='h-10 uppercase rounded-lg' onClick={() => router.push(CREATE_NAV)}>
                Create One
              </Button>
            </Empty>
          ) : (
            blogs?.data.map((blog) => (
              <BlogList key={blog._id} blog={blog} editable={blog.author._id === authUser._id} />
            ))
          )}
        </div>
      ),
    };
  };

  const items = [
    { key: ALL_BLOGS, label: 'All Blogs', icon: BsBook },
    { key: PUBLISHED, label: 'Published', icon: MdOutlinePublishedWithChanges },
    { key: UNPUBLISHED, label: 'Unpublished', icon: MdOutlineUnpublished },
  ].map(({ key, label, icon }) => authUser && getTabItems(label, key, icon));

  return (
    <div className='w-full flex justify-center'>
      <Head>
        <title>{`${authUser && authUser.fullname} | BlogSansar`}</title>
        <link href='/favicon.ico' rel='icon' />
      </Head>

      {authUser && (
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
                  authUser.image ||
                  'data:image/png;base64,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'
                }
              />

              <p className='text-xl text-white' style={{ overflowWrap: 'anywhere' }}>
                {authUser.fullname}
              </p>
            </span>

            <ProfileSider />

            <Button
              type='primary'
              className='sm:order-2 rounded-lg'
              onClick={() => dispatch(openModal({ key: EDIT_PROFILE_MODAL }))}
            >
              Edit Profile
            </Button>

            <EditProfile />
          </div>

          <Divider />

          <header className='text-2xl uppercase pb-2'>Your Blogs</header>

          <Tabs
            className='w-full'
            defaultActiveKey={key}
            items={items}
            onTabClick={(key) => dispatch(changeKey({ key } as { key: AUTH_PROFILE_KEYS }))}
          />
        </main>
      )}
    </div>
  );
};

export default Profile;

export const getServerSideProps: GetServerSideProps = async (
  ctx: GetServerSidePropsContext
): Promise<{
  props: { dehydratedState: DehydratedState };
}> => {
  const queryClient = new QueryClient();

  const authAxios = new AuthAxios(ctx.req.headers.cookie);

  const blogAxios = new BlogAxios(ctx.req.headers.cookie);

  ctx.res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=59');

  await queryClient.prefetchQuery({
    queryFn: () => authAxios.auth(),
    queryKey: [AUTH],
  });

  await queryClient.prefetchQuery({
    queryFn: () => authAxios.getAllBlogs({}),
    queryKey: [
      GET_AUTH_BLOGS,
      { genre: [], pageSize: 20, sort: LIKES, sortOrder: ASCENDING, search: '' },
    ],
  });

  await queryClient.prefetchQuery({
    queryFn: () => authAxios.getFollowers({}),
    queryKey: [GET_AUTH_FOLLOWERS, { pageSize: 20, search: '' }],
  });

  await queryClient.prefetchQuery({
    queryFn: () => authAxios.getFollowing({}),
    queryKey: [GET_AUTH_FOLLOWING, { pageSize: 20, search: '' }],
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
