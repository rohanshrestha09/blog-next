import { useDispatch, useSelector } from 'react-redux';
import { Button, Form, Input, Modal } from 'antd';
import { EyeTwoTone, EyeInvisibleOutlined, LockOutlined } from '@ant-design/icons';
import { closeModal } from '../../store/modalSlice';
import { MODAL_KEYS } from '../../constants/reduxKeys';
import { RootState } from '../../store';

interface Props {
  isLoading: boolean;
  mutation: ({ password }: { password: string }) => void;
}

const { PASSWORD_VERIFICATION } = MODAL_KEYS;

const PasswordVerification: React.FC<Props> = ({ isLoading, mutation }) => {
  const { isOpen } = useSelector((state: RootState) => state.modal);

  const dispatch = useDispatch();

  const [form] = Form.useForm();

  return (
    <Modal
      className='font-sans'
      open={isOpen[PASSWORD_VERIFICATION]}
      onCancel={() => dispatch(closeModal({ key: PASSWORD_VERIFICATION }))}
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
        onFinish={() => form.validateFields().then(({ password }) => mutation({ password }))}
      >
        <Form.Item
          label='Password'
          name='password'
          rules={[{ required: true, message: 'Please input your password!' }]}
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

        <Form.Item className='mb-0'>
          <Button type='primary' className='h-10 rounded-lg' htmlType='submit' loading={isLoading}>
            Submit
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default PasswordVerification;
