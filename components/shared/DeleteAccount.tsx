import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useMutation } from '@tanstack/react-query';
import { signOut } from 'firebase/auth';
import { Modal, Form, Input, Button } from 'antd';
import {
  CheckCircleOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
  LockOutlined,
} from '@ant-design/icons';
import { auth } from '../../utils/firebase';
import AuthAxios from '../../api/AuthAxios';
import ConfirmDelete from './ConfirmDelete';
import { closeModal, openModal } from '../../store/modalSlice';
import { MODAL_KEYS } from '../../constants/reduxKeys';
import { errorNotification, successNotification } from '../../utils/notification';

const { DELETE_ACCOUNT_MODAL, DELETE_MODAL } = MODAL_KEYS;

const DeleteAccount: React.FC = () => {
  const {
    isOpen: { [DELETE_ACCOUNT_MODAL]: isOpen },
  } = useSelector((state: RootState) => state.modal);

  const dispatch = useDispatch();

  const [isConfirmed, setIsConfirmed] = useState('');

  const [form] = Form.useForm();

  const authAxios = AuthAxios();

  const handleDeleteAccount = useMutation(
    (data: { password: string }) => authAxios.deleteUser(data),
    {
      onSuccess: (res) => {
        successNotification(res.message);
        signOut(auth);
        dispatch(closeModal({ key: DELETE_ACCOUNT_MODAL }));
        window.location.reload();
      },
      onError: (err: AxiosError) => errorNotification(err),
    }
  );

  return (
    <Modal
      centered
      destroyOnClose
      className='font-sans'
      open={isOpen}
      onCancel={() => dispatch(closeModal({ key: DELETE_ACCOUNT_MODAL }))}
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
        onFinish={() => dispatch(openModal({ key: DELETE_MODAL }))}
      >
        <Form.Item label={`Type 'CONFIRM'`} name='confirm'>
          <Input
            className='rounded-lg p-3'
            placeholder='CONFIRM'
            prefix={<CheckCircleOutlined className='text-gray-600 mr-2' />}
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
        deleteMutation={() =>
          handleDeleteAccount.mutate({ password: form.getFieldValue('password') as string })
        }
      />
    </Modal>
  );
};

export default DeleteAccount;
