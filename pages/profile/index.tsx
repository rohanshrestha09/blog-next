import Head from 'next/head';
import { NextRouter, useRouter } from 'next/router';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { dehydrate, DehydratedState, QueryClient, useQuery } from '@tanstack/react-query';
import moment from 'moment';
import { capitalize, isEmpty } from 'lodash';
import { Button, Empty, Image, Space, Tabs } from 'antd';
import type { IconType } from 'react-icons';
import {
  BsBook,
  BsBookmarkCheck,
  BsHeart,
  BsFacebook,
  BsTwitter,
  BsInstagram,
  BsLinkedin,
} from 'react-icons/bs';
import { MdOutlinePublishedWithChanges, MdOutlineUnpublished } from 'react-icons/md';
import { GiSpiderWeb } from 'react-icons/gi';
import { FaBiohazard } from 'react-icons/fa';
import { useAuth } from '../../utils/UserAuth';
import AuthAxios from '../../apiAxios/authAxios';
import BlogList from '../../components/Blogs/BlogList';
import { AUTH, GET_AUTH_BLOGS } from '../../constants/queryKeys';
import type { IBlogData } from '../../interface/blog';
import type { RootState } from '../../store';
import { setPublishedStatus } from '../../store/authBlogSlice';

const Profile = () => {
  const router: NextRouter = useRouter();

  const { sort, genre, pageSize, isPublished } = useSelector((state: RootState) => state.authBlog);

  const dispatch = useDispatch();

  const { authUser } = useAuth();

  const authAxios = new AuthAxios();

  const { data: blogs } = useQuery({
    queryFn: () => authAxios.getAllBlogs({ sort, genre, pageSize, isPublished }),
    queryKey: [GET_AUTH_BLOGS],
  });

  const items = useCallback(() => {
    const getTabItems = (
      label: string,
      key: string,
      Icon: IconType,
      blogs: IBlogData[] | undefined,
      emptyAlt: string,
      editable: boolean,
      route: string
    ) => {
      return {
        key,
        label: (
          <span className='sm:mx-1.5 mx-auto flex items-center gap-1.5'>
            <Icon className='inline' /> {label}
          </span>
        ),
        children: isEmpty(blogs) ? (
          <Empty>
            <Button
              className='h-10 border-white uppercase rounded-lg'
              onClick={() => router.push(route)}
            >
              {emptyAlt}
            </Button>
          </Empty>
        ) : (
          blogs &&
          blogs.map((blog) => (
            <BlogList
              key={blog._id}
              editable={editable}
              authorName={authUser.fullname}
              authorImage={authUser.image}
              blog={blog}
            />
          ))
        ),
      };
    };

    return [
      { key: 'allblogs', icon: BsBook },
      { key: 'published', icon: MdOutlinePublishedWithChanges },
      { key: 'unpublished', icon: MdOutlineUnpublished },
      { key: 'bookmarks', icon: BsBookmarkCheck },
      { key: 'liked', icon: BsHeart },
    ].map(({ key, icon }) => {
      switch (key) {
        case 'allblogs':
        case 'published':
        case 'unpublished':
          return (
            authUser &&
            getTabItems(capitalize(key), key, icon, blogs, 'Create One', true, '/blog/create')
          );

        default:
          return (
            authUser && getTabItems(capitalize(key), key, icon, blogs, 'Browse Blogs', false, '/')
          );
      }
    });
  }, [authUser, blogs, router]);

  return (
    <div className='w-full flex justify-center'>
      <Head>
        <title>{`${authUser && authUser.fullname} | BlogSansar`}</title>
        <link href='/favicon.ico' rel='icon' />
      </Head>

      {authUser && (
        <main className='2xl:w-3/4 w-full flex flex-col items-center sm:gap-8 gap-4 py-2'>
          <div className='w-full flex sm:flex-row flex-col items-center justify-center sm:gap-14 gap-4'>
            <Image
              alt=''
              className='rounded-full object-cover'
              fallback='data:image/png;base64,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'
              height={160}
              width={160}
              src={authUser.image || 'error'}
            />

            <div className='sm:w-[55%] w-full flex flex-col sm:items-start items-center gap-3.5 break-all'>
              <p className='text-xl font-semibold'>{authUser.fullname}</p>

              {authUser.bio ? (
                <p className='sm:text-left text-center'>{authUser.bio}</p>
              ) : (
                <p className='underline cursor-pointer inline-flex items-center gap-1 hover:text-slate-400 transition-all'>
                  Update Bio <FaBiohazard />
                </p>
              )}

              {authUser.website ? (
                <a
                  className='link font-semibold'
                  href='https://rohanshrestha09.com.np'
                  target='_blank'
                  rel='noreferrer'
                >
                  https://rohanshrestha09.com.np
                </a>
              ) : (
                <p className='underline cursor-pointer inline-flex items-center gap-1 hover:text-slate-400 transition-all'>
                  Add Website <GiSpiderWeb />
                </p>
              )}

              <p className=''>{`Joined ${moment(authUser.createdAt).format('ll')}`}</p>

              <Space wrap className='[&>*]:text-lg' size={15}>
                <p className='text-sm'>Socials:</p>
                <BsFacebook />
                <BsTwitter />
                <BsInstagram />
                <BsLinkedin />
              </Space>
            </div>
          </div>

          <Tabs
            className='w-full'
            defaultActiveKey='blogs'
            items={items()}
            onTabClick={(key) => dispatch(setPublishedStatus({ key }))}
            centered
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

  ctx.res.setHeader('Cache-Control', 'public, s-maxage=86400');

  await queryClient.prefetchQuery({
    queryFn: () => authAxios.auth(),
    queryKey: [AUTH],
  });

  await queryClient.prefetchQuery({
    queryFn: () => authAxios.getAllBlogs({}),
    queryKey: [GET_AUTH_BLOGS],
  });

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  };
};
