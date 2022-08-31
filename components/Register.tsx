import Link from 'next/link';
import { useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Form, Input, Button, Checkbox, DatePicker, Upload, message } from 'antd';
import { CheckboxChangeEvent } from 'antd/es/checkbox';
import {
  EyeInvisibleOutlined,
  EyeTwoTone,
  LockOutlined,
  UploadOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { IRegister, IToken } from '../interface/user';
import { register } from '../api/user';
import { openSuccessNotification, openErrorNotification } from '../utils/openNotification';
import { AUTH } from '../constants/queryKeys';

const Register: React.FC = () => {
  const queryClient = useQueryClient();

  const registerModalRef = useRef<HTMLLabelElement>(null);

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
        message.error(`${file.name} is not an image file`);
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

      return register(formData);
    },
    {
      onSuccess: (res: IToken) => {
        openSuccessNotification(res.message);
        rememberMe && localStorage.setItem('token', res.token);
        form.resetFields();
        registerModalRef.current?.click();
        queryClient.refetchQueries([AUTH]);
      },
      onError: (err: Error | any) => openErrorNotification(err.response.data.message),
    }
  );

  return (
    <>
      <input className='modal-toggle' id='registerModal' type='checkbox' />
      <div className='modal'>
        <div className='modal-box relative min-h-[98%] scrollbar'>
          <label
            ref={registerModalRef}
            className='btn btn-sm btn-circle absolute right-2 top-2'
            htmlFor='registerModal'
          >
            ✕
          </label>
          <Form
            autoComplete='off'
            className='pt-3'
            form={form}
            initialValues={{ remember: true }}
            layout='vertical'
            name='normal_register'
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
              rules={[{ required: true, message: 'Please input your Fullname!' }]}
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
              rules={[
                { required: true, message: 'Please input your Password!' },
                {
                  validator: (_, value) => {
                    if (value.length < 8) {
                      return Promise.reject('Password must contain atleast 8 characters.');
                    } else {
                      return Promise.resolve();
                    }
                  },
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
                { required: true, message: 'Please input your Password!' },
                {
                  validator: (_, value) => {
                    if (value === form.getFieldValue('password')) {
                      return Promise.resolve();
                    } else {
                      return Promise.reject('Password does not match.');
                    }
                  },
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
              <Form.Item className='col-span-2' label='Display Picture'>
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
                className='col-span-3'
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
                className='w-full h-[3.2rem] rounded-lg text-base btn-primary text-white hover:text-white'
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
                  className='modal-button text-[#0579FD] cursor-pointer'
                  htmlFor='loginModal'
                  onClick={() => registerModalRef.current?.click()}
                >
                  Login
                </label>
              </span>
            </Form.Item>
          </Form>
        </div>
      </div>
    </>
  );
};

export default Register;
