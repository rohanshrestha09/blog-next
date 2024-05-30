import { Form, Modal, Input, Button } from 'antd';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { EyeInvisibleOutlined, EyeTwoTone, LockOutlined } from '@ant-design/icons';
import { changePassword } from 'request/security';
import { useModalStore } from 'store/hooks';
import { errorNotification, successNotification } from 'utils/notification';
import { queryKeys } from 'utils';
import { MODALS } from 'constants/reduxKeys';
import { AUTH } from 'constants/queryKeys';

const ChangePassword: React.FC = () => {
  const { isOpen: isChangePasswordModalOpen, closeModal: closeChangePasswordModal } = useModalStore(
    MODALS.CHANGE_PASSWORD_MODAL,
  );

  const [form] = Form.useForm();

  const queryClient = useQueryClient();

  const handleChangePassword = useMutation(changePassword, {
    onSuccess: (res) => {
      successNotification(res.message);
      queryClient.refetchQueries(queryKeys(AUTH).all);
      closeChangePasswordModal();
      form.resetFields();
    },
    onError: errorNotification,
  });

  return (
    <Modal
      centered
      destroyOnClose
      className='font-sans'
      open={isChangePasswordModalOpen}
      onCancel={closeChangePasswordModal}
      afterClose={() => form.resetFields()}
      footer={null}
    >
      <Form
        autoComplete='off'
        form={form}
        initialValues={{ remember: true }}
        layout='vertical'
        name='form_in_modal'
        requiredMark={false}
        onFinish={handleChangePassword.mutate}
      >
        <Form.Item
          label='Current Password'
          name='password'
          rules={[{ required: true, message: 'Please input your current password!' }]}
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
          label='New Password'
          name='newPassword'
          rules={[
            { required: true, message: 'Please input your new password!' },
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
          name='confirmNewPassword'
          rules={[
            { required: true, message: 'Please confirm your new password!' },
            {
              validator: (_, value) =>
                value === form.getFieldValue('newPassword')
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
            placeholder='Password'
            prefix={<LockOutlined className='text-zinc-400 mr-2' />}
            type='password'
          />
        </Form.Item>

        <Form.Item className='mb-0'>
          <Button
            type='primary'
            className='h-10 rounded-lg'
            htmlType='submit'
            loading={handleChangePassword.isLoading}
          >
            Change Password
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ChangePassword;
