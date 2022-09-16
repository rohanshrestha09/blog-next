import Head from 'next/head';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import { useContext } from 'react';
import { dehydrate, DehydratedState, QueryClient } from '@tanstack/react-query';
import moment from 'moment';
import { isEmpty } from 'lodash';
import { Button, Empty, Image, Space, Tabs } from 'antd';
import { BsBook, BsBookmarkCheck, BsHeart } from 'react-icons/bs';
import { RiUserFollowLine, RiUserAddLine } from 'react-icons/ri';
import { MdOutlinePublishedWithChanges, MdOutlineUnpublished } from 'react-icons/md';
import { GiSpiderWeb } from 'react-icons/gi';
import { FaBiohazard } from 'react-icons/fa';
import UserAxios from '../../apiAxios/userAxios';
import IContext from '../../interface/context';
import userContext from '../../utils/userContext';
import BlogList from '../../components/Blogs/BlogList';
import { AUTH } from '../../constants/queryKeys';

const Profile = () => {
  const { user } = useContext<IContext>(userContext);

  /* const followingRef = useRef<any>();

  useEffect(() => {
    followingRef.current.innerText = '0';
    const increment = () => {
      const target = 1500;
      const c = +followingRef.current.innerText;

      const inc = target / 500;

      if (c < target) {
        followingRef.current.innerText = `${Math.ceil(c + inc)}`;
        setTimeout(increment, 1);
      } else followingRef.current.innerText = 1500;
    };
    increment();
  }, []);*/

  const items = [
    {
      key: 'blogs',
      label: (
        <span className='sm:mx-5 mx-auto'>
          <BsBook className='inline' /> All Blogs
        </span>
      ),
      children: isEmpty(user.blogs) ? (
        <Empty>
          <Button className='btn min-h-8 h-10 focus:bg-[#021027]'>Create one</Button>
        </Empty>
      ) : (
        user.blogs.map((blog) => (
          <BlogList editable authorName={user.fullname} authorImage={user.image} blog={blog} />
        ))
      ),
    },
    {
      key: 'published',
      label: (
        <span className='sm:mx-5 mx-auto'>
          <MdOutlinePublishedWithChanges className='inline' /> Published
        </span>
      ),
      children: isEmpty(user.blogs.filter((blog) => blog.isPublished)) ? (
        <Empty>
          <Button className='btn min-h-8 h-10 focus:bg-[#021027]'>Create one</Button>
        </Empty>
      ) : (
        user.blogs.map(
          (blog) =>
            blog.isPublished && (
              <BlogList
                editable
                authorName={blog.authorName}
                authorImage={blog.authorImage}
                blog={blog}
              />
            )
        )
      ),
    },
    {
      key: 'unpublished',
      label: (
        <span className='sm:mx-5 mx-auto'>
          <MdOutlineUnpublished className='inline' /> Unpublished
        </span>
      ),
      children: isEmpty(user.blogs.filter((blog) => !blog.isPublished)) ? (
        <Empty>
          <Button className='btn min-h-8 h-10 focus:bg-[#021027]'>Create one</Button>
        </Empty>
      ) : (
        user.blogs.map(
          (blog) =>
            !blog.isPublished && (
              <BlogList
                editable
                authorName={blog.authorName}
                authorImage={blog.authorImage}
                blog={blog}
              />
            )
        )
      ),
    },
    {
      key: 'bookmarks',
      label: (
        <span className='sm:mx-5 mx-auto'>
          <BsBookmarkCheck className='inline' /> Bookmarks
        </span>
      ),
      children: isEmpty(user.bookmarks) ? (
        <Empty>
          <Button className='btn min-h-8 h-10 focus:bg-[#021027]'>Create one</Button>
        </Empty>
      ) : (
        user.bookmarks.map(
          (blog) =>
            blog.isPublished && (
              <BlogList authorName={blog.authorName} authorImage={blog.authorImage} blog={blog} />
            )
        )
      ),
    },

    {
      key: 'liked',
      label: (
        <span className='sm:mx-5 mx-auto'>
          <BsHeart className='inline' /> Liked
        </span>
      ),
      children: isEmpty(user.liked) ? (
        <Empty>
          <Button className='btn min-h-8 h-10 focus:bg-[#021027]'>Create one</Button>
        </Empty>
      ) : (
        user.liked.map(
          (blog) =>
            blog.isPublished && (
              <BlogList authorName={blog.authorName} authorImage={blog.authorImage} blog={blog} />
            )
        )
      ),
    },
  ];

  return (
    <div className='w-full flex justify-center p-5 sm:py-6'>
      <Head>
        <title>{`${user && user.fullname} | BlogSansar`}</title>
        <link href='/favicon.ico' rel='icon' />
      </Head>

      {user && (
        <main className='md:w-[51rem] w-full flex flex-col items-center sm:gap-6 gap-4'>
          <div className='w-full flex sm:flex-row flex-col items-center justify-center sm:gap-20 gap-4'>
            <span className='avatar'>
              <Image
                className='rounded-full object-cover'
                fallback='data:image/png;base64,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'
                height={160}
                width={160}
                src={user.image || 'error'}
              />
            </span>

            <div className='sm:w-[55%] w-full flex flex-col sm:items-start items-center sm:gap-3 gap-1 break-all'>
              <p className='text-xl font-semibold'>{user.fullname}</p>

              {user.bio ? (
                <p className='sm:text-left text-center'>{user.bio}</p>
              ) : (
                <p className='link inline-flex items-center gap-1 hover:text-slate-400 transition-all'>
                  Update Bio <FaBiohazard />
                </p>
              )}

              {user.website ? (
                <a
                  className='link font-semibold'
                  href='https://rohanshrestha09.com.np'
                  target='_blank'
                >
                  https://rohanshrestha09.com.np
                </a>
              ) : (
                <p className='link inline-flex items-center gap-1 hover:text-slate-400 transition-all'>
                  Add Website <GiSpiderWeb />
                </p>
              )}

              <p className='font-semibold'>{`Joined ${moment(user.createdAt).format('ll')}`}</p>

              <Space wrap>
                <p className='font-semibold'>Socials:</p>
                <a className='btn-link btn-active disabled'>Facebook</a>
                <a className='btn-link btn-active'>Twitter</a>
                <a className='btn-link btn-active'>Instagram</a>
                <a className='btn-link '>Linkedin</a>
              </Space>

              {/*<Space>
                <Button className='btn min-h-fit h-9 focus:btn focus:min-h-fit focus:h-9'>
                  Edit Profile
                </Button>

                <Button className='bg-inherit uppercase text-black h-9 rounded-lg font-semibold border-black'>
                  Create a Post
                </Button>
      </Space>*/}
            </div>
          </div>

          <div className='stats sm:w-[92%] w-full sm:grid-rows-1 sm:grid-cols-4 grid grid-cols-2 grid-rows-2 shadow'>
            <div className='stat cursor-pointer hover:bg-gray-50 transition-all duration-200'>
              <div className='stat-figure text-primary'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                  className='inline-block sm:w-8 sm:h-8 h-6 w-6 stroke-current'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z'
                  ></path>
                </svg>
              </div>
              <div className='stat-title'>Total Likes</div>
              <div className='stat-value text-primary sm:text-2xl text-xl'>25.6K</div>
            </div>

            <div className='stat cursor-pointer hover:bg-gray-50 transition-all duration-200'>
              <div className='stat-figure text-secondary'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                  className='inline-block sm:w-8 sm:h-8 h-6 w-6 stroke-current'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M13 10V3L4 14h7v7l9-11h-7z'
                  ></path>
                </svg>
              </div>
              <div className='stat-title'>Page Views</div>
              <div className='stat-value text-secondary sm:text-2xl text-xl'>2.6M</div>
            </div>

            <div className='stat cursor-pointer hover:bg-gray-50 transition-all duration-200'>
              <div className='stat-figure text-secondary'>
                <RiUserFollowLine className='inline sm:h-7 sm:w-7 h-5 w-5 text-[#394E6A]' />
              </div>
              <div className='stat-title'>Followers</div>
              <div className='stat-value sm:text-2xl text-xl'>86%</div>
            </div>

            <div className='stat cursor-pointer hover:bg-gray-50 transition-all duration-200'>
              <div className='stat-figure text-secondary'>
                <RiUserAddLine className='inline sm:h-7 sm:w-7 h-5 w-5 text-[#394E6A]' />
              </div>
              <div className='stat-title'>Following</div>
              <div className='stat-value sm:text-2xl text-xl' /* ref={followingRef}*/>80</div>
            </div>
          </div>

          <Tabs
            className='w-full'
            defaultActiveKey='blogs'
            tabBarStyle={{ borderBottomWidth: '1px' }}
            items={items}
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

  const userAxios = new UserAxios(ctx.req && ctx.req.headers.cookie);

  ctx.res.setHeader('Cache-Control', 'public, s-maxage=86400');

  await queryClient.prefetchQuery({
    queryFn: () => userAxios.auth(),
    queryKey: [AUTH],
  });

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  };
};
