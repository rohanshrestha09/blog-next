import { useDispatch, useSelector } from 'react-redux';
import { Form, Modal, Input, Button } from 'antd';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { EyeInvisibleOutlined, EyeTwoTone, LockOutlined } from '@ant-design/icons';
import { closeModal } from '../../store/modalSlice';
import { MODAL_KEYS } from '../../constants/reduxKeys';
import SecurityAxios from '../../api/SecurityAxios';
import { errorNotification, successNotification } from '../../utils/notification';
import { AUTH } from '../../constants/queryKeys';

const { CHANGE_PASSWORD_MODAL } = MODAL_KEYS;

const ChangePassword: React.FC = () => {
  const {
    isOpen: { [CHANGE_PASSWORD_MODAL]: isOpen },
  } = useSelector((state: RootState) => state.modal);

  const dispatch = useDispatch();

  const [form] = Form.useForm();

  const queryClient = useQueryClient();

  const securityAxios = SecurityAxios();

  const handleChangePassword = useMutation(
    (data: { password: string; newPassword: string; confirmNewPassword: string }) =>
      securityAxios.changePassword(data),
    {
      onSuccess: (res) => {
        successNotification(res.message);
        queryClient.refetchQueries([AUTH]);
        dispatch(closeModal({ key: CHANGE_PASSWORD_MODAL }));
        form.resetFields();
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
      onCancel={() => dispatch(closeModal({ key: CHANGE_PASSWORD_MODAL }))}
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
        onFinish={(values) => handleChangePassword.mutate(values)}
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
