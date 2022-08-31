import Link from 'next/link';
import { useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Form, Input, Checkbox, Button } from 'antd';
import type { CheckboxChangeEvent } from 'antd/es/checkbox';
import { UserOutlined, LockOutlined, EyeTwoTone, EyeInvisibleOutlined } from '@ant-design/icons';
import { login } from '../api/user';
import type { ILogin, IToken } from '../interface/user';
import { openSuccessNotification, openErrorNotification } from '../utils/openNotification';
import { AUTH } from '../constants/queryKeys';

const Login: React.FC = () => {
  const queryClient = useQueryClient();

  const loginModalRef = useRef<HTMLLabelElement>(null);

  const [form] = Form.useForm();

  const [rememberMe, setRememberMe] = useState<boolean>(true);

  const handleLogin = useMutation(async (data: ILogin) => login(data), {
    onSuccess(res: IToken) {
      openSuccessNotification(res.message);
      rememberMe && localStorage.setItem('token', res.token);
      form.resetFields();
      loginModalRef.current?.click();
      queryClient.refetchQueries([AUTH]);
    },
    onError(err: Error | any) {
      openErrorNotification(err.response.data.message);
    },
  });

  return (
    <>
      <input className='modal-toggle' id='loginModal' type='checkbox' />
      <div className='modal'>
        <div className='modal-box relative scrollbar'>
          <label
            ref={loginModalRef}
            className='btn btn-sm btn-circle absolute right-2 top-2'
            htmlFor='loginModal'
          >
            ✕
          </label>

          <Form
            autoComplete='off'
            className='pt-3'
            form={form}
            initialValues={{ remember: true }}
            layout='vertical'
            name='normal_login'
            requiredMark={false}
            onFinish={async () =>
              form.validateFields().then((values) => {
                handleLogin.mutate(values);
              })
            }
          >
            <Form.Item
              label='Email'
              name='email'
              rules={[{ required: true, message: 'Please input your Email!' }]}
            >
              <Input
                className='rounded-lg p-2'
                placeholder='Email'
                prefix={<UserOutlined className='text-gray-600 text-lg mr-2' />}
                type='email'
              />
            </Form.Item>

            <Form.Item
              label='Password'
              name='password'
              rules={[{ required: true, message: 'Please input your Password!' }]}
            >
              <Input.Password
                className='rounded-lg p-2'
                iconRender={(visible) =>
                  visible ? (
                    <EyeTwoTone className='text-gray-600 text-lg' />
                  ) : (
                    <EyeInvisibleOutlined className='text-gray-600 text-lg' />
                  )
                }
                placeholder='Password'
                prefix={<LockOutlined className='text-gray-600 text-lg mr-2' />}
                type='password'
              />
            </Form.Item>

            <Form.Item>
              <Form.Item name='remember' noStyle>
                <Checkbox
                  checked={rememberMe}
                  onChange={(e: CheckboxChangeEvent) => {
                    setRememberMe(e.target.checked);
                  }}
                >
                  Remember me
                </Checkbox>
              </Form.Item>

              <Link href='/' passHref={true}>
                <a className='text-[#0579FD] absolute right-0'>Forgot password</a>
              </Link>
            </Form.Item>

            <Form.Item>
              <Button
                className='w-full h-[3.2rem] rounded-lg text-base btn-primary text-white hover:text-white'
                htmlType='submit'
                loading={handleLogin.isLoading}
              >
                Login
              </Button>
            </Form.Item>

            <Form.Item className='flex justify-center mb-0'>
              <span>
                Don&apos;t have an account?{' '}
                <label
                  className='modal-button text-[#0579FD] cursor-pointer'
                  htmlFor='registerModal'
                  onClick={() => loginModalRef.current?.click()}
                >
                  Create One
                </label>
              </span>
            </Form.Item>
          </Form>
        </div>
      </div>
    </>
  );
};

export default Login;
