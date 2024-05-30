import { Button, Form, Input, Modal } from 'antd';
import { EyeTwoTone, EyeInvisibleOutlined, LockOutlined } from '@ant-design/icons';
import { useModalStore } from 'store/hooks';
import { MODALS } from 'constants/reduxKeys';

interface Props {
  isLoading: boolean;
  mutation: ({ password }: { password: string }) => void;
}

const PasswordAuth: React.FC<Props> = ({ isLoading, mutation }) => {
  const { isOpen: isPasswordAuthModalOpen, closeModal: closePasswordAuthModal } = useModalStore(
    MODALS.PASSWORD_AUTH_MODAL,
  );

  const [form] = Form.useForm();

  return (
    <Modal
      className='font-sans'
      open={isPasswordAuthModalOpen}
      onCancel={closePasswordAuthModal}
      afterClose={() => form.resetFields()}
      footer={null}
      destroyOnClose
    >
      <Form
        autoComplete='off'
        form={form}
        layout='vertical'
        name='form_in_modal'
        requiredMark={false}
        onFinish={({ password }) => mutation({ password })}
      >
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
          <Button type='primary' className='h-10 rounded-lg' htmlType='submit' loading={isLoading}>
            Submit
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default PasswordAuth;
