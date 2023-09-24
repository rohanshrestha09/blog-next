import { useDispatch, useSelector } from 'react-redux';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal, Form, Input, Button } from 'antd';
import { EyeTwoTone, EyeInvisibleOutlined, LockOutlined } from '@ant-design/icons';
import { closeModal } from 'store/modalSlice';
import { completeProfile } from 'api/auth';
import { errorNotification, successNotification } from 'utils/notification';
import { AUTH } from 'constants/queryKeys';
import { MODAL_KEYS } from 'constants/reduxKeys';

const { COMPLETE_PROFILE_MODAL } = MODAL_KEYS;

const CompleteProfile: React.FC = () => {
  const dispatch = useDispatch();

  const {
    isOpen: { [COMPLETE_PROFILE_MODAL]: isOpen },
  } = useSelector((state: RootState) => state.modal);

  const queryClient = useQueryClient();

  const [form] = Form.useForm();

  const handleCompleteAuth = useMutation(completeProfile, {
    onSuccess: (res) => {
      successNotification(res.message);
      queryClient.refetchQueries([AUTH]);
      dispatch(closeModal({ key: COMPLETE_PROFILE_MODAL }));
      form.resetFields();
    },
    onError: errorNotification,
  });

  return (
    <Modal
      centered
      destroyOnClose
      className='font-sans'
      open={isOpen}
      onCancel={() => dispatch(closeModal({ key: COMPLETE_PROFILE_MODAL }))}
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
