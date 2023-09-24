import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import moment from 'moment';
import { Button, DatePicker, Form, Input, Modal, Upload } from 'antd';
import { UserOutlined, UploadOutlined, InfoCircleOutlined, LinkOutlined } from '@ant-design/icons';
import { MdOutlineAlternateEmail } from 'react-icons/md';
import { useAuth } from 'auth';
import PasswordAuth from './PasswordAuth';
import { deleteProfileImage, updateProfile } from 'api/auth';
import { closeModal, openModal } from 'store/modalSlice';
import { errorNotification, successNotification, warningNotification } from 'utils/notification';
import { MODAL_KEYS } from 'constants/reduxKeys';
import { AUTH, BLOG } from 'constants/queryKeys';

const { EDIT_PROFILE_MODAL, PASSWORD_AUTH_MODAL, COMPLETE_PROFILE_MODAL } = MODAL_KEYS;

const EditProfile = () => {
  const {
    isOpen: { [EDIT_PROFILE_MODAL]: isOpen },
  } = useSelector((state: RootState) => state.modal);

  const dispatch = useDispatch();

  const queryClient = useQueryClient();

  const { authUser } = useAuth();

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

  const handleDeletePicture = useMutation(deleteProfileImage, {
    onSuccess: (res) => {
      successNotification(res.message);
      queryClient.refetchQueries([AUTH]);
    },
    onError: errorNotification,
  });

  const handleEditProfile = useMutation(
    (formValues: any) => {
      // * avoid append if formvalue is empty
      const formData = new FormData();

      Object.keys(formValues).forEach((key) => {
        if (formValues[key]) formData.append(key, formValues[key]);
      });

      if (selectedImage) formData.append('image', selectedImage);

      return updateProfile(formData);
    },
    {
      onSuccess: (res) => {
        successNotification(res.message);
        queryClient.refetchQueries([AUTH]);
        queryClient.refetchQueries([BLOG]);
        dispatch(closeModal({ key: EDIT_PROFILE_MODAL }));
        dispatch(closeModal({ key: PASSWORD_AUTH_MODAL }));
      },
      onError: errorNotification,
    },
  );

  return (
    <Modal
      centered
      destroyOnClose
      className='font-sans'
      open={isOpen}
      onCancel={() => dispatch(closeModal({ key: EDIT_PROFILE_MODAL }))}
      footer={null}
    >
      <Form
        autoComplete='off'
        form={form}
        initialValues={{ remember: true }}
        layout='vertical'
        name='form_in_modal'
        requiredMark={false}
        onFinish={() => dispatch(openModal({ key: PASSWORD_AUTH_MODAL }))}
      >
        <Form.Item
          label='Full Name'
          name='fullname'
          initialValue={authUser?.name}
          rules={[{ required: true, message: 'Please input your fullname!' }]}
        >
          <Input
            className='rounded-lg p-3'
            placeholder='Full Name'
            prefix={<UserOutlined className='text-gray-600 mr-2' />}
          />
        </Form.Item>

        <Form.Item
          label='Email'
          name='email'
          initialValue={authUser?.email}
          rules={[{ required: true, message: 'Please input your email!' }]}
        >
          <Input
            className='rounded-lg p-3'
            placeholder='Email'
            prefix={<MdOutlineAlternateEmail className='text-gray-600 mr-2' />}
            type='email'
            disabled
          />
        </Form.Item>

        <Form.Item label='Bio' name='bio' initialValue={authUser?.bio}>
          <Input
            className='rounded-lg p-3'
            placeholder='Bio'
            prefix={<InfoCircleOutlined className='text-gray-600 mr-2' />}
          />
        </Form.Item>

        <Form.Item label='Website' name='website' initialValue={authUser?.website}>
          <Input
            className='rounded-lg p-3'
            placeholder='Website'
            prefix={<LinkOutlined className='text-gray-600 mr-2' />}
          />
        </Form.Item>

        <div className='w-full grid grid-cols-5'>
          <Form.Item
            className='sm:col-span-2 col-span-full'
            label={
              <div className='flex items-center gap-2'>
                <span>Display Picture</span>
                <span
                  className='text-blue-500 cursor-pointer text-[0.65rem] leading-3'
                  onClick={handleDeletePicture.mutate}
                >
                  Remove
                </span>
              </div>
            }
          >
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
            initialValue={moment(authUser?.dateOfBirth, 'YYYY-MM-DD')}
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

        <Form.Item className='mb-0'>
          <div className='flex gap-4 items-center'>
            <Button
              type='primary'
              className='h-10 rounded-lg'
              htmlType='submit'
              disabled={!authUser?.isVerified}
            >
              Update
            </Button>

            {!authUser?.isVerified && (
              <Button
                type='primary'
                className='h-10 rounded-lg'
                onClick={() => dispatch(openModal({ key: COMPLETE_PROFILE_MODAL }))}
              >
                Complete Profile
              </Button>
            )}
          </div>
        </Form.Item>

        <PasswordAuth
          isLoading={handleEditProfile.isLoading}
          mutation={({ password }) =>
            handleEditProfile.mutate({
              ...form.getFieldsValue(true),
              dateOfBirth: form.getFieldValue('dateOfBirth')._d.toString(),
              password,
            })
          }
        />
      </Form>
    </Modal>
  );
};

export default EditProfile;
