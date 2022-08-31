import { useRouter } from 'next/router';
import { useState } from 'react';
import { AiOutlineHome, AiOutlineLogout } from 'react-icons/ai';
import { BiMessageSquareEdit, BiUserCircle, BiNotification } from 'react-icons/bi';

const NavMenu: React.FC = () => {
  const router = useRouter();

  const [toggleNav, setToggleNav] = useState<boolean>(false);

  const iconArr: JSX.Element[] = [
    <AiOutlineLogout key='logout' size={26} />,
    <BiNotification key='notification' size={26} />,
    <BiMessageSquareEdit key='create' size={26} />,
    <BiUserCircle key='profile' size={26} />,
    <AiOutlineHome key='feed' size={26} />,
  ];

  return (
    <div className='fixed lg:bottom-10 lg:left-auto left-5 bottom-5'>
      <ul
        className={`menu rounded-box shadow-lg bg-base-100 h-0 transition-all ${
          toggleNav && 'h-[15.65rem]'
        }`}
      >
        {iconArr.map((el, index) => (
          <li
            key={index}
            className={`${toggleNav ? 'opacity-100' : 'opacity-0'} ${
              !toggleNav && '[&>*]:h-0 [&>*]:w-0'
            }`}
            onClick={() => router.push(el.key as string)}
          >
            <a className='tooltip tooltip-right' data-tip={el.key}>
              {el}
            </a>
          </li>
        ))}
      </ul>

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

export default NavMenu;
