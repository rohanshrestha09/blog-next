import type { GetServerSideProps, GetServerSidePropsContext, NextPage } from 'next';
import Head from 'next/head';
import { useRef, useState } from 'react';
import {
  dehydrate,
  DehydratedState,
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { Editor } from '@tinymce/tinymce-react';
import { Form, Input, Button, Upload, Select, Dropdown, Menu, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import Cookies from 'js-cookie';
import { IGetGenre, IPostBlog } from '../interface/blog';
import { getGenre, postBlog } from '../api/blog';
import { openErrorNotification, openSuccessNotification } from '../utils/openNotification';
import IMessage from '../interface/message';
import { AUTH, GET_GENRE } from '../constants/queryKeys';
import { auth } from '../api/user';

const Create: NextPage = () => {
  const queryClient = useQueryClient();

  const editorRef = useRef<any>();

  const [form] = Form.useForm();

  const { Option } = Select;

  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const [renderEditor, setRenderEditor] = useState<number>(1);

  const { data: genre, isSuccess: isGenreSuccess } = useQuery<IGetGenre['genre']>({
    queryFn: () => getGenre(),
    queryKey: [GET_GENRE],
  });

  const fileUploadOptions = {
    maxCount: 1,
    multiple: false,
    showUploadList: true,
    beforeUpload: (file: File) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error(`${file.name} is not an image file`);
        return isImage || Upload.LIST_IGNORE;
      }
      if (file) setSelectedImage(file);
      return false;
    },
    onRemove: () => setSelectedImage(null),
  };

  const handlePostBlog = useMutation(
    (formValues: IPostBlog | any) => {
      // * avoid append if formvalue is empty
      const formData = new FormData();

      Object.keys(formValues).forEach((key) => {
        // * if form value is an array
        if (Array.isArray(formValues[key])) {
          formValues[key].forEach((value: string) => {
            if (value) formData.append(key, value);
          });
          return;
        }
        if (formValues[key]) formData.append(key, formValues[key]);
      });
      if (selectedImage) formData.append('image', selectedImage);

      const cookie = Cookies.get('token') ? `token=${Cookies.get('token')}` : undefined;

      return postBlog({ cookie, data: formData });
    },
    {
      onSuccess: (res: IMessage) => {
        openSuccessNotification(res.message);
        form.resetFields();
        setSelectedImage(null);
        setRenderEditor(Math.random() * 100);
        queryClient.refetchQueries([AUTH]);
      },
      onError: (err: Error | any) => openErrorNotification(err.response.data.message),
    }
  );

  return (
    <div className='w-full flex flex-col items-center p-5 pb-0'>
      <Head>
        <title>Create a post</title>
        <link href='/favicon.ico' rel='icon' />
      </Head>

      <main className='xl:w-3/4 w-full'>
        <Form
          autoComplete='off'
          className='w-full grid grid-cols-4'
          form={form}
          initialValues={{ remember: true }}
          layout='vertical'
          name='basic'
          requiredMark={false}
        >
          <Form.Item
            className='col-span-full'
            name='title'
            rules={[{ required: true, message: 'Please input title' }]}
          >
            <Input className='rounded-lg px-4 py-2.5 placeholder:text-base' placeholder='Title' />
          </Form.Item>

          <Form.Item className='col-span-full'>
            <Editor
              key={renderEditor}
              apiKey={process.env.TINY_MCE}
              init={{
                height: 400,
                menubar: true,
                plugins: [
                  'advlist',
                  'autolink',
                  'lists',
                  'link',
                  'image',
                  'charmap',
                  'preview',
                  'anchor',
                  'searchreplace',
                  'visualblocks',
                  'code',
                  'fullscreen',
                  'insertdatetime',
                  'media',
                  'table',
                  'code',
                  'help',
                  'wordcount',
                ],
                toolbar:
                  'undo redo | blocks | ' +
                  'bold italic forecolor | alignleft aligncenter ' +
                  'alignright alignjustify | bullist numlist outdent indent | ' +
                  'removeformat | help',
                content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
              }}
              initialValue='<p>This is the initial content of the editor.</p>'
              onInit={(evt, editor) => (editorRef.current = editor)}
            />
          </Form.Item>

          <Form.Item className='w-fit'>
            <Upload {...fileUploadOptions}>
              <Button
                className='rounded-lg flex items-center py-[1.23rem] md:text-sm text-xs'
                icon={<UploadOutlined className='text-lg' />}
              >
                Upload Blog Cover
              </Button>
            </Upload>
          </Form.Item>

          <Form.Item
            className='col-span-3 md:w-full w-4/6 justify-self-end'
            name='genre'
            rules={[
              {
                required: true,
                message: 'Please select atleast a genre',
              },
              {
                validator: (_, value) => {
                  if (value.length > 5) {
                    return Promise.reject('Max 5 genre allowed.');
                  } else {
                    return Promise.resolve();
                  }
                },
              },
            ]}
          >
            <Select
              className='w-full rounded-lg'
              mode='multiple'
              placeholder='Select genre (max 5)'
              size='large'
              allowClear
            >
              {isGenreSuccess &&
                genre.map((el) => (
                  <Option key={el} value={el}>
                    {el}
                  </Option>
                ))}
            </Select>
          </Form.Item>

          <Form.Item className='col-span-full w-fit flex items-center bg-[#021431] min-h-[2.6rem] h-[2.6rem] px-3 rounded-full'>
            <Button
              className='btn min-h-full h-auto focus:bg-inherit focus:border-[#021431]'
              loading={handlePostBlog.isLoading}
              onClick={() =>
                form.validateFields().then((values) =>
                  handlePostBlog.mutate({
                    ...values,
                    isPublished: true,
                    content: editorRef.current && editorRef.current.getContent(),
                  })
                )
              }
            >
              Save & Publish
            </Button>

            <span className='text-white pr-3'>|</span>

            <Dropdown
              className='text-[#99C6FF] text-base cursor-pointer rotate-45'
              overlay={
                <Menu
                  items={[
                    {
                      label: (
                        <span
                          onClick={() =>
                            form.validateFields().then((values) =>
                              handlePostBlog.mutate({
                                ...values,
                                content: editorRef.current && editorRef.current.getContent(),
                              })
                            )
                          }
                        >
                          Save to Draft
                        </span>
                      ),
                      key: 0,
                    },
                  ]}
                />
              }
            >
              <span className='rotate-45'>{'>'}</span>
            </Dropdown>
          </Form.Item>
        </Form>
      </main>
    </div>
  );
};

export default Create;

export const getServerSideProps: GetServerSideProps = async (
  ctx: GetServerSidePropsContext
): Promise<{
  props: { dehydratedState: DehydratedState };
}> => {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryFn: () => auth({ cookie: ctx.req && ctx.req.headers.cookie }),
    queryKey: [AUTH],
  });

  await queryClient.prefetchQuery({
    queryFn: () => getGenre(),
    queryKey: [GET_GENRE],
  });

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  };
};
