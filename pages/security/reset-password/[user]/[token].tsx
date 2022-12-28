import { NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import { NextRouter, useRouter } from 'next/router';
import { Fragment } from 'react';
import { useMutation } from '@tanstack/react-query';
import 'antd/dist/antd.min.css';
import { Form, Input, Button, Result, Spin } from 'antd';
import { IoNavigateCircle } from 'react-icons/io5';
import SecurityAxios from '../../../../api/SecurityAxios';
import ForgotPassword from '../../../../public/forgot-password.png';
import { EyeInvisibleOutlined, EyeTwoTone, LockOutlined } from '@ant-design/icons';

const ResetPassword: NextPage = () => {
  const { query }: NextRouter = useRouter();

  const [form] = Form.useForm();

  const securityAxios = SecurityAxios();

  const handleChangePassword = useMutation(
    ({
      id,
      token,
      data,
    }: {
      id: string;
      token: string;
      data: { password: string; confirmPassword: string };
    }) => securityAxios.resetPassword({ id, token, data }),
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

      <main className='sm:h-[80vh] h-screen w-[55rem] flex items-center justify-center p-6 bg-white shadow-lg rounded-lg'>
        {handleChangePassword.isIdle && (
          <Fragment>
            <span className='sm:block hidden relative w-1/2 h-[28rem] object-cover'>
              <Image src={ForgotPassword} alt='' layout='fill' quality={100} priority />
            </span>

            <div className='sm:w-1/2 w-full flex flex-col items-center sm:gap-3 gap-5'>
              <h1 className='font-shalimar text-7xl font-semibold leading-[0.5]'>BlogSansar</h1>

              <p className='text-base'>Please enter a new password</p>

              <Form
                className='w-full'
                form={form}
                layout='vertical'
                onFinish={() =>
                  form.validateFields().then((values) =>
                    handleChangePassword.mutate({
                      id: String(query.user),
                      token: String(query.token),
                      data: values,
                    })
                  )
                }
              >
                <Form.Item
                  name='password'
                  rules={[
                    { required: true, message: 'Please input your password!' },
                    {
                      validator: (_, value) =>
                        value?.length < 8
                          ? Promise.reject('Password must contain atleast 8 characters.')
                          : Promise.resolve(),
                    },
                  ]}
                >
                  <Input.Password
                    className='rounded-lg p-3'
                    iconRender={(visible) =>
                      visible ? (
                        <EyeTwoTone className='text-gray-600' />
                      ) : (
                        <EyeInvisibleOutlined className='text-gray-600' />
                      )
                    }
                    placeholder='Password'
                    prefix={<LockOutlined className='text-gray-600 mr-2' />}
                    type='password'
                  />
                </Form.Item>

                <Form.Item
                  name='confirmPassword'
                  rules={[
                    { required: true, message: 'Please input your password!' },
                    {
                      validator: (_, value) =>
                        value === form.getFieldValue('password')
                          ? Promise.resolve()
                          : Promise.reject('Password does not match.'),
                    },
                  ]}
                >
                  <Input.Password
                    className='rounded-lg p-3'
                    iconRender={(visible) =>
                      visible ? (
                        <EyeTwoTone className='text-gray-600' />
                      ) : (
                        <EyeInvisibleOutlined className='text-gray-600' />
                      )
                    }
                    placeholder='Confirm Password'
                    prefix={<LockOutlined className='text-gray-600 mr-2' />}
                    type='password'
                  />
                </Form.Item>

                <Form.Item className='mb-2'>
                  <Button
                    className='h-12 w-full sm:bg-[#93E3AB] bg-[#191C25] !border-none sm:!text-black !text-white rounded-lg'
                    htmlType='submit'
                  >
                    Confirm
                  </Button>
                </Form.Item>

                <Form.Item className='flex justify-center mb-0'>
                  <span
                    className='text-[#0579FD] flex items-center gap-1 cursor-pointer'
                    onClick={() => (window.location.href = window.location.origin)}
                  >
                    Continue to BlogSansar <IoNavigateCircle size={18} />
                  </span>
                </Form.Item>
              </Form>
            </div>
          </Fragment>
        )}

        {handleChangePassword.isSuccess && (
          <Result
            className='mb-10'
            status='success'
            title='Password Reset Successful'
            extra={[
              <Button
                key='home'
                className='rounded-lg'
                type='primary'
                onClick={() => (window.location.href = window.location.origin)}
              >
                Go Home
              </Button>,
            ]}
          />
        )}

        {handleChangePassword.isError && (
          <Result
            status='500'
            title={`${handleChangePassword.error.response?.data?.message ?? '500'}`}
            subTitle='Sorry, something went wrong.'
            extra={[
              <Button
                key='home'
                className='rounded-lg'
                type='primary'
                onClick={() => (window.location.href = window.location.origin)}
              >
                Go Home
              </Button>,
              <Button
                key='tryAgain'
                className='rounded-lg'
                onClick={() => handleChangePassword.reset()}
              >
                Try Again
              </Button>,
            ]}
          />
        )}

        {handleChangePassword.isLoading && <Spin size='large' />}
      </main>
    </div>
  );
};

export default ResetPassword;
