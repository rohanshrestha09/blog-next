import Link from 'next/link';
import { NextRouter, useRouter } from 'next/router';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Form, Input, Checkbox, Button, Modal } from 'antd';
import type { CheckboxChangeEvent } from 'antd/es/checkbox';
import { LockOutlined, EyeTwoTone, EyeInvisibleOutlined } from '@ant-design/icons';
import { MdOutlineAlternateEmail } from 'react-icons/md';
import { openModal, closeModal } from '../../store/modalSlice';
import { errorNotification, successNotification } from '../../utils/notification';
import UserAxios from '../../api/UserAxios';
import { AUTH } from '../../constants/queryKeys';
import { MODAL_KEYS } from '../../constants/reduxKeys';
import type { ILogin } from '../../interface/user';

const { LOGIN_MODAL, REGISTER_MODAL } = MODAL_KEYS;

const Login: React.FC = () => {
  const router: NextRouter = useRouter();

  const {
    isOpen: { [LOGIN_MODAL]: isOpen },
  } = useSelector((state: RootState) => state.modal);

  const dispatch = useDispatch();

  const queryClient = useQueryClient();

  const [form] = Form.useForm();

  const [rememberMe, setRememberMe] = useState<boolean>(true);

  const handleLogin = useMutation((data: ILogin) => new UserAxios().login(data), {
    onSuccess: (res) => {
      successNotification(res.message);
      form.resetFields();
      queryClient.refetchQueries([AUTH]);
      dispatch(closeModal({ key: LOGIN_MODAL }));
      router.push('/profile');
    },
    onError: (err: AxiosError) => errorNotification(err),
  });

  return (
    <Modal
      centered
      className='font-sans'
      open={isOpen}
      onCancel={() => dispatch(closeModal({ key: LOGIN_MODAL }))}
      footer={null}
    >
      <Form
        autoComplete='off'
        form={form}
        initialValues={{ remember: true }}
        layout='vertical'
        name='form_in_modal'
        requiredMark={false}
        onFinish={async () => form.validateFields().then((values) => handleLogin.mutate(values))}
      >
        <Form.Item
          label='Email'
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

        <Form.Item
          label='Password'
          name='password'
          rules={[{ required: true, message: 'Please input your password!' }]}
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

        <Form.Item>
          <Form.Item name='remember' noStyle>
            <Checkbox
              checked={rememberMe}
              onChange={(e: CheckboxChangeEvent) => setRememberMe(e.target.checked)}
            >
              Remember me
            </Checkbox>
          </Form.Item>

          <Link href='/' passHref={true}>
            <a className='absolute right-0 no-underline text-[#1890ff] hover:text-blue-600'>
              Forgot password
            </a>
          </Link>
        </Form.Item>

        <Form.Item>
          <Button
            type='primary'
            className='w-full h-[3.2rem] rounded-lg text-base'
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
              className='text-[#0579FD] cursor-pointer'
              onClick={() => {
                dispatch(openModal({ key: REGISTER_MODAL }));
                dispatch(closeModal({ key: LOGIN_MODAL }));
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
