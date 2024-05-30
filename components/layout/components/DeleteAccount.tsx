import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Modal, Form, Input, Button } from 'antd';
import {
  CheckCircleOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
  LockOutlined,
} from '@ant-design/icons';
import ConfirmDelete from 'components/common/ConfirmDelete';
import { deleteProfile } from 'request/auth';
import { useModalStore } from 'store/hooks';
import { errorNotification, successNotification } from 'utils/notification';
import { MODALS } from 'constants/reduxKeys';

const DeleteAccount: React.FC = () => {
  const { isOpen: isDeleteAccountModalOpen, closeModal: closeDeleteAccountModal } = useModalStore(
    MODALS.DELETE_ACCOUNT_MODAL,
  );

  const { openModal: openDeleteModal } = useModalStore(MODALS.DELETE_MODAL);

  const [isConfirmed, setIsConfirmed] = useState('');

  const [form] = Form.useForm();

  const handleDeleteAccount = useMutation(deleteProfile, {
    onSuccess: (res) => {
      successNotification(res.message);
      closeDeleteAccountModal();
      localStorage.clear();
      window.location.reload();
    },
    onError: errorNotification,
  });

  return (
    <Modal
      centered
      destroyOnClose
      className='font-sans'
      open={isDeleteAccountModalOpen}
      onCancel={closeDeleteAccountModal}
      afterClose={() => {
        form.resetFields();
        setIsConfirmed('');
      }}
      footer={null}
    >
      <Form
        autoComplete='off'
        form={form}
        layout='vertical'
        name='form_in_modal'
        requiredMark={false}
        onFinish={openDeleteModal}
      >
        <Form.Item label={`Type 'CONFIRM'`} name='confirm'>
          <Input
            className='rounded-lg p-3'
            placeholder='CONFIRM'
            prefix={<CheckCircleOutlined className='text-zinc-400 mr-2' />}
            onChange={({ target: { value } }) => setIsConfirmed(value)}
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

        <Form.Item className='mb-0'>
          <Button
            disabled={isConfirmed !== 'CONFIRM'}
            type='primary'
            className='h-10 rounded-lg'
            htmlType='submit'
            danger
          >
            Delete Account
          </Button>
        </Form.Item>
      </Form>

      <ConfirmDelete
        isLoading={handleDeleteAccount.isLoading}
        deleteMutation={() => {
          const formData = new FormData();

          formData.append('password', form.getFieldValue('password'));

          handleDeleteAccount.mutate(formData);
        }}
      />
    </Modal>
  );
};

export default DeleteAccount;
