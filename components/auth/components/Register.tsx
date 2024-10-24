import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Form, Input, Button, Checkbox, DatePicker, Upload, Modal, Divider } from 'antd';
import {
  EyeInvisibleOutlined,
  EyeTwoTone,
  LockOutlined,
  UploadOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { MdOutlineAlternateEmail } from 'react-icons/md';
import { register } from 'request/auth';
import { useModalStore } from 'store/hooks';
import { errorNotification, successNotification, warningNotification } from 'utils/notification';
import { queryKeys } from 'utils';
import { AUTH, NOTIFICATION } from 'constants/queryKeys';
import { MODALS } from 'constants/reduxKeys';

const Register: React.FC = () => {
  const router = useRouter();

  const { isOpen: isRegisterModalOpen, closeModal: closeRegisterModal } = useModalStore(
    MODALS.REGISTER_MODAL,
  );

  const { openModal: openLoginModal } = useModalStore(MODALS.LOGIN_MODAL);

  const queryClient = useQueryClient();

  const [form] = Form.useForm();

  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const fileUploadOptions = {
    maxCount: 1,
    multiple: false,
    showUploadList: true,
    beforeUpload: (file: File) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        warningNotification(`${file.name} is not an image file`);
        return isImage || Upload.LIST_IGNORE;
      }
      if (file) setSelectedImage(file);

      return false;
    },
    onRemove: () => setSelectedImage(null),
  };

  const handleRegister = useMutation(
    (formValues: { [x: string]: any }) => {
      // * avoid append if formvalue is empty
      const formData = new FormData();

      Object.keys(formValues).forEach((key) => {
        if (formValues[key]) formData.append(key, formValues[key]);
      });

      if (selectedImage) formData.append('image', selectedImage);

      return register(formData);
    },
    {
      onSuccess: (res) => {
        successNotification(res.message);
        form.resetFields();
        closeRegisterModal();
        queryClient.refetchQueries(queryKeys(AUTH).all);
        queryClient.refetchQueries(queryKeys(NOTIFICATION).all);
        router.push('/profile');
      },
      onError: errorNotification,
    },
  );

  return (
    <Modal
      centered
      destroyOnClose
      className='font-sans'
      open={isRegisterModalOpen}
      onCancel={closeRegisterModal}
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
          delete values?.confirmPassword;

          handleRegister.mutate({
            ...values,
            dateOfBirth: values.dateOfBirth._d.toString(),
          });
        }}
      >
        <Form.Item
          label='Full Name'
          name='name'
          rules={[{ required: true, message: 'Please input your fullname!' }]}
        >
          <Input
            className='rounded-lg p-3'
            placeholder='Full Name'
            prefix={<UserOutlined className='text-zinc-400 mr-2' />}
          />
        </Form.Item>

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

        <Form.Item
          label='Confirm Password'
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
                <EyeTwoTone className='text-zinc-400' />
              ) : (
                <EyeInvisibleOutlined className='text-zinc-400' />
              )
            }
            placeholder='Confirm Password'
            prefix={<LockOutlined className='text-zinc-400 mr-2' />}
            type='password'
          />
        </Form.Item>

        <div className='w-full grid grid-cols-5'>
          <Form.Item className='sm:col-span-2 col-span-full' label='Display Picture'>
            <Upload {...fileUploadOptions}>
              <Button className='rounded-lg flex items-center h-12' icon={<UploadOutlined />}>
                Click to Upload
              </Button>
            </Upload>
          </Form.Item>

          <Form.Item
            className='sm:col-span-3 col-span-full'
            label='Date of Birth'
            name='dateOfBirth'
            rules={[
              {
                required: true,
                message: 'Please input your Date of birth!',
              },
            ]}
          >
            <DatePicker className='rounded-lg p-3 w-full' />
          </Form.Item>
        </div>

        <div className='mb-[24px] min-h-[32px] relative flex items-center'>
          <Form.Item valuePropName='checked' name='rememberCredential' noStyle>
            <Checkbox>Remember me</Checkbox>
          </Form.Item>

          <Link href='/auth/reset-password' passHref={true}>
            <a className='absolute right-0 no-underline text-[#1890ff] hover:text-blue-600'>
              Forgot password
            </a>
          </Link>
        </div>

        <Form.Item>
          <Button
            type='primary'
            className='w-full h-[3.2rem] rounded-lg text-base text-white'
            htmlType='submit'
            loading={handleRegister.isLoading}
          >
            Signup Now
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
            Already have an account?{' '}
            <label
              className='text-[#1890ff] cursor-pointer'
              onClick={() => {
                openLoginModal();
                closeRegisterModal();
              }}
            >
              Login
            </label>
          </span>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default Register;
