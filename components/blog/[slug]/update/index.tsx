import Head from 'next/head';
import { NextRouter, useRouter } from 'next/router';
import { useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Editor } from '@tinymce/tinymce-react';
import { Form, Input, Button, Upload, Select } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { openModal, closeModal } from 'store/modalSlice';
import ConfirmDelete from 'components/common/ConfirmDelete';
import { withAuth } from 'auth';
import { deleteBlog, getBlog, getGenre, updateBlog } from 'request/blog';
import { errorNotification, successNotification, warningNotification } from 'utils/notification';
import { queryKeys } from 'utils';
import { MODAL_KEYS } from 'constants/reduxKeys';
import { AUTH, BLOG, GENRE } from 'constants/queryKeys';

const { DELETE_MODAL } = MODAL_KEYS;

const UpdateBlog = () => {
  const { query, push }: NextRouter = useRouter();

  const dispatch = useDispatch();

  const queryClient = useQueryClient();

  const editorRef = useRef<any>();

  const [form] = Form.useForm();

  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const { data: genre } = useQuery({
    queryFn: getGenre,
    queryKey: queryKeys(GENRE).lists(),
  });

  const { data: blog } = useQuery({
    queryFn: () => getBlog(String(query?.slug)),
    queryKey: queryKeys(BLOG).detail(String(query?.slug)),
    enabled: !!query?.slug,
    onSuccess: (data) => {
      form.setFieldsValue(data);
    },
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

  const handleUpdateBlog = useMutation(
    (formValues: { [x: string]: any }) => {
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

      return updateBlog({ slug: String(blog?.slug), data: formData });
    },
    {
      onSuccess: (res) => {
        successNotification(res.message);
        queryClient.refetchQueries([BLOG]);
        push(`/${res.slug}`);
      },
      onError: errorNotification,
    },
  );

  const handleDeleteBlog = useMutation(deleteBlog, {
    onSuccess: (res) => {
      successNotification(res.message);
      queryClient.refetchQueries([AUTH]);
      queryClient.refetchQueries([BLOG]);
      dispatch(closeModal({ key: DELETE_MODAL }));
      push('/profile');
    },
    onError: errorNotification,
  });

  return (
    <div className='w-full flex justify-center'>
      <Head>
        <title>Update post</title>
        <link href='/favicon.ico' rel='icon' />
      </Head>

      <main className='flex flex-col'>
        <header className='text-2xl uppercase pb-4'>Edit Blog</header>

        <Form
          autoComplete='off'
          form={form}
          initialValues={{ remember: true }}
          layout='vertical'
          name='basic'
          requiredMark={false}
          onFinish={(values) => {
            handleUpdateBlog.mutate({
              ...values,
              content: editorRef.current && editorRef.current.getContent(),
            });
          }}
        >
          <Form.Item name='title' rules={[{ required: true, message: 'Please input title' }]}>
            <Input className='rounded-lg px-4 py-2.5 placeholder:text-base' placeholder='Title' />
          </Form.Item>

          <Form.Item>
            <Editor
              apiKey={process.env.NEXT_PUBLIC_TINY_MCE}
              init={{
                height: 590,
                menubar: true,
                skin: 'oxide-dark',
                content_css: 'dark',
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
              initialValue={blog?.content}
              onInit={(_, editor) => (editorRef.current = editor)}
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
                options={genre && Object.values(genre).map((val) => ({ label: val, value: val }))}
              />
            </Form.Item>
          </div>

          <Form.Item>
            <Button
              type='primary'
              className='h-10 uppercase rounded-lg'
              loading={handleUpdateBlog.isLoading}
              htmlType='submit'
            >
              Update
            </Button>

            <Button
              type='primary'
              className='h-10 mx-2 rounded-lg uppercase'
              onClick={() => dispatch(openModal({ key: DELETE_MODAL }))}
              danger
            >
              Delete Blog
            </Button>
          </Form.Item>

          <ConfirmDelete
            isLoading={handleDeleteBlog.isLoading}
            deleteMutation={() => blog?.slug && handleDeleteBlog.mutate(blog?.slug)}
          />
        </Form>
      </main>
    </div>
  );
};

export default UpdateBlog;

export const getServerSideProps = withAuth(async () => {
  return {
    props: {},
  };
});
