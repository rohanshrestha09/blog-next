import Image from 'next/image';
import { NextRouter, useRouter } from 'next/router';
import { useDispatch } from 'react-redux';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import moment from 'moment';
import he from 'he';
import { Avatar, Button, Divider, Popover, Space, Tag, Tooltip } from 'antd';
import { BsHeart, BsThreeDots } from 'react-icons/bs';
import { VscComment } from 'react-icons/vsc';
import { FiEdit3 } from 'react-icons/fi';
import {
  MdOutlineDelete,
  MdOutlinePublishedWithChanges,
  MdOutlineUnpublished,
} from 'react-icons/md';
import BlogAxios from '../../apiAxios/blogAxios';
import ConfirmDelete from '../shared/ConfirmDelete';
import { closeDeleteModal, openDeleteModal } from '../../store/deleteModalSlice';
import { errorNotification, successNotification } from '../../utils/notification';
import { GET_AUTH_BLOGS } from '../../constants/queryKeys';
import type IMessage from '../../interface/message';
import type { IBlogData } from '../../interface/blog';

interface Props {
  editable?: boolean;
  blog: IBlogData;
}

const BlogList: React.FC<Props> = ({
  editable,
  blog: {
    _id: id,
    title,
    content,
    authorName,
    authorImage,
    image,
    genre,
    likesCount,
    commentsCount,
    isPublished,
    createdAt,
  },
}) => {
  const router: NextRouter = useRouter();

  const dispatch = useDispatch();

  const queryClient = useQueryClient();

  const blogAxios = new BlogAxios();

  const handlePublishBlog = useMutation(
    ({ id, shouldPublish }: { id: string; shouldPublish: boolean }) =>
      blogAxios.publishBlog({ id, shouldPublish }),
    {
      onSuccess: (res: IMessage) => {
        successNotification(res.message);
        queryClient.refetchQueries([GET_AUTH_BLOGS]);
      },
      onError: (err: Error | any) => errorNotification(err),
    }
  );

  const handleDeleteBlog = useMutation((id: string) => blogAxios.deleteBlog(id), {
    onSuccess: (res: IMessage) => {
      successNotification(res.message);
      queryClient.refetchQueries([GET_AUTH_BLOGS]);
      dispatch(closeDeleteModal());
    },
    onError: (err: Error | any) => errorNotification(err),
  });

  const popoverContent = (
    <>
      <Space
        className='cursor-pointer hover:bg-gray-200 hover:text-black rounded-lg px-2 py-1.5 transition-all'
        onClick={() => router.push(`/blog/update/${id}`)}
      >
        <FiEdit3 />
        Edit
      </Space>

      <Divider type='vertical' />

      <Button
        className={`${
          isPublished ? 'hover:bg-red-500' : 'hover:bg-green-500'
        } inline-flex items-center gap-2 border-0 focus:text-current hover:!text-white rounded-lg px-2 py-1.5 transition-all`}
        loading={handlePublishBlog.isLoading}
        onClick={() => handlePublishBlog.mutate({ id, shouldPublish: !isPublished })}
      >
        <MdOutlinePublishedWithChanges />
        {isPublished ? 'Unpublish' : 'Publish'}
      </Button>

      <Divider type='vertical' />

      <Space
        className='cursor-pointer hover:bg-red-500 hover:text-white rounded-lg px-2 py-1.5 transition-all'
        onClick={() => dispatch(openDeleteModal())}
      >
        <MdOutlineDelete />
        Delete
      </Space>

      <ConfirmDelete
        isLoading={handleDeleteBlog.isLoading}
        deleteMutation={() => handleDeleteBlog.mutate(id)}
      />
    </>
  );

  return (
    <>
      <div className='w-full flex flex-col gap-3'>
        <Space className='relative'>
          {authorImage ? (
            <Avatar src={<Image alt='' src={authorImage} layout='fill' />} size='small' />
          ) : (
            <Avatar className='bg-[#1890ff]' size='small'>
              {authorName[0]}
            </Avatar>
          )}
          <p className='multiline-truncate-name'>{authorName}</p>

          <span className='text-2xl leading-none tracking-tighter text-gray-400'>&#x22C5;</span>

          <p className='w-28 text-gray-400 text-xs'>{moment(createdAt).format('ll')}</p>

          {editable && (
            <Popover
              content={popoverContent}
              placement='left'
              overlayInnerStyle={{ borderRadius: '10px' }}
              trigger='click'
            >
              <BsThreeDots className='absolute right-0 top-0 translate-y-1/2 hover:rounded-full cursor-pointer hover:bg-gray-600 transition-all sm:text-base' />
            </Popover>
          )}
        </Space>

        <div className='w-full flex justify-between sm:gap-12 gap-6'>
          <Space direction='vertical' size={4}>
            <p className='sm:text-xl text-base multiline-truncate-title'>{title}</p>

            <p className='leading-loose multiline-truncate-content'>
              {he.decode(content.replace(/<[^>]+>/g, ''))}
            </p>
          </Space>

          <span className='relative min-w-[4rem] min-h-[4rem] sm:min-w-[7.5rem] sm:min-h-[7.5rem] sm:max-h-[7.5rem]'>
            <Image alt='' className='object-cover' src={image} layout='fill' />
          </span>
        </div>

        <div className='w-full flex items-center justify-between'>
          <span className='truncate'>
            {genre.map((tag) => (
              <Tag className='rounded-full' key={tag}>
                {tag}
              </Tag>
            ))}
          </span>

          <Space size={5}>
            <Tooltip title='Likes' placement='bottom'>
              <Space className='flex items-center'>
                <BsHeart />
                {likesCount}
              </Space>
            </Tooltip>

            <Divider type='vertical' />

            <Tooltip title='Comment' placement='bottom'>
              <Space className='flex items-center'>
                <VscComment />
                {commentsCount}
              </Space>
            </Tooltip>

            {editable && (
              <>
                <Divider type='vertical' />

                <Tooltip title={isPublished ? 'Published' : 'Unpublished'} placement='bottom'>
                  {isPublished ? <MdOutlinePublishedWithChanges /> : <MdOutlineUnpublished />}
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

export default BlogList;
