import Head from 'next/head';
import type { NextPage } from 'next';
import { useDispatch } from 'react-redux';
import { Button, Space } from 'antd';
import { openRegisterModal } from '../store/registerModalSlice';
import { openLoginModal } from '../store/loginModalSlice';

const Fallback: NextPage = () => {
  const dispatch = useDispatch();

  return (
    <div>
      <Head>
        <title>Create Next App</title>
        <link href='/favicon.ico' rel='icon' />
      </Head>

      <main>
        <Space className='absolute top-0 left-0 right-0 bottom-0 flex justify-center'>
          <Button
            className='h-10 mx-2 !bg-gray-200 border-gray-200 !text-black rounded-lg uppercase'
            onClick={() => dispatch(openRegisterModal())}
          >
            Signup
          </Button>

          <Button
            className='h-10 uppercase border-white rounded-lg'
            onClick={() => dispatch(openLoginModal())}
          >
            Signin
          </Button>
        </Space>
      </main>
    </div>
  );
};

export default Fallback;
