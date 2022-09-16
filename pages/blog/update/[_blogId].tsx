import type { GetServerSideProps, GetServerSidePropsContext, NextPage } from 'next';
import Head from 'next/head';
import { NextRouter, useRouter } from 'next/router';
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
import { Form, Input, Button, Upload, Select, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import UserAxios from '../../../apiAxios/userAxios';
import BlogAxios from '../../../apiAxios/blogAxios';
import { IPostBlog } from '../../../interface/blog';
import { openErrorNotification, openSuccessNotification } from '../../../utils/openNotification';
import ConfirmDelete from '../../../components/shared/ConfirmDelete';
import IMessage from '../../../interface/message';
import { AUTH, GET_BLOG, GET_GENRE } from '../../../constants/queryKeys';

const UpdateBlog: NextPage = () => {
  const {
    query: { _blogId },
    push,
  }: NextRouter = useRouter();

  const queryClient = useQueryClient();

  const editorRef = useRef<any>();

  const deleteModalRef = useRef<HTMLLabelElement>(null);

  const blogAxios = new BlogAxios();

  const [form] = Form.useForm();

  const { Option } = Select;

  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const { data: genre } = useQuery({
    queryFn: () => blogAxios.getGenre(),
    queryKey: [GET_GENRE],
  });

  const { data: blog } = useQuery({
    queryFn: () => blogAxios.getBlog(_blogId as string),
    queryKey: [GET_BLOG],
    onSuccess: (blog) => form.setFieldsValue({ title: blog.title, genre: blog.genre }),
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

  const handleUpdateBlog = useMutation(
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

      return blogAxios.updateBlog({ id: _blogId as string, data: formData });
    },
    {
      onSuccess: (res: IMessage) => {
        openSuccessNotification(res.message);
        queryClient.refetchQueries([AUTH]);
      },
      onError: (err: Error | any) => openErrorNotification(err.response.data.message),
    }
  );

  const handleDeleteBlog = useMutation((id: string) => blogAxios.deleteBlog(id), {
    onSuccess: (res: IMessage) => {
      openSuccessNotification(res.message);
      queryClient.refetchQueries([AUTH]);
      deleteModalRef.current?.click();
      push('/profile');
    },
    onError: (err: Error | any) => openErrorNotification(err.response.data.message),
  });

  return (
    <div className='w-full flex flex-col items-center p-5'>
      <Head>
        <title>Update post</title>
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
              apiKey={process.env.NEXT_PUBLIC_TINY_MCE}
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
              initialValue={blog && blog.content}
              onInit={(evt, editor) => (editorRef.current = editor)}
            />
          </Form.Item>

          <Form.Item className='w-fit sm:col-span-1 col-span-full'>
            <Upload {...fileUploadOptions}>
              <Button
                className='rounded-lg flex items-center py-[1.23rem] text-sm'
                icon={<UploadOutlined className='text-lg' />}
              >
                Upload Blog Cover
              </Button>
            </Upload>
          </Form.Item>

          <Form.Item
            className='sm:col-span-3 col-span-full'
            name='genre'
            rules={[
              {
                required: true,
                message: 'Please select atleast a genre',
              },
              {
                validator: (_, value) => {
                  if (value.length > 4) {
                    return Promise.reject('Max 4 genre allowed.');
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
              placeholder='Select genre (max 4)'
              size='large'
              allowClear
            >
              {genre &&
                genre.map((el) => (
                  <Option key={el} value={el}>
                    {el}
                  </Option>
                ))}
            </Select>
          </Form.Item>

          <Form.Item className='col-span-full'>
            <Button
              className='btn min-h-8 h-10 focus:bg-[#021431]'
              loading={handleUpdateBlog.isLoading}
              onClick={() =>
                form.validateFields().then((values) =>
                  handleUpdateBlog.mutate({
                    ...values,
                    content: editorRef.current && editorRef.current.getContent(),
                  })
                )
              }
            >
              Update
            </Button>

            <Button
              className='min-h-8 h-10 mx-2 rounded-[0.5rem] uppercase'
              onClick={() => deleteModalRef.current?.click()}
              danger
            >
              Delete Blog
            </Button>
          </Form.Item>
        </Form>

        <ConfirmDelete
          deleteModalRef={deleteModalRef}
          deleteMutation={() => handleDeleteBlog.mutate(_blogId as string)}
          isLoading={handleDeleteBlog.isLoading}
        />
      </main>
    </div>
  );
};

export default UpdateBlog;

export const getServerSideProps: GetServerSideProps = async (
  ctx: GetServerSidePropsContext
): Promise<{
  props: { dehydratedState: DehydratedState };
}> => {
  const queryClient = new QueryClient();

  const userAxios = new UserAxios(ctx.req && ctx.req.headers.cookie);

  const blogAxios = new BlogAxios(ctx.req && ctx.req.headers.cookie);

  ctx.res.setHeader('Cache-Control', 'public, s-maxage=86400');

  await queryClient.prefetchQuery({
    queryFn: () => userAxios.auth(),
    queryKey: [AUTH],
  });

  await queryClient.prefetchQuery({
    queryFn: () => blogAxios.getBlog(ctx.params ? (ctx.params._blogId as string) : ''),
    queryKey: [GET_BLOG],
  });

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  };
};
