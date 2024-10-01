import { useRouter } from 'next/router';
import { useCallback, useEffect, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import 'antd/dist/antd.dark.min.css';
import { Layout, Drawer, Affix, ConfigProvider, Empty } from 'antd';
import Pusher from 'pusher-js';
import LoadingBar, { LoadingBarRef } from 'react-top-loading-bar';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { MdOutlineKeyboardArrowRight } from 'react-icons/md';
import Login from './components/Login';
import Register from './components/Register';
import { DesktopNavbar, MobileNavbar } from './navbar';
import HomeSider from 'components/home/components/Sider';
import ProfileSider from 'components/profile/components/Sider';
import UserProfileSider from 'components/profile/[userId]/components/Sider';
import UserList from './components/UserList';
import NotificationCard from 'components/notifications/components/NotificationCard';
import { useAuth } from 'auth';
import { logout } from 'request/auth';
import { useReadingModeStore, useDrawerStore } from 'store/hooks';
import { jsxNotification } from 'utils/notification';
import { queryKeys } from 'utils';
import { NOTIFICATION } from 'constants/queryKeys';
import { Notification } from 'models/notification';

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }): JSX.Element => {
  const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY as string, {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER as string,
    channelAuthorization: {
      endpoint: '/api/pusher/auth',
      transport: 'ajax',
    },
  });

  const { Content, Sider, Footer } = Layout;

  const { pathname, events } = useRouter();

  const queryClient = useQueryClient();

  const { authUser } = useAuth();

  const sidebarAffixA = useRef<any>(),
    sidebarAffixB = useRef<any>();

  const loaderRef = useRef<LoadingBarRef>(null);

  const { isOpen: isDrawerOpen, openDrawer, closeDrawer } = useDrawerStore();

  const { isReadingMode, turnOffReadingMode } = useReadingModeStore();

  const handleLogout = useMutation(logout);

  const getSider = useCallback(() => {
    switch (pathname) {
      case '/':
      case '/blog/[slug]':
      case '/blog/bookmark':
      case '/blog/genre/[genre]':
      case '/notifications':
        return <HomeSider />;

      case '/profile':
        return <ProfileSider isSider />;

      case '/profile/[userId]':
        return <UserProfileSider isSider />;

      case '/blog/create':
      case '/blog/[slug]/update':
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
    if (pathname !== '/blog/[slug]') turnOffReadingMode();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    if (!authUser) return;

    const channel = pusher.subscribe(`${authUser?.id}`);

    channel.bind('dispatch-notification', (notification: Notification) => {
      jsxNotification(<NotificationCard notification={notification} size='small' />);
      queryClient.refetchQueries(queryKeys(NOTIFICATION).all);
    });

    return () => {
      pusher.unsubscribe(`${authUser?.id}`);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser]);

  useEffect(() => {
    window.addEventListener('beforeunload', () => {
      const rememberCredential = localStorage.getItem('rememberCredential');

      if (!rememberCredential) {
        handleLogout.mutate(undefined);

        localStorage.clear();
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ConfigProvider renderEmpty={() => <Empty />}>
      <Layout className='font-sans min-h-screen 2xl:px-36 sm:pr-1' hasSider>
        <LoadingBar color='#177ddc' ref={loaderRef} shadow={true} waitingTime={400} />

        <ToastContainer />

        <Login />

        <Register />

        <MdOutlineKeyboardArrowRight
          className={`${!getSider() ? 'block' : 'hidden'} ${
            pathname.startsWith('/auth') && 'hidden'
          } fixed left-4 top-[51%] cursor-pointer hover:bg-zinc-800 rounded-full z-50`}
          size={42}
          onClick={openDrawer}
        />

        <UserList />

        <Drawer
          placement='left'
          className={`${getSider() && 'sm:hidden'} block`}
          closable={false}
          onClose={closeDrawer}
          open={isDrawerOpen}
          headerStyle={{ fontFamily: 'Poppins' }}
          bodyStyle={{ padding: 0, margin: 0 }}
          contentWrapperStyle={{ width: 'auto', height: 'auto' }}
        >
          <DesktopNavbar className='w-72' isDrawer />
        </Drawer>

        <Affix
          className={`${isReadingMode && 'opacity-0 pointer-events-none'} transition-all`}
          ref={sidebarAffixA}
          offsetTop={1}
        >
          <Sider
            breakpoint='xl'
            className={`${!getSider() && 'sm:hidden'} bg-inherit sm:block hidden z-10`}
            width={isReadingMode ? 350 : 270}
          >
            <DesktopNavbar className='bg-inherit border-none' />
          </Sider>
        </Affix>

        <Layout>
          <Content
            className={`${getSider() && 'sm:border-x'} ${
              isReadingMode && 'border-none'
            } border-[#303030] py-[1.20rem] xl:px-12 px-4`}
          >
            {children}
          </Content>

          <Footer className='sm:hidden w-full p-0 sticky bottom-0'>
            <MobileNavbar />
          </Footer>
        </Layout>

        <Affix
          className={`${isReadingMode && 'opacity-0 pointer-events-none'} transition-all`}
          ref={sidebarAffixB}
          offsetTop={1}
        >
          <Sider
            className={`${
              !getSider() && 'lg:hidden'
            } h-screen scrollbar bg-inherit lg:block hidden py-[1.20rem] xl:pl-12 xl:pr-10 px-4 z-10`}
            width={isReadingMode ? 350 : 450}
          >
            {getSider()}
          </Sider>
        </Affix>
      </Layout>
    </ConfigProvider>
  );
};

export default AppLayout;
