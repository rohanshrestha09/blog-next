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
            className='h-10 bg-[#021431] border-[#021431] uppercase text-white rounded-lg focus:bg-[#021431] hover:bg-[#021431]'
            onClick={() => dispatch(openRegisterModal())}
          >
            Signup
          </Button>

          <Button
            className='h-10 rounded-lg border-slate-600 uppercase'
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
