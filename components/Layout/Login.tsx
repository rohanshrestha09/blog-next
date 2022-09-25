import Link from 'next/link';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Form, Input, Checkbox, Button, Modal } from 'antd';
import type { CheckboxChangeEvent } from 'antd/es/checkbox';
import { UserOutlined, LockOutlined, EyeTwoTone, EyeInvisibleOutlined } from '@ant-design/icons';
import { closeLoginModal } from '../../store/loginModalSlice';
import { openRegisterModal } from '../../store/registerModalSlice';
import { errorNotification, successNotification } from '../../utils/notification';
import UserAxios from '../../apiAxios/userAxios';
import { AUTH } from '../../constants/queryKeys';
import type { RootState } from '../../store';
import type { ILogin, IToken } from '../../interface/user';

const Login: React.FC = () => {
  const { isOpen: isLoginModalOpen } = useSelector((state: RootState) => state.loginModal);

  const dispatch = useDispatch();

  const queryClient = useQueryClient();

  const [form] = Form.useForm();

  const [rememberMe, setRememberMe] = useState<boolean>(true);

  const handleLogin = useMutation(async (data: ILogin) => new UserAxios().login(data), {
    onSuccess(res: IToken) {
      successNotification(res.message);
      form.resetFields();
      queryClient.refetchQueries([AUTH]);
      dispatch(closeLoginModal());
    },
    onError(err: Error) {
      errorNotification(err);
    },
  });

  return (
    <Modal
      centered
      className='font-sans'
      open={isLoginModalOpen}
      onCancel={() => dispatch(closeLoginModal())}
      destroyOnClose
      footer={null}
    >
      <Form
        autoComplete='off'
        form={form}
        initialValues={{ remember: true }}
        layout='vertical'
        name='form_in_modal'
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
            type='primary'
            className='w-full h-[3.2rem] bg-[#057AFF] rounded-lg text-base'
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
              onClick={() => {
                dispatch(openRegisterModal());
                dispatch(closeLoginModal());
              }}
            >
              Create One
            </label>
          </span>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default Login;
