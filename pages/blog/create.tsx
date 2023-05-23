import type { GetServerSidePropsContext, NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
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
import { Form, Input, Button, Upload, Select } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import withAuth from '../../utils/auth';
import BlogAxios from '../../api/BlogAxios';
import {
  errorNotification,
  successNotification,
  warningNotification,
} from '../../utils/notification';
import { AUTH, GET_AUTH_BLOGS, GET_GENRE } from '../../constants/queryKeys';
import type { IPostBlog } from '../../interface/blog';

const CreateBlog: NextPage = () => {
  const router = useRouter();

  const queryClient = useQueryClient();

  const editorRef = useRef<any>();

  const blogAxios = BlogAxios();

  const [form] = Form.useForm();

  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const [renderEditor, setRenderEditor] = useState<number>(1);

  const { data: genre } = useQuery({
    queryFn: () => blogAxios.getGenre(),
    queryKey: [GET_GENRE],
  });

  const fileUploadOptions = {
    maxCount: 1,
    multiple: false,
    showUploadList: true,
    beforeUpload: (file: File) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        warningNotification(`${file.name} is not an image file`);
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

      return blogAxios.postBlog(formData);
    },
    {
      onSuccess: (res) => {
        successNotification(res.message);
        form.resetFields();
        setSelectedImage(null);
        setRenderEditor(Math.random() * 100);
        queryClient.refetchQueries([AUTH]);
        queryClient.refetchQueries([GET_AUTH_BLOGS]);
        router.push(`/${res.blog}`);
      },
      onError: (err: AxiosError) => errorNotification(err),
    }
  );

  return (
    <div className='w-full flex justify-center'>
      <Head>
        <title>Create a post</title>
        <link href='/favicon.ico' rel='icon' />
      </Head>

      <main className='flex flex-col'>
        <header className='text-2xl uppercase pb-4'>Create a blog</header>

        <Form
          autoComplete='off'
          form={form}
          initialValues={{ remember: true }}
          layout='vertical'
          name='basic'
          requiredMark={false}
        >
          <Form.Item name='title' rules={[{ required: true, message: 'Please input title' }]}>
            <Input className='rounded-lg px-4 py-2.5 placeholder:text-base' placeholder='Title' />
          </Form.Item>

          <Form.Item>
            <Editor
              key={renderEditor}
              apiKey={process.env.NEXT_PUBLIC_TINY_MCE}
              init={{
                height: 430,
                menubar: true,
                skin: 'oxide-dark',
                content_css: 'dark',
                toolbar_sticky: true,
                toolbar_mode: 'sliding',
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
                content_style:
                  'body { font-family:Helvetica,Arial,sans-serif; font-size:16px; background-color:black; }',
              }}
              initialValue='<p>Write something...</p>'
              onInit={(evt, editor) => (editorRef.current = editor)}
            />
          </Form.Item>

          <Form.Item>
            <p className='text-sm'>
              Note: To upload custom image, use drag and drop or copy/paste shortcut
            </p>
          </Form.Item>

          <div className='w-full grid grid-cols-8'>
            <Form.Item className='sm:col-span-2 col-span-full w-48'>
              <Upload {...fileUploadOptions}>
                <Button
                  className='rounded-lg flex items-center py-[1.23rem] text-sm'
                  icon={<UploadOutlined />}
                >
                  Upload Blog Cover
                </Button>
              </Upload>
            </Form.Item>

            <Form.Item
              className='sm:col-span-6 col-span-full'
              name='genre'
              rules={[
                {
                  required: true,
                  message: 'Please select atleast a genre',
                },
                {
                  validator: (_, value) =>
                    value.length > 4 ? Promise.reject('Max 4 genre allowed.') : Promise.resolve(),
                },
              ]}
            >
              <Select
                mode='multiple'
                popupClassName='rounded-lg font-sans'
                placeholder='Select genre (max 4)'
                size='large'
                allowClear
                options={genre && genre.map((val) => ({ label: val, value: val }))}
              />
            </Form.Item>
          </div>

          <Form.Item>
            <Button
              type='primary'
              className='h-10 uppercase rounded-lg'
              loading={handlePostBlog.isLoading && handlePostBlog.variables.isPublished}
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

            <Button
              className='h-10 mx-2 bg-gray-200 text-black rounded-lg uppercase'
              loading={handlePostBlog.isLoading && !handlePostBlog.variables.isPublished}
              onClick={() =>
                form.validateFields().then((values) =>
                  handlePostBlog.mutate({
                    ...values,
                    content: editorRef.current && editorRef.current.getContent(),
                  })
                )
              }
            >
              Save as Draft
            </Button>
          </Form.Item>
        </Form>
      </main>
    </div>
  );
};

export default CreateBlog;

export const getServerSideProps = withAuth(
  async (
    ctx: GetServerSidePropsContext
  ): Promise<{
    props: { dehydratedState: DehydratedState };
  }> => {
    const queryClient = new QueryClient();

    const blogAxios = BlogAxios(ctx.req.headers.cookie);

    ctx.res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=59');

    await queryClient.prefetchQuery({
      queryFn: () => blogAxios.getGenre(),
      queryKey: [GET_GENRE],
    });

    return {
      props: {
        dehydratedState: dehydrate(queryClient),
      },
    };
  }
);
