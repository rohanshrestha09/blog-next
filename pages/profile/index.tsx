import Head from 'next/head';
import { NextRouter, useRouter } from 'next/router';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { dehydrate, DehydratedState, QueryClient, useQuery } from '@tanstack/react-query';
import { isEmpty, capitalize } from 'lodash';
import { Button, Empty, Tabs, Image, Divider, Space } from 'antd';
import { IconType } from 'react-icons';
import { BsBook } from 'react-icons/bs';
import { MdOutlinePublishedWithChanges, MdOutlineUnpublished } from 'react-icons/md';
import { useAuth } from '../../utils/UserAuth';
import AuthAxios from '../../apiAxios/authAxios';
import BlogAxios from '../../apiAxios/blogAxios';
import ProfileSider from '../../components/Profile/ProfileSider';
import BlogList from '../../components/Blogs/BlogList';
import EditProfile from '../../components/Profile/EditProfile';
import SearchFilter from '../../components/Blogs/SearchFilter';
import { openModal } from '../../store/modalSlice';
import { changeKey, setGenre, setSearch, setSort, setSortOrder } from '../../store/authBlogSlice';
import {
  AUTH,
  GET_AUTH_BLOGS,
  GET_FOLLOWERS,
  GET_FOLLOWING,
  GET_GENRE,
} from '../../constants/queryKeys';
import { MODAL_KEYS, NAV_KEYS } from '../../constants/reduxKeys';
import { PROFILE_KEYS, SORT_TYPE, SORT_ORDER } from '../../constants/reduxKeys';
import type { RootState } from '../../store';

const { ALL_BLOGS, PUBLISHED, UNPUBLISHED } = PROFILE_KEYS;

const { LIKES } = SORT_TYPE;

const { ASCENDING } = SORT_ORDER;

const { CREATE } = NAV_KEYS;

const { EDIT_PROFILE } = MODAL_KEYS;

