import Head from 'next/head';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { Button, Empty, Tabs, Image, Divider, Skeleton, List, ConfigProvider } from 'antd';
import InfiniteScroll from 'react-infinite-scroll-component';
import { IconType } from 'react-icons';
import { BsBook } from 'react-icons/bs';
import { MdOutlinePublishedWithChanges, MdOutlineUnpublished } from 'react-icons/md';
import { useAuth, withAuth } from 'auth';
import { getGenre } from 'request/blog';
import { getBlogs, getFollowers, getFollowing, getProfile } from 'request/auth';
import ProfileSider from './components/Sider';
import BlogCard from 'components/common/BlogCard';
import EditProfile from './components/EditProfile';
import Filter from 'components/common/Filter';
import { useModalStore, useFilterStore } from 'store/hooks';
import { queryKeys } from 'utils';
import { AUTH, GENRE, BLOG, FOLLOWER, FOLLOWING } from 'constants/queryKeys';
import { MODALS, SORT_ORDER, SORT_TYPE, FILTERS } from 'constants/reduxKeys';

const Profile = () => {
  const router = useRouter();

  const { openModal: openEditProfileModal } = useModalStore(MODALS.EDIT_PROFILE_MODAL);

  const { size, search, sort, order, genre, isPublished, setSize, setPublished } = useFilterStore(
    FILTERS.AUTH_PROFILE_FILTER,
  );

  const { authUser } = useAuth();

  const {
    data: blogs,
    isPreviousData,
    isLoading,
  } = useQuery({
    queryFn: () => getBlogs({ order, isPublished, sort, genre, size, search }),
    queryKey: queryKeys(AUTH, BLOG).list({ order, isPublished, sort, genre, size, search }),
    keepPreviousData: true,
  });

  const getTabItems = (label: string, key: string, Icon: IconType) => {
    return {
      key,
      label: (
        <span className='sm:mx-2 mx-auto flex items-center gap-1.5'>
          <Icon className='inline' /> {label}
        </span>
      ),
      children: (
        <div className='w-full pt-3'>
          <Filter
            filterType={FILTERS.AUTH_PROFILE_FILTER}
            isLoading={isPreviousData}
            hasSort
            hasSortOrder
          />

          {isLoading ? (
            Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className='py-8' avatar round paragraph={{ rows: 3 }} active />
            ))
          ) : (
            <InfiniteScroll
              dataLength={blogs?.result?.length ?? 0}
              next={() => setSize(10)}
              hasMore={blogs?.result ? blogs?.result?.length < blogs?.count : false}
              loader={<Skeleton avatar round paragraph={{ rows: 2 }} active />}
            >
              <ConfigProvider
                renderEmpty={() => (
                  <Empty>
                    <Button
                      type='primary'
                      className='h-10 rounded-lg'
                      onClick={() => router.push('/blog/create')}
                    >
                      Write a Blog
                    </Button>
                  </Empty>
                )}
              >
                <List
                  itemLayout='vertical'
                  dataSource={blogs?.result}
                  renderItem={(blog) => (
                    <BlogCard
                      key={blog?.id}
                      blog={blog}
                      editable={blog?.authorId === authUser?.id}
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
    { key: 'all', label: 'All Blogs', icon: BsBook },
    { key: 'published', label: 'Published', icon: MdOutlinePublishedWithChanges },
    { key: 'unpublished', label: 'Unpublished', icon: MdOutlineUnpublished },
  ].map(({ key, label, icon }) => authUser && getTabItems(label, key, icon));

  return (
    <div className='w-full flex justify-center'>
      <Head>
        <title>{`${authUser?.name} | BlogSansar`}</title>
        <link href='/favicon.ico' rel='icon' />
      </Head>

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
                authUser?.image ||
                'data:image/png;base64,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'
              }
            />

            <p className='text-xl text-white' style={{ overflowWrap: 'anywhere' }}>
              {authUser?.name}
            </p>
          </span>

          <ProfileSider />

          <Button type='primary' className='sm:order-2 rounded-lg' onClick={openEditProfileModal}>
            Edit Profile
          </Button>

          <EditProfile />
        </div>

        <Divider />

        <header className='text-2xl uppercase pb-2'>Your Blogs</header>

        <Tabs
          className='w-full'
          defaultActiveKey={
            isPublished === undefined ? 'all' : isPublished === true ? 'published' : 'unpublished'
          }
          items={items as []}
          onTabClick={(key) =>
            setPublished(key === 'all' ? undefined : key === 'published' ? true : false)
          }
        />
      </main>
    </div>
  );
};

export default Profile;

export const getServerSideProps = withAuth(async (ctx, queryClient) => {
  ctx.res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=59');

  const config = { headers: { Cookie: ctx.req.headers.cookie || '' } };

  await queryClient.prefetchQuery({
    queryFn: () => getProfile(config),
    queryKey: queryKeys(AUTH).details(),
  });

  await queryClient.prefetchQuery({
    queryFn: () =>
      getBlogs(
        {
          genre: [],
          size: 20,
          sort: SORT_TYPE.LIKE_COUNT,
          order: SORT_ORDER.DESC,
          search: '',
        },
        config,
      ),
    queryKey: queryKeys(AUTH, BLOG).list({
      genre: [],
      size: 20,
      sort: SORT_TYPE.LIKE_COUNT,
      order: SORT_ORDER.DESC,
      search: '',
    }),
  });

  await queryClient.prefetchQuery({
    queryFn: () => getFollowers({ size: 20, search: '' }, config),
    queryKey: queryKeys(AUTH, FOLLOWER).list({ size: 20, search: '' }),
  });

  await queryClient.prefetchQuery({
    queryFn: () => getFollowing({ size: 20, search: '' }, config),
    queryKey: queryKeys(AUTH, FOLLOWING).list({ size: 20, search: '' }),
  });

  await queryClient.prefetchQuery({
    queryFn: () => getGenre(config),
    queryKey: queryKeys(GENRE).lists(),
  });

  return {
    props: {},
  };
});
