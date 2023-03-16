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
import BlogAxios from '../../api/BlogAxios';
import ConfirmDelete from '../shared/ConfirmDelete';
import { openModal, closeModal } from '../../store/modalSlice';
import { errorNotification, successNotification } from '../../utils/notification';
import { GET_ALL_BLOGS, GET_AUTH_BLOGS } from '../../constants/queryKeys';
import { MODAL_KEYS } from '../../constants/reduxKeys';
import type { IBlogData } from '../../interface/blog';

interface Props {
  editable?: boolean;
  blog: IBlogData;
  smallContainer?: boolean;
}

const { DELETE_MODAL } = MODAL_KEYS;

const BlogList: React.FC<Props> = ({
  editable,
  smallContainer,
  blog: {
    _id: id,
    author,
    title,
    content,
    image,
    genre,
    likeCount,
    commentCount,
    isPublished,
    createdAt,
  },
}) => {
  const router: NextRouter = useRouter();

  const dispatch = useDispatch();

  const queryClient = useQueryClient();

  const blogAxios = BlogAxios();

  const handlePublishBlog = useMutation(
    ({ id, shouldPublish }: { id: string; shouldPublish: boolean }) =>
      blogAxios.publishBlog({ id, shouldPublish }),
    {
      onSuccess: (res) => {
        successNotification(res.message);
        queryClient.refetchQueries([GET_AUTH_BLOGS]);
        queryClient.refetchQueries([GET_ALL_BLOGS]);
      },
      onError: (err: AxiosError) => errorNotification(err),
    }
  );

  const handleDeleteBlog = useMutation((id: string) => blogAxios.deleteBlog(id), {
    onSuccess: (res) => {
      successNotification(res.message);
      queryClient.refetchQueries([GET_AUTH_BLOGS]);
      queryClient.refetchQueries([GET_ALL_BLOGS]);
      dispatch(closeModal({ key: DELETE_MODAL }));
    },
    onError: (err: AxiosError) => errorNotification(err),
  });

  const dropDownMenu = [
    {
      key: 'edit',
      label: (
        <Space
          className='w-full cursor-pointer py-1 text-sm'
          onClick={() => router.push(`/blog/update/${id}`)}
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
          onClick={() => handlePublishBlog.mutate({ id, shouldPublish: !isPublished })}
        >
          <MdOutlinePublishedWithChanges size={16} />
          {isPublished ? 'Unpublish' : 'Publish'}
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
            deleteMutation={() => handleDeleteBlog.mutate(id)}
          />
        </>
      ),
    },
  ];

  return (
    <>
      <div className='w-full flex flex-col gap-3'>
        <Space className='relative'>
          {author.image ? (
            <Avatar
              src={
                <Image alt='' className='object-cover' src={author.image} layout='fill' priority />
              }
              size='small'
            />
          ) : (
            <Avatar className='bg-[#1890ff]' size='small'>
              {author.fullname[0]}
            </Avatar>
          )}
          <p
            className='multiline-truncate-name cursor-pointer text-white'
            onClick={() => router.push(`/profile/${author._id}`)}
          >
            {author.fullname}
          </p>

          <span className='text-2xl leading-none tracking-tighter text-zinc-400'>&#x22C5;</span>

          <p className='w-28 text-zinc-400 text-xs'>{moment(createdAt).format('ll')}</p>

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
          onClick={() => router.push(`/${id}`)}
        >
          <Space direction='vertical' size={4}>
            <p className='sm:text-xl text-base multiline-truncate-title text-white'>{title}</p>

            {!smallContainer && (
              <p className='multiline-truncate-content leading-loose'>
                {he.decode(content.replace(/<[^>]+>/g, ''))}
              </p>
            )}
          </Space>

          {!smallContainer && image && (
            <span className='relative min-w-[4rem] min-h-[4rem] sm:min-w-[7.5rem] sm:min-h-[7.5rem] sm:max-h-[7.5rem]'>
              <Image alt='' className='object-cover' src={image} layout='fill' priority />
            </span>
          )}
        </div>

        <div className='w-full flex items-center justify-between'>
          <span className='truncate'>
            {genre.map((tag: string) => (
              <Tag
                key={tag}
                className='rounded-full cursor-pointer'
                onClick={() => router.push(`/blog/${tag.toLowerCase()}`)}
              >
                {tag}
              </Tag>
            ))}
          </span>

          <Space size={5}>
            <Tooltip title='Likes' placement='bottom'>
              <Space className='flex items-center'>
                <BsHeart />
                {likeCount}
              </Space>
            </Tooltip>

            <Divider type='vertical' />

            <Tooltip title='Comment' placement='bottom'>
              <Space className='flex items-center'>
                <VscComment />
                {commentCount}
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
