import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Form, Input, Checkbox, Button, Modal, Divider } from 'antd';
import { LockOutlined, EyeTwoTone, EyeInvisibleOutlined } from '@ant-design/icons';
import { MdOutlineAlternateEmail } from 'react-icons/md';
import { login } from 'request/auth';
import { useModalStore } from 'store/hooks';
import { errorNotification, successNotification } from 'utils/notification';
import { queryKeys } from 'utils';
import { AUTH } from 'constants/queryKeys';
import { MODALS } from 'constants/reduxKeys';

const Login: React.FC = () => {
  const router = useRouter();

  const { isOpen: isLoginModalOpen, closeModal: closeLoginModal } = useModalStore(
    MODALS.LOGIN_MODAL,
  );

  const { openModal: openRegisterModal } = useModalStore(MODALS.REGISTER_MODAL);

  const queryClient = useQueryClient();

  const [form] = Form.useForm();

  const handleLogin = useMutation(login, {
    onSuccess: (res) => {
      successNotification(res.message);
      form.resetFields();
      queryClient.refetchQueries(queryKeys(AUTH).all);
      closeLoginModal();
      router.push('/profile');
    },
    onError: errorNotification,
  });

  return (
    <Modal
      centered
      destroyOnClose
      className='font-sans'
      open={isLoginModalOpen}
      onCancel={closeLoginModal}
      footer={null}
    >
      <Form
        autoComplete='off'
        form={form}
        initialValues={{ rememberCredential: true }}
        layout='vertical'
        name='form_in_modal'
        requiredMark={false}
        onFinish={(values) => {
          if (values.rememberCredential) localStorage.setItem('rememberCredential', 'true');

          delete values?.rememberCredential;

          handleLogin.mutate(values);
        }}
      >
        <Form.Item
          label='Email'
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

        <Form.Item
          label='Password'
          name='password'
          rules={[{ required: true, message: 'Please input your password!' }]}
        >
          <Input.Password
            className='rounded-lg p-3'
            iconRender={(visible) =>
              visible ? (
                <EyeTwoTone className='text-zinc-400' />
              ) : (
                <EyeInvisibleOutlined className='text-zinc-400' />
              )
            }
            placeholder='Password'
            prefix={<LockOutlined className='text-zinc-400 mr-2' />}
            type='password'
          />
        </Form.Item>

        <div className='mb-[24px] min-h-[32px] relative flex items-center'>
          <Form.Item valuePropName='checked' name='rememberCredential' noStyle>
            <Checkbox>Remember me</Checkbox>
          </Form.Item>

          <Link href='/security/reset-password' passHref={true}>
            <a className='absolute right-0 no-underline text-[#1890ff] hover:text-blue-600'>
              Forgot password
            </a>
          </Link>
        </div>

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

        <Divider>OR</Divider>

        <Form.Item>
          <Button
            type='primary'
            className='w-full flex items-center justify-center gap-4 h-[3.2rem] rounded-lg text-base btn-secondary'
            icon={<Image alt='' src='/google.svg' height={30} width={30} />}
            onClick={() => router.push('/api/auth/google')}
          >
            Login with Google
          </Button>
        </Form.Item>

        <Form.Item className='flex justify-center mb-0'>
          <span>
            Don&apos;t have an account?{' '}
            <label
              className='text-[#1890ff] cursor-pointer'
              onClick={() => {
                openRegisterModal();
                closeLoginModal();
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
