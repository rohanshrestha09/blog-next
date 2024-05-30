import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal, Form, Input, Button } from 'antd';
import { EyeTwoTone, EyeInvisibleOutlined, LockOutlined } from '@ant-design/icons';
import { completeProfile } from 'request/auth';
import { useModalStore } from 'store/hooks';
import { errorNotification, successNotification } from 'utils/notification';
import { queryKeys } from 'utils';
import { AUTH } from 'constants/queryKeys';
import { MODALS } from 'constants/reduxKeys';

const CompleteProfile: React.FC = () => {
  const { isOpen: isCompleteProfileModalOpen, closeModal: closeCompleteProfileModal } =
    useModalStore(MODALS.COMPLETE_PROFILE_MODAL);

  const queryClient = useQueryClient();

  const [form] = Form.useForm();

  const handleCompleteAuth = useMutation(completeProfile, {
    onSuccess: (res) => {
      successNotification(res.message);
      queryClient.refetchQueries(queryKeys(AUTH).all);
      closeCompleteProfileModal();
      form.resetFields();
    },
    onError: errorNotification,
  });

  return (
    <Modal
      centered
      destroyOnClose
      className='font-sans'
      open={isCompleteProfileModalOpen}
      onCancel={closeCompleteProfileModal}
      afterClose={() => form.resetFields()}
      footer={null}
    >
      <Form
        autoComplete='off'
        form={form}
        initialValues={{ remember: true }}
        layout='vertical'
        name='completeAuth'
        requiredMark={false}
        onFinish={handleCompleteAuth.mutate}
      >
        <Form.Item
          label='New Password'
          name='password'
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
          name='confirmPassword'
          rules={[
            { required: true, message: 'Please confirm your new password!' },
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
            loading={handleCompleteAuth.isLoading}
          >
            Change Password
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CompleteProfile;
