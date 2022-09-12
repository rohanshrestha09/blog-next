import Image from 'next/image';
import { Avatar, Button, Divider, Space, Tag } from 'antd';
import moment from 'moment';
import he from 'he';
import { BsDot, BsHeart } from 'react-icons/bs';
import { VscComment } from 'react-icons/vsc';
import { FaEdit } from 'react-icons/fa';
import { FiEdit3 } from 'react-icons/fi';

interface Props {
  editable?: boolean;
  authorName: string;
  authorImage: string | null;
  blog: {
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
  blog: { title, content, image, genre, likes, isPublished, createdAt },
}) => {
  return (
    <>
      <div className='w-full flex flex-col gap-3 sm:px-10 py-4'>
        <Space>
          {editable ? (
            <>
              <Button className='btn min-h-fit h-fit px-2 gap-1 focus:bg-[#021027] capitalize leading-none rounded-full text-xs'>
                Edit
                <FiEdit3 />
              </Button>

              <Tag
                className={`${
                  isPublished ? 'bg-[#36D399]' : 'bg-[#FF5500]'
                } text-gray-100 border-0 rounded-full mx-0`}
              >
                {isPublished ? 'Published' : 'Unpublished'}
              </Tag>
            </>
          ) : (
            <>
              {authorImage ? (
                <Avatar
                  src={<Image alt='' src={authorImage} height={50} width={50} layout='fill' />}
                  size='small'
                />
              ) : (
                <Avatar className='bg-[#1890ff]' size='small'>
                  {authorName[0]}
                </Avatar>
              )}
              <p className='break-all'>{authorName}</p>
            </>
          )}
          <BsDot className='text-gray-500' />
          <p className='text-gray-500 text-xs'>{moment(createdAt).format('ll').slice(0, -6)}</p>
        </Space>

        <div className='w-full flex justify-between sm:gap-12 gap-6 break-all'>
          <Space direction='vertical' size={4}>
            <p className='sm:text-xl text-base font-bold leading-none'>{title}</p>
            <p className=''>{he.decode(content.replace(/<[^>]+>/g, ''))}</p>
          </Space>

          <span className='relative min-w-[7.5rem] min-h-[7.5rem] max-h-[7.5rem]'>
            <Image alt='' src={image} height={120} width={120} layout='fill' />
          </span>
        </div>

        <div className='w-full flex items-center justify-between'>
          <span className='truncate'>
            {genre.map((el) => (
              <Tag className='rounded-full'>{el}</Tag>
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
          </Space>
        </div>
      </div>

      <hr />
    </>
  );
};

export default BlogList;
