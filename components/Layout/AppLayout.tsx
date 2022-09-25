import { Layout } from 'antd';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from './Login';
import NavBar from './NavBar';
import Register from './Register';
import NavDrawer from './NavDrawer';

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }): JSX.Element => {
  return (
    <Layout className='font-sans w-full min-h-screen flex items-center bg-white'>
      <NavBar />
      <NavDrawer />
      <Login />
      <Register />
      <ToastContainer />
      <Layout className='xl:px-48 w-full relative bg-inherit'>{children}</Layout>
    </Layout>
  );
};

export default AppLayout;
