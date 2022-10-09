import Link from 'next/link';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Form, Input, Checkbox, Button, Modal } from 'antd';
import type { CheckboxChangeEvent } from 'antd/es/checkbox';
import { UserOutlined, LockOutlined, EyeTwoTone, EyeInvisibleOutlined } from '@ant-design/icons';
import { openModal, closeModal } from '../../store/modalSlice';
import { errorNotification, successNotification } from '../../utils/notification';
import UserAxios from '../../apiAxios/userAxios';
import { AUTH } from '../../constants/queryKeys';
import { MODAL_KEYS } from '../../constants/reduxKeys';
import type { RootState } from '../../store';
import type { ILogin, IToken } from '../../interface/user';

const { LOGIN_MODAL, REGISTER_MODAL } = MODAL_KEYS;

const Login: React.FC = () => {
  const { isOpen } = useSelector((state: RootState) => state.modal);

  const dispatch = useDispatch();

  const queryClient = useQueryClient();

  const [form] = Form.useForm();

  const [rememberMe, setRememberMe] = useState<boolean>(true);

  const handleLogin = useMutation(async (data: ILogin) => new UserAxios().login(data), {
    onSuccess(res: IToken) {
      successNotification(res.message);
      form.resetFields();
      queryClient.refetchQueries([AUTH]);
      dispatch(closeModal({ key: LOGIN_MODAL }));
    },
    onError(err: Error) {
      errorNotification(err);
    },
  });

  return (
    <Modal
      centered
      className='font-sans'
      open={isOpen[LOGIN_MODAL]}
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
            className='rounded-lg p-2'
            placeholder='Email'
            prefix={<UserOutlined className='text-gray-600 text-lg mr-2' />}
            type='email'
          />
        </Form.Item>

        <Form.Item
          label='Password'
          name='password'
          rules={[{ required: true, message: 'Please input your password!' }]}
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
