import { NextRouter, useRouter } from 'next/router';
import Image from 'next/image';
import { useState, ReactNode, Key } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Avatar, Drawer, Menu, MenuProps, Tooltip, Comment, Popover } from 'antd';
import { IconType } from 'react-icons';
import { MdOutlineKeyboardArrowRight } from 'react-icons/md';
import { AiOutlineLogout, AiOutlineUser } from 'react-icons/ai';
import { FiEdit3 } from 'react-icons/fi';
import { BsAppIndicator, BsHouse } from 'react-icons/bs';
import { BiMessageSquareEdit, BiUserCircle } from 'react-icons/bi';
import { errorNotification, successNotification } from '../../utils/notification';
import { useAuth } from '../../utils/UserAuth';
import AuthAxios from '../../apiAxios/authAxios';
import type IMessage from '../../interface/message';

const NavDrawer: React.FC = () => {
  const { pathname, push }: NextRouter = useRouter();

  const { authUser } = useAuth();

  const authAxios = new AuthAxios();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [isPopOverOpen, setIsPopOverOpen] = useState(false);

  type MenuItem = Required<MenuProps>['items'][number];

  const handleLogout = useMutation(() => authAxios.logout(), {
    onSuccess: (res: IMessage) => {
      successNotification(res.message);
      window.location.reload();
    },
    onError: (err: Error) => errorNotification(err),
  });

  const getDrawerItems = (
    label: ReactNode,
    key: Key,
    Icon: IconType | null,
    children?: MenuItem[],
    type?: 'group'
  ): MenuItem => {
    return {
      key,
      icon:
        key === '/profile' ? (
          authUser.image ? (
            <Avatar src={<Image alt='' src={authUser.image} layout='fill' />} size={18} />
          ) : (
            <Avatar className='bg-[#1890ff]' size={18}>
              {authUser.fullname[0]}
            </Avatar>
          )
        ) : (
          Icon && <Icon size={18} />
        ),
      children,
      label,
      type,
    } as MenuItem;
  };

  const items: MenuItem[] = [
    { key: 'logout', name: 'Logout', icon: AiOutlineLogout },
    { key: 'notifications', name: 'Notifications', icon: BsAppIndicator },
    { key: '/blog/create/', name: 'Create', icon: BiMessageSquareEdit },
    { key: '/profile/', name: 'Profile', icon: AiOutlineUser },
    { key: '/', name: 'Feed', icon: BsHouse },
  ].map(({ key, name, icon }) => {
    switch (key) {
      case '/profile/':
        return getDrawerItems(
          name,
          key,
          icon,
          authUser && [
            getDrawerItems(authUser.fullname, '/profile', BiUserCircle),
            getDrawerItems('Edit', '/profile/edit', FiEdit3),
          ]
        );

      case 'notifications':
        return getDrawerItems(
          <Popover
            autoAdjustOverflow={false}
            content={[1, 2, 3, 4, 5, 6].map((el) => (
              <Comment
                key={el}
                author={<a className='font-sans'>Han Solo</a>}
                avatar={<Avatar src='https://joeschmoe.io/api/v1/random' alt='Han Solo' />}
                content={
                  <p className='multiline-truncate-title sm:w-80 font-sans'>
                    We supply a series of design principles, practical patterns and high quality
                    design resources (Sketch and Axure), to help people create their product
                    prototypes beautifully and efficiently.
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
            overlayClassName='scrollbar h-[34rem] overflow-y-scroll shadow-md rounded-xl'
            overlayInnerStyle={{ borderRadius: '10px' }}
            trigger='click'
          >
            {name}
          </Popover>,
          key,
          icon
        );

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

      default:
        return push(key);
    }
  };

  return (
    <>
      <MdOutlineKeyboardArrowRight
        className='fixed left-4 top-[51%] cursor-pointer text-slate-600 hover:bg-gray-200 rounded-full z-50'
        size={40}
        onClick={() => setIsDrawerOpen(true)}
      />

      <Drawer
        title='Menu'
        placement='left'
        closable={false}
        onClose={() => setIsDrawerOpen(false)}
        open={isDrawerOpen}
        headerStyle={{ fontFamily: 'Poppins' }}
        bodyStyle={{ padding: 0, margin: 0 }}
        contentWrapperStyle={{ width: 'auto', height: 'auto' }}
      >
        <Menu
          className='w-72 !font-sans'
          mode='inline'
          defaultSelectedKeys={[pathname]}
          items={items}
          onClick={({ key }) => routingFn(key)}
        />
      </Drawer>
    </>
  );
};

export default NavDrawer;
