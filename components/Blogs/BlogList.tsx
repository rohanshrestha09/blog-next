import Image from 'next/image';
import { NextRouter, useRouter } from 'next/router';
import { useRef } from 'react';
import { Avatar, Button, Divider, Popover, Space, Tag } from 'antd';
import moment from 'moment';
import he from 'he';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { BsHeart, BsThreeDots } from 'react-icons/bs';
import { VscComment } from 'react-icons/vsc';
import { FiEdit3 } from 'react-icons/fi';
import {
  MdOutlineDelete,
  MdOutlinePublishedWithChanges,
  MdOutlineUnpublished,
} from 'react-icons/md';
import BlogAxios from '../../apiAxios/blogAxios';
import { AUTH } from '../../constants/queryKeys';
import IMessage from '../../interface/message';
import ConfirmDelete from '../shared/ConfirmDelete';
import { openSuccessNotification, openErrorNotification } from '../../utils/openNotification';

interface Props {
  editable?: boolean;
  authorName: string;
  authorImage: string | null;
  blog: {
    _id: string;
    title: string;
    content: string;
    image: string;
    genre: string[];
    likes: number;
    isPublished: boolean;
    createdAt: Date;
  };
}

const BlogList: React.FC<Props> = ({
  editable,
  authorName,
  authorImage,
  blog: { _id, title, content, image, genre, likes, isPublished, createdAt },
}) => {
  const router: NextRouter = useRouter();

  const queryClient = useQueryClient();

  const deleteModalRef = useRef<HTMLLabelElement>(null);

  const blogAxios = new BlogAxios();

  const handlePublishBlog = useMutation(
    ({ id, shouldPublish }: { id: string; shouldPublish: boolean }) =>
      blogAxios.publishBlog({ id, shouldPublish }),
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
    },
    onError: (err: Error | any) => openErrorNotification(err.response.data.message),
  });

  const popoverContent = (
    <>
      <Space
        className='cursor-pointer hover:bg-[#021027] hover:text-white rounded-lg px-2 py-1.5 transition-all'
        onClick={() => router.push(`/blog/update/${_id}`)}
      >
        <FiEdit3 />
        Edit
      </Space>

      <Divider className='bg-slate-200' type='vertical' />

      <Button
        className={`${
          isPublished ? 'hover:bg-red-500' : 'hover:bg-green-500'
        } inline-flex items-center gap-2 border-0 focus:text-current hover:!text-white rounded-lg px-2 py-1.5 transition-all`}
        loading={handlePublishBlog.isLoading}
        onClick={() => handlePublishBlog.mutate({ id: _id, shouldPublish: !isPublished })}
      >
        <MdOutlinePublishedWithChanges />
        {isPublished ? 'Unpublish' : 'Publish'}
      </Button>

      <Divider className='bg-slate-200' type='vertical' />

      <Space
        className='cursor-pointer hover:bg-red-500 hover:text-white rounded-lg px-2 py-1.5 transition-all'
        onClick={() => deleteModalRef.current?.click()}
      >
        <MdOutlineDelete />
        Delete
      </Space>

      <ConfirmDelete
        deleteModalRef={deleteModalRef}
        deleteMutation={() => handleDeleteBlog.mutate(_id)}
        isLoading={handleDeleteBlog.isLoading}
      />
    </>
  );

  return (
    <>
      <div className='w-full flex flex-col gap-3 sm:px-10 py-4'>
        <Space className='relative'>
          {authorImage ? (
            <Avatar src={<Image alt='' src={authorImage} layout='fill' />} size='small' />
          ) : (
            <Avatar className='bg-[#1890ff]' size='small'>
              {authorName[0]}
            </Avatar>
          )}
          <p className='break-all'>{authorName}</p>

          <span className='text-2xl leading-none tracking-tighter text-gray-400'>&#x22C5;</span>

          <p className='text-gray-500 text-xs'>{moment(createdAt).format('ll').slice(0, -6)}</p>

          {editable && (
            <>
              {/* <Button
                className='btn min-h-fit h-fit px-2 gap-1 focus:bg-[#021027] capitalize leading-none rounded-full text-xs'
                onClick={() => router.push(`/blog/update/${_id}`)}
              >
                Edit
                <FiEdit3 />
          </Button>*/}

              <Popover
                content={popoverContent}
                placement='left'
                overlayInnerStyle={{ borderRadius: '10px' }}
                trigger='click'
              >
                <BsThreeDots className='absolute right-0 top-0 translate-y-1/2 hover:rounded-full cursor-pointer hover:bg-gray-200 transition-all sm:text-base' />
              </Popover>
            </>
          )}
        </Space>

        <div className='w-full flex justify-between sm:gap-12 gap-6 break-words'>
          <Space direction='vertical' size={4}>
            <p className='sm:text-xl text-base font-bold sm:leading-none leading-snug multiline-truncate-title'>
              {title}
            </p>

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
              <Tag className='rounded-full'>{tag}</Tag>
            ))}
          </span>

          <Space size={5}>
            <Space className='flex items-center tooltip tooltip-bottom' data-tip='Likes'>
              <BsHeart />
              {likes}
            </Space>

            <Divider className='bg-slate-200' type='vertical' />

            <Space
              className='flex items-center tooltip sm:tooltip-bottom tooltip-left'
              data-tip='Comments'
            >
              <VscComment />
              {1}
            </Space>

            {editable && (
              <>
                <Divider className='bg-slate-200' type='vertical' />

                <span
                  className='flex items-center tooltip sm:tooltip-bottom tooltip-left'
                  data-tip={isPublished ? 'Published' : 'Unpublished'}
                >
                  {isPublished ? <MdOutlinePublishedWithChanges /> : <MdOutlineUnpublished />}
                </span>
              </>
            )}
          </Space>
        </div>
      </div>

      <hr />
    </>
  );
};

export default BlogList;
