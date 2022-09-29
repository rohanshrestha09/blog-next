import { NextRouter, useRouter } from 'next/router';
import { useState, ReactNode, Key, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Avatar, Menu, MenuProps, Popover, Tooltip, Comment } from 'antd';
import { IconType } from 'react-icons';
import { AiOutlineLogout, AiOutlineUser } from 'react-icons/ai';
import { BiMessageSquareEdit } from 'react-icons/bi';
import { BsAppIndicator, BsHouse } from 'react-icons/bs';
import AuthAxios from '../../apiAxios/authAxios';
import { successNotification, errorNotification } from '../../utils/notification';
import type IMessage from '../../interface/message';

interface Props {
  additionalProps?: string;
  isDrawer?: boolean;
}

type MenuItem = Required<MenuProps>['items'][number];

const Nav: React.FC<Props> = ({ additionalProps, isDrawer }) => {
  const { pathname, push }: NextRouter = useRouter();

  const authAxios = new AuthAxios();

  const [isPopOverOpen, setIsPopOverOpen] = useState(false);

  const handleLogout = useMutation(() => authAxios.logout(), {
    onSuccess: (res: IMessage) => {
      successNotification(res.message);
      window.location.reload();
    },
    onError: (err: Error) => errorNotification(err),
  });

  const getPopoverContent = (name: string) => (
    <Popover
      autoAdjustOverflow={false}
      content={[1, 2, 3, 4, 5, 6].map((el) => (
        <Comment
          key={el}
          author={<a className='font-sans'>Han Solo</a>}
          avatar={<Avatar src='https://joeschmoe.io/api/v1/random' alt='Han Solo' />}
          content={
            <p className='multiline-truncate-title sm:w-80 font-sans'>
              We supply a series of design principles, practical patterns and high quality design
              resources (Sketch and Axure), to help people create their product prototypes
              beautifully and efficiently.
            </p>
          }
          datetime={
            <Tooltip title='2016-11-22 11:22:33'>
              <span className='font-sans'>8 hours ago</span>
            </Tooltip>
          }
        />
      ))}
      placement='bottomLeft'
      open={isPopOverOpen}
      onOpenChange={(open) => setIsPopOverOpen(open)}
      overlayClassName='h-[34rem] overflow-y-scroll shadow-md rounded-xl'
      overlayInnerStyle={{ borderRadius: '10px' }}
      trigger='click'
    >
      {name}
    </Popover>
  );

  const getDrawerItems = (
    label: ReactNode,
    key: Key,
    Icon: IconType,
    children?: MenuItem[],
    type?: 'group'
  ): MenuItem => {
    return {
      key,
      icon: <Icon size={18} />,
      children,
      label,
      type,
    } as MenuItem;
  };

  const items: MenuItem[] = [
    { key: 'logout', name: 'Logout', icon: AiOutlineLogout },
    { key: 'notifications', name: 'Notifications', icon: BsAppIndicator },
    { key: '/blog/create', name: 'Create', icon: BiMessageSquareEdit },
    { key: '/profile', name: 'Profile', icon: AiOutlineUser },
    { key: '/', name: 'Feed', icon: BsHouse },
  ].map(({ key, name, icon }) => {
    switch (key) {
      case 'notifications':
        return getDrawerItems(getPopoverContent(name), key, icon);

      default:
        return getDrawerItems(name, key, icon);
    }
  });

  const routingFn = (key: string) => {
    switch (key) {
      case 'logout':
        return handleLogout.mutate();

      case 'notifications':
        return setIsPopOverOpen(true);

      case 'blogsansar':
        return push('/');

      default:
        return push(key);
    }
  };

  return (
    <Menu
      className={`${additionalProps} !font-sans h-full flex flex-col gap-3`}
      mode='inline'
      defaultSelectedKeys={[pathname]}
      items={[
        {
          key: 'blogsansar',
          label: (
            <span
              className={`font-megrim text-current font-black md:text-3xl text-2xl cursor-pointer lg:after:content-["BlogSansar"] ${
                isDrawer ? 'after:content-["BlogSansar"]' : 'after:content-["B"]'
              }`}
            ></span>
          ),
        },
        ...items,
      ]}
      onClick={({ key }) => routingFn(key)}
    />
  );
};

export default Nav;
