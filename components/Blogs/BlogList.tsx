import Image from 'next/image';
import { useContext } from 'react';
import { Avatar, Badge, Button, Space, Tag } from 'antd';
import moment from 'moment';
import { BsHeart } from 'react-icons/bs';
import userContext from '../../utils/userContext';

interface Props {
  authorName: string;
  authorImage: string | null;
  title: string;
  content: string;
  image: string;
  genre: string[];
  createdAt: Date;
}

const BlogList: React.FC<Props> = ({
  authorName,
  authorImage,
  title,
  content,
  image,
  genre,
  createdAt,
}) => {
  const { user } = useContext(userContext);
  return (
    <>
      <div className='w-full flex flex-col gap-3 sm:px-10 py-4'>
        <div className='w-full h-fit flex items-center gap-2'>
          {authorImage ? (
            <Image alt='' className='rounded-full' src={authorImage} height={23.5} width={23.5} />
          ) : (
            <Avatar className='bg-[#1890ff]' size='small'>
              {authorName[0]}
            </Avatar>
          )}

          <p className='break-all truncate'>{authorName}</p>
          <p className='text-gray-500'>{moment(createdAt).format('ll').slice(0, -6)}</p>
        </div>

        <div className='w-full flex justify-between sm:gap-12 gap-6 break-all'>
          <span className='flex flex-col gap-1'>
            <p className='sm:text-xl text-base font-bold leading-none'>{title}</p>
            <p className=''>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Nihil totam voluptate iusto!
              Eaque totam id illum fuga inventore quisquam facere quos culpa, iusto, magni iste
              fficia praesentium quis architecto veniam. Lorem ipsum dolor sit, amet consectetur
              adipisicing elit.
            </p>
          </span>

          <span className='relative min-w-[7.5rem] min-h-[7.5rem] max-h-[7.5rem]'>
            <Image src={image} alt='' height={120} width={120} layout='fill' />
          </span>
        </div>

        <div className='w-full flex items-center justify-between'>
          <span>
            {genre.map((el) => (
              <Tag className='rounded-full'>{el}</Tag>
            ))}

            <Tag className='rounded-full text-gray-100 bg-[#36D399] border-0'>Published</Tag>
          </span>

          <Space>
            <BsHeart size={17} />
          </Space>
        </div>
      </div>

      <hr />
    </>
  );
};

export default BlogList;
