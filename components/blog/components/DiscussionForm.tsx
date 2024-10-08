import Image from 'next/image';
import { Avatar, Comment, Form, Input } from 'antd';
import { useAuth } from 'auth';

interface Props {
  onSubmit: (content: string) => void;
}

export const DiscussionForm: React.FC<Props> = ({ onSubmit }) => {
  const [form] = Form.useForm();

  const { authUser } = useAuth();

  return (
    <Comment
      className='mt-3'
      avatar={
        authUser?.image ? (
          <Avatar
            src={
              <Image alt='' className='object-cover' src={authUser.image} layout='fill' priority />
            }
          />
        ) : (
          <Avatar className='bg-[#1890ff]'>{authUser?.name[0]}</Avatar>
        )
      }
      content={
        <Form form={form} requiredMark={false}>
          <Form.Item
            className='mb-0'
            name='content'
            rules={[{ required: true, message: 'Write something' }]}
          >
            <Input.TextArea
              className='rounded-lg py-2'
              placeholder='Write a comment...'
              onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
              onPressEnter={() =>
                form.validateFields().then(async (values) => {
                  onSubmit(values?.content);
                  form.resetFields();
                })
              }
              autoSize
            />
          </Form.Item>
        </Form>
      }
    />
  );
};
