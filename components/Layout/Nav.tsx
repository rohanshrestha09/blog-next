import { Button, Popover } from 'antd';
import { NextRouter, useRouter } from 'next/router';
import { useState } from 'react';
import { AiOutlineHome, AiOutlineLogout } from 'react-icons/ai';
import { BiMessageSquareEdit, BiUserCircle, BiNotification } from 'react-icons/bi';

const Nav: React.FC = () => {
  const router: NextRouter = useRouter();

  const [toggleNav, setToggleNav] = useState<boolean>(false);

  const content = (
    <div>
      <p>Content</p>
      <p>Content</p>
    </div>
  );

  const iconArr: JSX.Element[] = [
    <AiOutlineLogout key='logout' size={26} />,
    <Popover
      key='notification'
      placement='right'
      title={'Notifications'}
      content={content}
      trigger='click'
    >
      <BiNotification size={26} />
    </Popover>,
    <BiMessageSquareEdit key='create' size={26} />,
    <BiUserCircle key='profile' size={26} />,
    <AiOutlineHome key='feed' size={26} />,
  ];

  const routingFn = (key: string) => {
    switch (key) {
      case 'logout':
        return;
      case 'feed':
        return router.push('/');
      case 'create':
        return router.push('/blog/create');
      case 'profile':
        return router.push('/profile');
    }
  };

  return (
    <div className='fixed xl:bottom-10 xl:left-auto left-5 bottom-5 flex flex-col z-10'>
      <div
        className={`flex flex-col justify-between h-0 transition-all duration-300 ${
          toggleNav && 'h-[19rem]'
        }`}
      >
        {iconArr.map((el, index) => (
          <Button
            key={index}
            className={`${
              toggleNav ? 'btn opacity-100' : 'opacity-0 [&>*]:h-0 [&>*]:w-0'
            } btn-circle justify-center focus:bg-[#021027] hover:w-40 relative transition-all duration-300 [&>*]:transition-all [&>*]:duration-100 [&>*]:hover:opacity-100`}
            onClick={() => routingFn(el.key as string)}
          >
            <span className='!absolute left-[0.65rem]'>{el}</span>
            <span
              className={`${el.key === 'notification' && 'text-xs'} ${
                !toggleNav && 'hidden'
              } opacity-0 w-fit ml-5`}
            >
              {el.key}
            </span>
          </Button>
        ))}
      </div>

      <label className={`${toggleNav && 'mt-4'} btn btn-circle swap swap-rotate`}>
        <input type='checkbox' onClick={() => setToggleNav((prev) => !prev)} />
        <svg
          className='swap-off fill-current'
          height='32'
          viewBox='0 0 512 512'
          width='32'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path d='M64,384H448V341.33H64Zm0-106.67H448V234.67H64ZM64,128v42.67H448V128Z' />
        </svg>

        <svg
          className='swap-on fill-current'
          height='32'
          viewBox='0 0 512 512'
          width='32'
          xmlns='http://www.w3.org/2000/svg'
        >
          <polygon points='400 145.49 366.51 112 256 222.51 145.49 112 112 145.49 222.51 256 112 366.51 145.49 400 256 289.49 366.51 400 400 366.51 289.49 256 400 145.49' />
        </svg>
      </label>
    </div>
  );
};

export default Nav;
