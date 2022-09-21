import { Layout } from 'antd';
import Login from './Login';
import NavBar from './NavBar';
import Register from './Register';
import NavDrawer from './NavDrawer';

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }): JSX.Element => {
  return (
    <Layout className='font-sans w-full min-h-screen flex items-center' data-theme='winter'>
      <NavBar />
      <Layout className='xl:px-48 w-full relative bg-inherit' data-theme='winter'>
        <NavDrawer />
        <Login />
        <Register />
        {children}
      </Layout>
    </Layout>
  );
};

export default AppLayout;
