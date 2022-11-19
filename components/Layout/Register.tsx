import Link from 'next/link';
import { NextRouter, useRouter } from 'next/router';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Form, Input, Button, Checkbox, DatePicker, Upload, Modal } from 'antd';
import type { CheckboxChangeEvent } from 'antd/es/checkbox';
import {
  EyeInvisibleOutlined,
  EyeTwoTone,
  LockOutlined,
  UploadOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { openModal, closeModal } from '../../store/modalSlice';
import {
  errorNotification,
  successNotification,
  warningNotification,
} from '../../utils/notification';
import UserAxios from '../../api/UserAxios';
import { AUTH } from '../../constants/queryKeys';
import { MODAL_KEYS } from '../../constants/reduxKeys';
import type { RootState } from '../../store';
import type { IRegister } from '../../interface/user';

const { LOGIN_MODAL, REGISTER_MODAL } = MODAL_KEYS;

const Register: React.FC = () => {
  const router: NextRouter = useRouter();

  const {
    isOpen: { [REGISTER_MODAL]: isOpen },
  } = useSelector((state: RootState) => state.modal);

  const dispatch = useDispatch();

  const queryClient = useQueryClient();

  const [form] = Form.useForm();

  const [rememberMe, setRememberMe] = useState<boolean>(true);

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
    (formValues: IRegister | any) => {
      // * avoid append if formvalue is empty
      const formData = new FormData();

      Object.keys(formValues).forEach((key) => {
        if (formValues[key]) formData.append(key, formValues[key]);
      });

      if (selectedImage) formData.append('image', selectedImage);

      return new UserAxios().register(formData);
    },
    {
      onSuccess: (res) => {
        successNotification(res.message);
        form.resetFields();
        queryClient.refetchQueries([AUTH]);
        dispatch(closeModal({ key: REGISTER_MODAL }));
        router.push('/profile');
      },
      onError: (err: Error) => errorNotification(err),
    }
  );

  return (
    <Modal
      centered
      className='font-sans'
      open={isOpen}
      onCancel={() => dispatch(closeModal({ key: REGISTER_MODAL }))}
      footer={null}
    >
      <Form
        autoComplete='off'
        form={form}
        initialValues={{ remember: true }}
        layout='vertical'
        name='form_in_modal'
        requiredMark={false}
        onFinish={() =>
          form.validateFields().then((values) =>
            handleRegister.mutate({
              ...values,
              dateOfBirth: values.dateOfBirth._d.toString(),
            })
          )
        }
      >
        <Form.Item
          label='Full Name'
          name='fullname'
          rules={[{ required: true, message: 'Please input your fullname!' }]}
        >
          <Input
            className='rounded-lg p-2'
            placeholder='Full Name'
            prefix={<UserOutlined className='text-gray-600 text-lg mr-2' />}
          />
        </Form.Item>

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
          rules={[
            { required: true, message: 'Please input your password!' },
            {
              validator: (_, value) =>
                value.length < 8
                  ? Promise.reject('Password must contain atleast 8 characters.')
                  : Promise.resolve(),
            },
          ]}
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
            className='rounded-lg p-2'
            iconRender={(visible) =>
              visible ? (
                <EyeTwoTone className='text-gray-600 text-lg' />
              ) : (
                <EyeInvisibleOutlined className='text-gray-600 text-lg' />
              )
            }
            placeholder='Confirm Password'
            prefix={<LockOutlined className='text-gray-600 text-lg mr-2' />}
            type='password'
          />
        </Form.Item>

        <div className='w-full grid grid-cols-5'>
          <Form.Item className='sm:col-span-2 col-span-full' label='Display Picture'>
            <Upload {...fileUploadOptions}>
              <Button
                className='rounded-lg flex items-center h-12'
                icon={<UploadOutlined className='text-lg' />}
              >
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
            <a className='text-[#0579FD] absolute right-0'>Forgot password</a>
          </Link>
        </Form.Item>

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

        <Form.Item className='flex justify-center mb-0'>
          <span>
            Already have an account?{' '}
            <label
              className='text-[#0579FD] cursor-pointer'
              onClick={() => {
                dispatch(openModal({ key: LOGIN_MODAL }));
                dispatch(closeModal({ key: REGISTER_MODAL }));
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
