import { useDispatch, useSelector } from 'react-redux';
import { Layout, Drawer, Affix } from 'antd';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { MdOutlineKeyboardArrowRight } from 'react-icons/md';
import Login from './Login';
import Register from './Register';
import Nav from '../shared/Nav';
import { closeDrawer, openDrawer } from '../../store/drawerSlice';
import type { RootState } from '../../store';

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }): JSX.Element => {
  const { Content, Sider } = Layout;

  const { isOpen: isDrawerOpen } = useSelector((state: RootState) => state.drawer);

  const dispatch = useDispatch();

  return (
    <Layout className='font-sans min-h-screen xl:px-36' hasSider>
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

      <Affix offsetTop={1}>
        <Sider breakpoint='lg' className='bg-inherit sm:block hidden' width={250}>
          <Nav additionalProps='bg-inherit border-none' />
        </Sider>
      </Affix>

      <Layout className='border-x border-gray-700 py-4 sm:px-8 px-4'>
        <Content>{children}</Content>
      </Layout>

      <Sider breakpoint='xl' className='bg-inherit xl:block hidden' width={250}>
        <Nav />
      </Sider>
    </Layout>
  );
};

export default AppLayout;
