import Image from 'next/image';
import { NextRouter, useRouter } from 'next/router';
import { useDispatch } from 'react-redux';
import { Avatar, Button } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { openRegisterModal } from '../../store/registerModalSlice';
import { useAuth } from '../../utils/UserAuth';

const NavBar: React.FC = () => {
  const router: NextRouter = useRouter();

  const { authUser } = useAuth();

  const dispatch = useDispatch();

  return (
    <div className='w-full bg-white flex items-center justify-between sticky top-0 xl:px-60 px-5 py-3 shadow-md z-10'>
      <span
        className='font-megrim font-black md:text-4xl text-3xl cursor-pointer text-black'
        onClick={() => router.push('/')}
      >
        BlogSansar
      </span>

      <div className='flex items-center gap-5'>
        <div className='sm:block hidden relative border-2 focus:outline-none rounded-full'>
          <SearchOutlined className='absolute flex items-center text-lg left-3 top-0 bottom-0 text-slate-600' />

          <input
            className='h-9 rounded-full pl-9 focus:border-none focus:outline-none'
            placeholder='Search'
            type='search'
          />
        </div>

        {authUser ? (
          <div className='h-10 flex flex-nowrap items-center gap-2 w-36 text-white bg-[#021431] rounded-full px-2'>
            <span>
              {authUser.image ? (
                <Avatar
                  src={<Image alt='' className='object-cover' src={authUser.image} layout='fill' />}
                  size='small'
                />
              ) : (
                <Avatar className='bg-[#1890ff]' size='small'>
                  {authUser.fullname[0]}
                </Avatar>
              )}
            </span>
            <span className='text-sm truncate'>{authUser.fullname}</span>
          </div>
        ) : (
          <Button
            className='h-10 uppercase font-semibold bg-[#021431] focus:bg-[#021431] hover:bg-[#021431] text-white leading-none rounded-full'
            onClick={() => dispatch(openRegisterModal())}
          >
            Login/Register
          </Button>
        )}
      </div>
    </div>
  );
};

export default NavBar;
