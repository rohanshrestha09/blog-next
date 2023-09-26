import Image from 'next/image';
import { NextRouter, useRouter } from 'next/router';
import { useDispatch } from 'react-redux';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import moment from 'moment';
import he from 'he';
import { Avatar, Divider, Dropdown, Space, Tag, Tooltip } from 'antd';
import { BsHeart, BsThreeDots } from 'react-icons/bs';
import { VscComment } from 'react-icons/vsc';
import { FiEdit3 } from 'react-icons/fi';
import {
  MdOutlineDelete,
  MdOutlinePublishedWithChanges,
  MdOutlineUnpublished,
} from 'react-icons/md';
import { deleteBlog, publishBlog, unpublishBlog } from 'request/blog';
import ConfirmDelete from './ConfirmDelete';
import { openModal, closeModal } from 'store/modalSlice';
import { errorNotification, successNotification } from 'utils/notification';
import { MODAL_KEYS } from 'constants/reduxKeys';
import { BLOG } from 'constants/queryKeys';
import { Blog } from 'interface/models';

interface Props {
  editable?: boolean;
  blog: Blog;
  size?: 'small';
}

const { DELETE_MODAL } = MODAL_KEYS;

const BlogCard: React.FC<Props> = ({ blog, editable, size }) => {
  const router: NextRouter = useRouter();

  const dispatch = useDispatch();

  const queryClient = useQueryClient();

  const handlePublishBlog = useMutation(publishBlog, {
    onSuccess: (res) => {
      successNotification(res.message);
      queryClient.refetchQueries([BLOG]);
    },
    onError: errorNotification,
  });

  const handleUnublishBlog = useMutation(unpublishBlog, {
    onSuccess: (res) => {
      successNotification(res.message);
      queryClient.refetchQueries([BLOG]);
    },
    onError: errorNotification,
  });

  const handleDeleteBlog = useMutation(deleteBlog, {
    onSuccess: (res) => {
      successNotification(res.message);
      queryClient.refetchQueries([BLOG]);
      dispatch(closeModal({ key: DELETE_MODAL }));
    },
    onError: errorNotification,
  });

  const dropDownMenu = [
    {
      key: 'edit',
      label: (
        <Space
          className='w-full cursor-pointer py-1 text-sm'
          onClick={() => router.push(`/blog/${blog?.slug}/update`)}
        >
          <FiEdit3 size={16} />
          Edit
        </Space>
      ),
    },
    {
      key: 'publish',
      label: (
        <Space
          className='w-full cursor-pointer py-1 text-sm'
          onClick={() =>
            blog?.isPublished
              ? handlePublishBlog.mutate(blog?.slug)
              : handleUnublishBlog.mutate(blog?.slug)
          }
        >
          <MdOutlinePublishedWithChanges size={16} />
          {blog?.isPublished ? 'Unpublish' : 'Publish'}
        </Space>
      ),
    },
    {
      key: 'delete',
      label: (
        <>
          <Space
            className='w-full cursor-pointer py-1 text-red-500 text-sm'
            onClick={() => dispatch(openModal({ key: DELETE_MODAL }))}
          >
            <MdOutlineDelete size={16} />
            Delete
          </Space>

          <ConfirmDelete
            isLoading={handleDeleteBlog.isLoading}
            deleteMutation={() => handleDeleteBlog.mutate(blog?.slug)}
          />
        </>
      ),
    },
  ];

  return (
    <>
      <div className='w-full flex flex-col gap-3'>
        <Space className='relative'>
          {blog?.author?.image ? (
            <Avatar
              src={
                <Image
                  alt=''
                  className='object-cover'
                  src={blog?.author?.image}
                  layout='fill'
                  priority
                />
              }
              size='small'
            />
          ) : (
            <Avatar className='bg-[#1890ff]' size='small'>
              {blog?.author?.name?.[0]}
            </Avatar>
          )}
          <p
            className='multiline-truncate-name cursor-pointer text-white'
            onClick={() => router.push(`/profile/${blog?.author?.id}`)}
          >
            {blog?.author?.name}
          </p>

          <span className='text-2xl leading-none tracking-tighter text-zinc-400'>&#x22C5;</span>

          <p className='w-28 text-zinc-400 text-xs'>{moment(blog?.createdAt).format('ll')}</p>

          {editable && (
            <Dropdown
              overlayClassName='w-32 font-sans'
              menu={{ items: dropDownMenu }}
              placement='bottomRight'
              trigger={['click']}
            >
              <BsThreeDots className='absolute right-0 top-0 translate-y-1/2 cursor-pointer sm:text-xl' />
            </Dropdown>
          )}
        </Space>

        <div
          className='w-full flex justify-between sm:gap-12 gap-6 cursor-pointer'
          onClick={() => router.push(`/blog/${blog?.slug}`)}
        >
          <Space direction='vertical' size={4}>
            <p className='sm:text-xl text-base multiline-truncate-title text-white'>
              {blog?.title}
            </p>

            {!size && (
              <p className='multiline-truncate-content leading-loose'>
                {he.decode(blog?.content.replace(/<[^>]+>/g, ''))}
              </p>
            )}
          </Space>

          {!size && blog?.image && (
            <span className='relative min-w-[4rem] min-h-[4rem] sm:min-w-[7.5rem] sm:min-h-[7.5rem] sm:max-h-[7.5rem]'>
              <Image alt='' className='object-cover' src={blog?.image} layout='fill' priority />
            </span>
          )}
        </div>

        <div className='w-full flex items-center justify-between'>
          <span className='truncate'>
            {blog?.genre?.map((tag) => (
              <Tag
                key={tag}
                className='rounded-full cursor-pointer'
                onClick={() => router.push(`/${tag.toLowerCase()}`)}
              >
                {tag}
              </Tag>
            ))}
          </span>

          <Space size={5}>
            <Tooltip title='Likes' placement='bottom'>
              <Space className='flex items-center'>
                <BsHeart />
                {blog?._count?.likedBy}
              </Space>
            </Tooltip>

            <Divider type='vertical' />

            <Tooltip title='Comment' placement='bottom'>
              <Space className='flex items-center'>
                <VscComment />
                {blog?._count?.comments}
              </Space>
            </Tooltip>

            {editable && (
              <>
                <Divider type='vertical' />

                <Tooltip title={blog?.isPublished ? 'Published' : 'Unpublished'} placement='bottom'>
                  {blog?.isPublished ? <MdOutlinePublishedWithChanges /> : <MdOutlineUnpublished />}
                </Tooltip>
              </>
            )}
          </Space>
        </div>
      </div>

      <Divider />
    </>
  );
};

export default BlogCard;