const Profile = () => {
  const router: NextRouter = useRouter();

  const { key, sort, sortOrder, genre, pageSize, isPublished, search } = useSelector(
    (state: RootState) => state.authBlog,
    shallowEqual
  );

  const dispatch = useDispatch();

  const { authUser } = useAuth();

  const authAxios = new AuthAxios();

  const { data: blogs, isLoading } = useQuery({
    queryFn: () => authAxios.getAllBlogs({ sort, genre, pageSize, sortOrder, search, isPublished }),
    queryKey: [GET_AUTH_BLOGS, { sort, genre, pageSize, sortOrder, search, isPublished }],
  });

  const getTabItems = (label: string, key: PROFILE_KEYS, Icon: IconType) => {
    return {
      key,
      label: (
        <span className='sm:mx-2 mx-auto flex items-center gap-1.5'>
          <Icon className='inline' /> {label}
        </span>
      ),
      children: (
        <div className='w-full pt-3'>
          <SearchFilter
            hasSort
            sort={sort}
            search={search}
            sortOrder={sortOrder}
            setSort={setSort}
            setSearch={setSearch}
            setSortOrder={setSortOrder}
            isLoading={isLoading}
          />

          {isEmpty(blogs?.data) ? (
            <Empty>
              <Button className='h-10 uppercase rounded-lg' onClick={() => router.push(CREATE)}>
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
    { key: ALL_BLOGS, icon: BsBook },
    { key: PUBLISHED, icon: MdOutlinePublishedWithChanges },
    { key: UNPUBLISHED, icon: MdOutlineUnpublished },
  ].map(({ key, icon }) => authUser && getTabItems(capitalize(key), key, icon));

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
                className='min-w-[55px] rounded-full object-cover'
                fallback='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3PTWBSGcbGzM6GCKqlIBRV0dHRJFarQ0eUT8LH4BnRU0NHR0UEFVdIlFRV7TzRksomPY8uykTk/zewQfKw/9znv4yvJynLv4uLiV2dBoDiBf4qP3/ARuCRABEFAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghgg0Aj8i0JO4OzsrPv69Wv+hi2qPHr0qNvf39+iI97soRIh4f3z58/u7du3SXX7Xt7Z2enevHmzfQe+oSN2apSAPj09TSrb+XKI/f379+08+A0cNRE2ANkupk+ACNPvkSPcAAEibACyXUyfABGm3yNHuAECRNgAZLuYPgEirKlHu7u7XdyytGwHAd8jjNyng4OD7vnz51dbPT8/7z58+NB9+/bt6jU/TI+AGWHEnrx48eJ/EsSmHzx40L18+fLyzxF3ZVMjEyDCiEDjMYZZS5wiPXnyZFbJaxMhQIQRGzHvWR7XCyOCXsOmiDAi1HmPMMQjDpbpEiDCiL358eNHurW/5SnWdIBbXiDCiA38/Pnzrce2YyZ4//59F3ePLNMl4PbpiL2J0L979+7yDtHDhw8vtzzvdGnEXdvUigSIsCLAWavHp/+qM0BcXMd/q25n1vF57TYBp0a3mUzilePj4+7k5KSLb6gt6ydAhPUzXnoPR0dHl79WGTNCfBnn1uvSCJdegQhLI1vvCk+fPu2ePXt2tZOYEV6/fn31dz+shwAR1sP1cqvLntbEN9MxA9xcYjsxS1jWR4AIa2Ibzx0tc44fYX/16lV6NDFLXH+YL32jwiACRBiEbf5KcXoTIsQSpzXx4N28Ja4BQoK7rgXiydbHjx/P25TaQAJEGAguWy0+2Q8PD6/Ki4R8EVl+bzBOnZY95fq9rj9zAkTI2SxdidBHqG9+skdw43borCXO/ZcJdraPWdv22uIEiLA4q7nvvCug8WTqzQveOH26fodo7g6uFe/a17W3+nFBAkRYENRdb1vkkz1CH9cPsVy/jrhr27PqMYvENYNlHAIesRiBYwRy0V+8iXP8+/fvX11Mr7L7ECueb/r48eMqm7FuI2BGWDEG8cm+7G3NEOfmdcTQw4h9/55lhm7DekRYKQPZF2ArbXTAyu4kDYB2YxUzwg0gi/41ztHnfQG26HbGel/crVrm7tNY+/1btkOEAZ2M05r4FB7r9GbAIdxaZYrHdOsgJ/wCEQY0J74TmOKnbxxT9n3FgGGWWsVdowHtjt9Nnvf7yQM2aZU/TIAIAxrw6dOnAWtZZcoEnBpNuTuObWMEiLAx1HY0ZQJEmHJ3HNvGCBBhY6jtaMoEiJB0Z29vL6ls58vxPcO8/zfrdo5qvKO+d3Fx8Wu8zf1dW4p/cPzLly/dtv9Ts/EbcvGAHhHyfBIhZ6NSiIBTo0LNNtScABFyNiqFCBChULMNNSdAhJyNSiECRCjUbEPNCRAhZ6NSiAARCjXbUHMCRMjZqBQiQIRCzTbUnAARcjYqhQgQoVCzDTUnQIScjUohAkQo1GxDzQkQIWejUogAEQo121BzAkTI2agUIkCEQs021JwAEXI2KoUIEKFQsw01J0CEnI1KIQJEKNRsQ80JECFno1KIABEKNdtQcwJEyNmoFCJAhELNNtScABFyNiqFCBChULMNNSdAhJyNSiECRCjUbEPNCRAhZ6NSiAARCjXbUHMCRMjZqBQiQIRCzTbUnAARcjYqhQgQoVCzDTUnQIScjUohAkQo1GxDzQkQIWejUogAEQo121BzAkTI2agUIkCEQs021JwAEXI2KoUIEKFQsw01J0CEnI1KIQJEKNRsQ80JECFno1KIABEKNdtQcwJEyNmoFCJAhELNNtScABFyNiqFCBChULMNNSdAhJyNSiECRCjUbEPNCRAhZ6NSiAARCjXbUHMCRMjZqBQiQIRCzTbUnAARcjYqhQgQoVCzDTUnQIScjUohAkQo1GxDzQkQIWejUogAEQo121BzAkTI2agUIkCEQs021JwAEXI2KoUIEKFQsw01J0CEnI1KIQJEKNRsQ80JECFno1KIABEKNdtQcwJEyNmoFCJAhELNNtScABFyNiqFCBChULMNNSdAhJyNSiEC/wGgKKC4YMA4TAAAAABJRU5ErkJggg=='
                height={65}
                width={65}
                src={authUser.image || 'error'}
              />

              <p className='text-xl' style={{ overflowWrap: 'anywhere' }}>
                {authUser.fullname}
              </p>
            </span>

            <ProfileSider />

            <Button
              type='primary'
              className='sm:order-2 rounded-lg bg-[#057AFF]'
              onClick={() => dispatch(openModal({ key: EDIT_PROFILE }))}
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
            onTabClick={(key) => dispatch(changeKey({ key } as { key: PROFILE_KEYS }))}
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

  const authAxios = new AuthAxios(ctx.req && ctx.req.headers.cookie);

  const blogAxios = new BlogAxios(ctx.req && ctx.req.headers.cookie);

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
    queryKey: [GET_FOLLOWERS, { pageSize: 20, search: '' }],
  });

  await queryClient.prefetchQuery({
    queryFn: () => authAxios.getFollowing({}),
    queryKey: [GET_FOLLOWING, { pageSize: 20, search: '' }],
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
