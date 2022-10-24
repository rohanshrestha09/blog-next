import { NextRouter, useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { Layout, Drawer } from 'antd';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { MdOutlineKeyboardArrowRight } from 'react-icons/md';
import Login from './Login';
import Register from './Register';
import Nav from '../shared/Nav';
import ProfileSider from '../Profile/ProfileSider';
import { closeDrawer, openDrawer } from '../../store/drawerSlice';
import type { RootState } from '../../store';
import UserProfileSider from '../Profile/UserProfileSider';
import { useCallback } from 'react';
import HomeSider from '../HomeSider';

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }): JSX.Element => {
  const { Content, Sider } = Layout;

  const { pathname }: NextRouter = useRouter();

  const { isOpen: isDrawerOpen } = useSelector((state: RootState) => state.drawer);

  const dispatch = useDispatch();

  const getSider = useCallback(() => {
    switch (pathname) {
      case '/':
      case '/[blogId]':
      case 'bookmarks':
        return <HomeSider />;

      case '/profile':
        return <ProfileSider isSider />;

      case '/profile/[userId]':
        return <UserProfileSider isSider />;
    }
  }, [pathname]);

  return (
    <Layout className='font-sans min-h-screen 2xl:px-36' hasSider>
      <ToastContainer />

      <Login />

      <Register />

      <MdOutlineKeyboardArrowRight
        className='sm:hidden block fixed left-4 top-[51%] cursor-pointer hover:bg-gray-200 rounded-full z-50'
        size={40}
        onClick={() => dispatch(openDrawer())}
      />

      <Drawer
        placement='left'
        className='sm:hidden block'
        closable={false}
        onClose={() => dispatch(closeDrawer())}
        open={isDrawerOpen}
        headerStyle={{ fontFamily: 'Poppins' }}
        bodyStyle={{ padding: 0, margin: 0 }}
        contentWrapperStyle={{ width: 'auto', height: 'auto' }}
      >
        <Nav additionalProps='w-72' isDrawer />
      </Drawer>

      <Sider breakpoint='xl' className='bg-inherit sm:block hidden z-10' width={270}>
        <Nav additionalProps='bg-inherit border-none' />
      </Sider>

      <Layout className='border-x border-gray-700 py-[1.20rem] xl:px-12 px-4'>
        <Content>{children}</Content>
      </Layout>

      <Sider className='bg-inherit lg:block hidden py-[1.20rem] xl:px-12 px-4 z-10' width={450}>
        {getSider()}
      </Sider>
    </Layout>
  );
};

export default AppLayout;
