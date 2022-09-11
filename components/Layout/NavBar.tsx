import Image from 'next/image';
import { useRouter } from 'next/router';
import { useContext } from 'react';
import { Avatar } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import userContext from '../../utils/userContext';
import IContext from '../../interface/context';

const NavBar: React.FC = () => {
  const router = useRouter();

  const { user } = useContext<IContext>(userContext);

  return (
    <div className='sticky top-0 navbar xl:px-48 shadow-md z-10 justify-between bg-base-100'>
      <span
        className='font-megrim font-black md:text-4xl text-3xl cursor-pointer text-black'
        onClick={() => router.push('/')}
      >
        BlogSansar
      </span>
      <div className='gap-5'>
        <div className='sm:block hidden form-control relative'>
          <SearchOutlined className='absolute text-lg left-3 top-1.5 text-slate-600' />

          <input
            className='input input-bordered h-10 rounded-full pl-9'
            placeholder='Search'
            type='search'
          />
        </div>

        {user ? (
          <label className='btn min-h-8 h-10 px-2 btn-circle flex flex-nowrap items-center gap-2 w-36'>
            <span className='w-9 avatar'>
              {user.image ? (
                <Image alt='' className='rounded-full' src={user.image} height={50} width={50} />
              ) : (
                <Avatar className='bg-[#1890ff]' size='small'>
                  {user.fullname[0]}
                </Avatar>
              )}
            </span>
            <span className='text-sm truncate'>{user.fullname}</span>
          </label>
        ) : (
          <label
            className='btn modal-button min-h-8 h-10 leading-none rounded-full'
            htmlFor='registerModal'
          >
            Login/Register
          </label>
        )}
      </div>
    </div>
  );
};

export default NavBar;
