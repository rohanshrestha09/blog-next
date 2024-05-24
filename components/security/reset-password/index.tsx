import Head from 'next/head';
import Image from 'next/image';
import { Fragment, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useMutation } from '@tanstack/react-query';
import 'antd/dist/antd.min.css';
import { Form, Input, Button, Result, Spin } from 'antd';
import { AxiosError } from 'axios';
import { MdOutlineAlternateEmail } from 'react-icons/md';
import { sendResetPasswordLink } from 'request/security';
import { closeModal } from 'store/modalSlice';
import { closeDrawer } from 'store/drawerSlice';
import ForgotPassword from 'public/forgot-password.png';
import { MODAL_KEYS } from 'constants/reduxKeys';

const { LOGIN_MODAL, REGISTER_MODAL } = MODAL_KEYS;

const ResetPassword = () => {
  const dispatch = useDispatch();

  const [form] = Form.useForm();

  const handleSendEmail = useMutation(sendResetPasswordLink, {
    onSuccess: () => {
      form.resetFields();
    },
    onError: (_err: AxiosError<{ message: string }>) => {},
  });

  useEffect(() => {
    dispatch(closeModal({ key: LOGIN_MODAL }));
    dispatch(closeModal({ key: REGISTER_MODAL }));
    dispatch(closeDrawer());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className='font-sans bg-[#DFF6E5] w-full h-screen flex justify-center items-center'>
      <Head>
        <title>Reset Password | BlogSansar</title>
        <link href='/favicon.ico' rel='icon' />
      </Head>

      <main className='sm:h-[80vh] h-screen w-[55rem] flex items-center justify-center p-6 bg-white shadow-lg rounded-lg'>
        {handleSendEmail.isIdle && (
          <Fragment>
            <span className='sm:block hidden relative w-1/2 h-[28rem] object-cover'>
              <Image src={ForgotPassword} alt='' layout='fill' quality={100} priority />
            </span>

            <div className='sm:w-1/2 w-full flex flex-col items-center sm:gap-3 gap-5'>
              <h1 className='font-shalimar text-7xl font-semibold leading-[0.5]'>BlogSansar</h1>

              <p className='text-xl font-semibold'>Forgot Password?</p>

              <p className='text-center'>
                Enter your email and we&apos;ll send you a link to get back into your account
              </p>

              <Form
                className='w-full'
                form={form}
                layout='vertical'
                onFinish={() =>
                  form.validateFields().then((values) => handleSendEmail.mutate(values))
                }
              >
                <Form.Item
                  className='w-full'
                  name='email'
                  rules={[{ required: true, message: 'Please input your email!' }]}
                >
                  <Input
                    className='rounded-lg p-3'
                    placeholder='Email'
                    prefix={<MdOutlineAlternateEmail className='text-zinc-400 mr-2' />}
                    type='email'
                  />
                </Form.Item>

                <Form.Item className='mb-2'>
                  <Button
                    className='h-12 w-full sm:bg-[#93E3AB] bg-[#191C25] !border-none sm:!text-black !text-white rounded-lg'
                    htmlType='submit'
                  >
                    Send Verification
                  </Button>
                </Form.Item>

                <Form.Item className='flex justify-center mb-0'>
                  <span>
                    You remember your password?{' '}
                    <span
                      className='text-[#0579FD] cursor-pointer'
                      onClick={() => (window.location.href = window.location.origin)}
                    >
                      Login
                    </span>
                  </span>
                </Form.Item>
              </Form>
            </div>
          </Fragment>
        )}

        {handleSendEmail.isSuccess && (
          <Result
            className='mb-10'
            status='success'
            title='Password Reset Link Sent Successfully'
            subTitle={
              <div className='flex flex-col items-center'>
                <span className='flex sm:flex-row flex-col'>
                  Check for the reset link at&nbsp;
                  <p className='text-stone-600 font-semibold'>{handleSendEmail.variables?.email}</p>
                </span>
                Also don&apos;t forget to check spams. Might as well wait a few minute.
              </div>
            }
            extra={[
              <Button
                key='home'
                className='rounded-lg'
                type='primary'
                onClick={() => (window.location.href = window.location.origin)}
              >
                Go Home
              </Button>,
              <Button key='tryAgain' className='rounded-lg' onClick={() => handleSendEmail.reset()}>
                Try Again
              </Button>,
            ]}
          />
        )}

        {handleSendEmail.isError && (
          <Result
            status='500'
            title={`${handleSendEmail.error.response?.data?.message ?? '500'}`}
            subTitle='Sorry, something went wrong.'
            extra={[
              <Button
                key='home'
                className='rounded-lg'
                type='primary'
                onClick={() => (window.location.href = `${process.env.NEXT_PUBLIC_BASE_URL}`)}
              >
                Go Home
              </Button>,
              <Button key='tryAgain' className='rounded-lg' onClick={() => handleSendEmail.reset()}>
                Try Again
              </Button>,
            ]}
          />
        )}

        {handleSendEmail.isLoading && <Spin size='large' />}
      </main>
    </div>
  );
};

export default ResetPassword;
