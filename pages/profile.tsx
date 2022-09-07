import Head from 'next/head';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import { useCallback, useContext, useEffect, useRef } from 'react';
import { dehydrate, DehydratedState, QueryClient } from '@tanstack/react-query';
import { Image, Menu, MenuProps, Tabs } from 'antd';
import { BsBookmarkCheck, BsHeart } from 'react-icons/bs';
import { RiUserFollowLine, RiUserAddLine } from 'react-icons/ri';
import { MdOutlinePublishedWithChanges, MdOutlineUnpublished } from 'react-icons/md';
import UserAxios from '../apiAxios/userAxios';
import IContext from '../interface/context';
import userContext from '../utils/userContext';
import { AUTH } from '../constants/queryKeys';

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
      label: (
        <span className='sm:mx-5 mx-auto'>
          <MdOutlinePublishedWithChanges className='inline' /> Published
        </span>
      ),
      key: 'published',
    },
    {
      label: (
        <span className='sm:mx-5 mx-auto'>
          <MdOutlineUnpublished className='inline' /> Unpublished
        </span>
      ),
      key: 'unpublished',
    },
    {
      label: (
        <span className='sm:mx-5 mx-auto'>
          <BsBookmarkCheck className='inline' /> Bookmarks
        </span>
      ),
      key: 'bookmarks',
    },
    {
      label: (
        <span className='sm:mx-5 mx-auto'>
          <BsHeart className='inline' /> Liked
        </span>
      ),
      key: 'liked',
    },
  ];

  return (
    <div className='w-full flex justify-center p-5'>
      <Head>
        <title>{`${user?.fullname} | BlogSansar`}</title>
        <link href='/favicon.ico' rel='icon' />
      </Head>

      {user && (
        <main className='xl:w-3/4 w-full flex flex-col items-center md:gap-5 gap-8'>
          {/* <Image
              className='rounded-full object-cover'
              fallback='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3PTWBSGcbGzM6GCKqlIBRV0dHRJFarQ0eUT8LH4BnRU0NHR0UEFVdIlFRV7TzRksomPY8uykTk/zewQfKw/9znv4yvJynLv4uLiV2dBoDiBf4qP3/ARuCRABEFAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghgg0Aj8i0JO4OzsrPv69Wv+hi2qPHr0qNvf39+iI97soRIh4f3z58/u7du3SXX7Xt7Z2enevHmzfQe+oSN2apSAPj09TSrb+XKI/f379+08+A0cNRE2ANkupk+ACNPvkSPcAAEibACyXUyfABGm3yNHuAECRNgAZLuYPgEirKlHu7u7XdyytGwHAd8jjNyng4OD7vnz51dbPT8/7z58+NB9+/bt6jU/TI+AGWHEnrx48eJ/EsSmHzx40L18+fLyzxF3ZVMjEyDCiEDjMYZZS5wiPXnyZFbJaxMhQIQRGzHvWR7XCyOCXsOmiDAi1HmPMMQjDpbpEiDCiL358eNHurW/5SnWdIBbXiDCiA38/Pnzrce2YyZ4//59F3ePLNMl4PbpiL2J0L979+7yDtHDhw8vtzzvdGnEXdvUigSIsCLAWavHp/+qM0BcXMd/q25n1vF57TYBp0a3mUzilePj4+7k5KSLb6gt6ydAhPUzXnoPR0dHl79WGTNCfBnn1uvSCJdegQhLI1vvCk+fPu2ePXt2tZOYEV6/fn31dz+shwAR1sP1cqvLntbEN9MxA9xcYjsxS1jWR4AIa2Ibzx0tc44fYX/16lV6NDFLXH+YL32jwiACRBiEbf5KcXoTIsQSpzXx4N28Ja4BQoK7rgXiydbHjx/P25TaQAJEGAguWy0+2Q8PD6/Ki4R8EVl+bzBOnZY95fq9rj9zAkTI2SxdidBHqG9+skdw43borCXO/ZcJdraPWdv22uIEiLA4q7nvvCug8WTqzQveOH26fodo7g6uFe/a17W3+nFBAkRYENRdb1vkkz1CH9cPsVy/jrhr27PqMYvENYNlHAIesRiBYwRy0V+8iXP8+/fvX11Mr7L7ECueb/r48eMqm7FuI2BGWDEG8cm+7G3NEOfmdcTQw4h9/55lhm7DekRYKQPZF2ArbXTAyu4kDYB2YxUzwg0gi/41ztHnfQG26HbGel/crVrm7tNY+/1btkOEAZ2M05r4FB7r9GbAIdxaZYrHdOsgJ/wCEQY0J74TmOKnbxxT9n3FgGGWWsVdowHtjt9Nnvf7yQM2aZU/TIAIAxrw6dOnAWtZZcoEnBpNuTuObWMEiLAx1HY0ZQJEmHJ3HNvGCBBhY6jtaMoEiJB0Z29vL6ls58vxPcO8/zfrdo5qvKO+d3Fx8Wu8zf1dW4p/cPzLly/dtv9Ts/EbcvGAHhHyfBIhZ6NSiIBTo0LNNtScABFyNiqFCBChULMNNSdAhJyNSiECRCjUbEPNCRAhZ6NSiAARCjXbUHMCRMjZqBQiQIRCzTbUnAARcjYqhQgQoVCzDTUnQIScjUohAkQo1GxDzQkQIWejUogAEQo121BzAkTI2agUIkCEQs021JwAEXI2KoUIEKFQsw01J0CEnI1KIQJEKNRsQ80JECFno1KIABEKNdtQcwJEyNmoFCJAhELNNtScABFyNiqFCBChULMNNSdAhJyNSiECRCjUbEPNCRAhZ6NSiAARCjXbUHMCRMjZqBQiQIRCzTbUnAARcjYqhQgQoVCzDTUnQIScjUohAkQo1GxDzQkQIWejUogAEQo121BzAkTI2agUIkCEQs021JwAEXI2KoUIEKFQsw01J0CEnI1KIQJEKNRsQ80JECFno1KIABEKNdtQcwJEyNmoFCJAhELNNtScABFyNiqFCBChULMNNSdAhJyNSiECRCjUbEPNCRAhZ6NSiAARCjXbUHMCRMjZqBQiQIRCzTbUnAARcjYqhQgQoVCzDTUnQIScjUohAkQo1GxDzQkQIWejUogAEQo121BzAkTI2agUIkCEQs021JwAEXI2KoUIEKFQsw01J0CEnI1KIQJEKNRsQ80JECFno1KIABEKNdtQcwJEyNmoFCJAhELNNtScABFyNiqFCBChULMNNSdAhJyNSiEC/wGgKKC4YMA4TAAAAABJRU5ErkJggg=='
              height={150}
              width={150}
              src={user.image || 'error'}
      />*/}

          <div className='stats sm:grid-rows-1 sm:grid-cols-4 grid grid-cols-2 grid-rows-2 shadow'>
            <div className='stat cursor-pointer hover:bg-gray-50 transition-all duration-200'>
              <div className='stat-figure text-primary'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                  className='inline-block md:w-8 md:h-8 h-6 w-6 stroke-current'
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
              <div className='stat-value text-primary md:text-3xl text-xl'>25.6K</div>
            </div>

            <div className='stat cursor-pointer hover:bg-gray-50 transition-all duration-200'>
              <div className='stat-figure text-secondary'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                  className='inline-block md:w-8 md:h-8 h-6 w-6 stroke-current'
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
              <div className='stat-value text-secondary md:text-3xl text-xl'>2.6M</div>
            </div>

            <div className='stat cursor-pointer hover:bg-gray-50 transition-all duration-200'>
              <div className='stat-figure text-secondary'>
                <RiUserFollowLine className='inline md:h-7 md:w-7 h-5 w-5 text-[#394E6A]' />
              </div>
              <div className='stat-title'>Followers</div>
              <div className='stat-value md:text-3xl text-xl'>86%</div>
            </div>

            <div className='stat cursor-pointer hover:bg-gray-50 transition-all duration-200'>
              <div className='stat-figure text-secondary'>
                <RiUserAddLine className='inline md:h-7 md:w-7 h-5 w-5 text-[#394E6A]' />
              </div>
              <div className='stat-title'>Following</div>
              <div className='stat-value md:text-3xl text-xl' /* ref={followingRef}*/>80</div>
            </div>
          </div>

          <Tabs className='w-full' defaultActiveKey='published' items={items} centered />
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
