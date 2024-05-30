import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import moment from 'moment';
import { Button, DatePicker, Form, Input, Modal, Upload } from 'antd';
import { UserOutlined, UploadOutlined, InfoCircleOutlined, LinkOutlined } from '@ant-design/icons';
import { MdOutlineAlternateEmail } from 'react-icons/md';
import { useAuth } from 'auth';
import PasswordAuth from './PasswordAuth';
import { deleteProfileImage, updateProfile } from 'request/auth';
import { useModalStore } from 'store/hooks';
import { errorNotification, successNotification, warningNotification } from 'utils/notification';
import { queryKeys } from 'utils';
import { MODALS } from 'constants/reduxKeys';
import { AUTH, BLOG } from 'constants/queryKeys';

const EditProfile = () => {
  const { isOpen: isEditProfileModalOpen, closeModal: closeEditProfileModal } = useModalStore(
    MODALS.EDIT_PROFILE_MODAL,
  );

  const { openModal: openPasswordAuthModal, closeModal: closePasswordAuthModal } = useModalStore(
    MODALS.PASSWORD_AUTH_MODAL,
  );

  const { openModal: openCompleteProfileModal } = useModalStore(MODALS.COMPLETE_PROFILE_MODAL);

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

  const handleDeleteProfileImage = useMutation(deleteProfileImage, {
    onSuccess: (res) => {
      successNotification(res.message);
      queryClient.refetchQueries(queryKeys(AUTH).all);
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
        queryClient.refetchQueries(queryKeys(AUTH).all);
        queryClient.refetchQueries(queryKeys(BLOG).all);
        closeEditProfileModal();
        closePasswordAuthModal();
      },
      onError: errorNotification,
    },
  );

  return (
    <Modal
      centered
      destroyOnClose
      className='font-sans'
      open={isEditProfileModalOpen}
      onCancel={closeEditProfileModal}
      footer={null}
    >
      <Form
        autoComplete='off'
        form={form}
        layout='vertical'
        name='form_in_modal'
        requiredMark={false}
        onFinish={openPasswordAuthModal}
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
            prefix={<UserOutlined className='text-zinc-400 mr-2' />}
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
            prefix={<MdOutlineAlternateEmail className='text-zinc-400 mr-2' />}
            type='email'
            disabled
          />
        </Form.Item>

        <Form.Item label='Bio' name='bio' initialValue={authUser?.bio}>
          <Input
            className='rounded-lg p-3'
            placeholder='Bio'
            prefix={<InfoCircleOutlined className='text-zinc-400 mr-2' />}
          />
        </Form.Item>

        <Form.Item label='Website' name='website' initialValue={authUser?.website}>
          <Input
            className='rounded-lg p-3'
            placeholder='Website'
            prefix={<LinkOutlined className='text-zinc-400 mr-2' />}
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
                  onClick={handleDeleteProfileImage.mutate}
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
              <Button type='primary' className='h-10 rounded-lg' onClick={openCompleteProfileModal}>
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
