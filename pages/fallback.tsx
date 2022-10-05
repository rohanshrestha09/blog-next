import Head from 'next/head';
import type { NextPage } from 'next';
import { useDispatch } from 'react-redux';
import { Button, Space } from 'antd';
import { openModal } from '../store/modalSlice';
import { MODAL_KEYS } from '../constants/reduxKeys';

const { LOGIN, REGISTER } = MODAL_KEYS;

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
            onClick={() => dispatch(openModal({ key: REGISTER }))}
          >
            Signup
          </Button>

          <Button
            type='primary'
            className='h-10 uppercase rounded-lg bg-[#057AFF]'
            onClick={() => dispatch(openModal({ key: LOGIN }))}
          >
            Signin
          </Button>
        </Space>
      </main>
    </div>
  );
};

export default Fallback;
