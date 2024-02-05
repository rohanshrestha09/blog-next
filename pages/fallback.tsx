import Head from 'next/head';
import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { Button, Space } from 'antd';
import { closeModal, openModal } from '../store/modalSlice';
import { MODAL_KEYS } from '../constants/reduxKeys';

const { LOGIN_MODAL, REGISTER_MODAL } = MODAL_KEYS;

const Fallback = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(openModal({ key: LOGIN_MODAL }));

    return () => {
      dispatch(closeModal({ key: LOGIN_MODAL }));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className='h-full'>
      <Head>
        <title>Login / Register</title>
        <link href='/favicon.ico' rel='icon' />
      </Head>

      <main className='h-full flex justify-center items-center'>
        <Space>
          <Button
            className='h-10 mx-2 btn-secondary rounded-lg uppercase'
            onClick={() => dispatch(openModal({ key: REGISTER_MODAL }))}
          >
            Signup
          </Button>

          <Button
            type='primary'
            className='h-10 uppercase rounded-lg'
            onClick={() => dispatch(openModal({ key: LOGIN_MODAL }))}
          >
            Signin
          </Button>
        </Space>
      </main>
    </div>
  );
};

export default Fallback;
