import { NextRouter, useRouter } from 'next/router';
import { useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useQueryClient } from '@tanstack/react-query';
import 'antd/dist/antd.dark.min.css';
import { Layout, Drawer, Affix } from 'antd';
import LoadingBar from 'react-top-loading-bar';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { MdOutlineKeyboardArrowRight } from 'react-icons/md';
import Login from './Login';
import Register from './Register';
import Nav from '../shared/Nav';
import HomeSider from '../Home/HomeSider';
import ProfileSider from '../Profile/ProfileSider';
import UserProfileSider from '../Profile/UserProfileSider';
import NotificationList from '../Notifications';
import { closeDrawer, openDrawer } from '../../store/drawerSlice';
import { useAuth } from '../../utils/UserAuth';
import { jsxNotification } from '../../utils/notification';
import { GET_NOTIFICATIONS } from '../../constants/queryKeys';

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }): JSX.Element => {
  const { Content, Sider } = Layout;

  const { pathname, events }: NextRouter = useRouter();

  const queryClient = useQueryClient();

  const { authUser, socket } = useAuth();

  const sidebarAffixA = useRef<any>(),
    sidebarAffixB = useRef<any>();

  const loaderRef = useRef<any>(null);

  const { isOpen: isDrawerOpen } = useSelector((state: RootState) => state.drawer);

  const dispatch = useDispatch();

  const getSider = useCallback(() => {
    switch (pathname) {
      case '/':
      case '/[blogId]':
      case '/blog/bookmarks':
      case '/blog/[genre]':
      case '/notifications':
        return <HomeSider />;

      case '/profile':
        return <ProfileSider isSider />;

      case '/profile/[userId]':
        return <UserProfileSider isSider />;

      case '/blog/create':
      case '/blog/update/[blogId]':
        return false;
    }
  }, [pathname]);

  useEffect(() => {
    events.on('routeChangeStart', () => loaderRef.current?.continuousStart());

    events.on('routeChangeComplete', () => loaderRef.current?.complete());
  }, [events]);

  useEffect(() => {
    events.on('routeChangeComplete', () => {
      loaderRef.current?.complete();
      sidebarAffixA?.current?.updatePosition();
      sidebarAffixB?.current?.updatePosition();
    });
  }, [events, sidebarAffixA, sidebarAffixB]);

  useEffect(() => {
    if (authUser) {
      socket.current.off('incoming notification').on('incoming notification', (notification) => {
        jsxNotification(<NotificationList notification={notification} smallContainer />);
        queryClient.refetchQueries([GET_NOTIFICATIONS]);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Layout className='font-sans min-h-screen 2xl:px-36 sm:pr-1' hasSider>
      <LoadingBar color='#177ddc' ref={loaderRef} shadow={true} waitingTime={400} />

      <ToastContainer />

      <Login />

      <Register />

      <MdOutlineKeyboardArrowRight
        className={`${
          getSider() && 'sm:hidden'
        } block fixed left-4 top-[51%] cursor-pointer hover:bg-slate-700 rounded-full z-50`}
        size={40}
        onClick={() => dispatch(openDrawer())}
      />

      <Drawer
        placement='left'
        className={`${getSider() && 'sm:hidden'} block`}
        closable={false}
        onClose={() => dispatch(closeDrawer())}
        open={isDrawerOpen}
        headerStyle={{ fontFamily: 'Poppins' }}
        bodyStyle={{ padding: 0, margin: 0 }}
        contentWrapperStyle={{ width: 'auto', height: 'auto' }}
      >
        <Nav additionalProps='w-72' isDrawer />
      </Drawer>

      <Affix ref={sidebarAffixA} offsetTop={1}>
        <Sider
          breakpoint='xl'
          className={`${!getSider() && 'sm:hidden'} bg-inherit sm:block hidden z-10`}
          width={270}
        >
          <Nav additionalProps='bg-inherit border-none' />
        </Sider>
      </Affix>

      <Layout
        className={`${getSider() && 'sm:border-x'} border-[#303030] py-[1.20rem] xl:px-12 px-4`}
      >
        <Content>{children}</Content>
      </Layout>

      <Affix ref={sidebarAffixB} offsetTop={1}>
        <Sider
          className={`${
            !getSider() && 'lg:hidden'
          } h-screen scrollbar bg-inherit lg:block hidden py-[1.20rem] xl:pl-12 xl:pr-10 px-4 z-10`}
          width={450}
        >
          {getSider()}
        </Sider>
      </Affix>
    </Layout>
  );
};

export default AppLayout;
