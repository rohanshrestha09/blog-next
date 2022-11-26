import { NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import { Fragment } from 'react';
import { useMutation } from '@tanstack/react-query';
import 'antd/dist/antd.min.css';
import { Form, Input, Button, Result, Spin } from 'antd';
import { IoNavigateCircle } from 'react-icons/io5';
import { MdOutlineAlternateEmail } from 'react-icons/md';
import SecurityAxios from '../../../api/SecurityAxios';
import ForgotPassword from '../../../public/forgot-password.png';

const ResetPassword: NextPage = () => {
  const [form] = Form.useForm();

  const securityAxios = new SecurityAxios();

  const handleSendEmail = useMutation(
    ({ email }: { email: string }) => securityAxios.sendResetPasswordLink({ email }),
    {
      onSuccess: () => {
        form.resetFields();
      },
      onError: (_err: AxiosError) => {},
    }
  );

  return (
    <div className='font-sans bg-[#DFF6E5] w-full h-screen flex justify-center items-center'>
      <Head>
        <title>Reset Password | BlogSansar</title>
        <link href='/favicon.ico' rel='icon' />
      </Head>

      <main className='h-[80vh] w-[55rem] flex items-center justify-center p-6 bg-white shadow-lg rounded-lg'>
        {handleSendEmail.isIdle && (
          <Fragment>
            <span className='relative w-1/2 h-[28rem] object-cover'>
              <Image src={ForgotPassword} alt='' layout='fill' quality={100} priority />
            </span>

            <div className='w-1/2 flex flex-col items-center gap-3'>
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
                    prefix={<MdOutlineAlternateEmail className='text-gray-600 mr-2' />}
                    type='email'
                  />
                </Form.Item>

                <Form.Item className='mb-2'>
                  <Button
                    className='h-12 w-full bg-[#93E3AB] !border-none !text-black rounded-lg'
                    htmlType='submit'
                  >
                    Send Verification
                  </Button>
                </Form.Item>

                <Form.Item className='flex justify-center mb-0'>
                  <span className='text-[#0579FD] flex items-center gap-1 cursor-pointer'>
                    Continue to BlogSansar <IoNavigateCircle size={18} />
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
              <span className='inline-flex'>
                Check for the reset link at&nbsp;
                <p className='text-stone-600 font-semibold'>{handleSendEmail.variables?.email}</p>.
                Also don&apos;t forget to check spams.
              </span>
            }
            extra={[
              <Button key='console' className='rounded-lg' type='primary'>
                Go Home
              </Button>,
              <Button key='buy' className='rounded-lg' onClick={() => handleSendEmail.reset()}>
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
              <Button key='console' className='rounded-lg' type='primary'>
                Go Home
              </Button>,
              <Button key='buy' className='rounded-lg' onClick={() => handleSendEmail.reset()}>
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
