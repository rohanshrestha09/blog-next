import { NextRouter, useRouter } from 'next/router';
import Image from 'next/image';
import { useContext, useState, ReactNode, Key } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Avatar, Drawer, Menu, MenuProps } from 'antd';
import { IconType } from 'react-icons';
import { MdOutlineKeyboardArrowRight } from 'react-icons/md';
import { AiOutlineLogout, AiOutlineUser } from 'react-icons/ai';
import { FiEdit3 } from 'react-icons/fi';
import { BsAppIndicator, BsHouse } from 'react-icons/bs';
import { BiMessageSquareEdit, BiUserCircle } from 'react-icons/bi';
import UserAxios from '../../apiAxios/userAxios';
import userContext from '../../utils/userContext';
import { openErrorNotification, openSuccessNotification } from '../../utils/openNotification';
import IMessage from '../../interface/message';

const NavDrawer: React.FC = () => {
  const { pathname, push }: NextRouter = useRouter();

  const { user } = useContext(userContext);

  const userAxios = new UserAxios();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  type MenuItem = Required<MenuProps>['items'][number];

  const handleLogout = useMutation(() => userAxios.logout(), {
    onSuccess: (res: IMessage) => {
      openSuccessNotification(res.message);
      window.location.reload();
    },
    onError: (err: Error | any) => openErrorNotification(err.response.data.message),
  });

  const getDrawerItems = (
    label: ReactNode,
    key: Key,
    Icon: IconType,
    children?: MenuItem[],
    type?: 'group'
  ): MenuItem => {
    return {
      key,
      icon:
        key === '/profile' ? (
          user.image ? (
            <Avatar src={<Image alt='' src={user.image} layout='fill' />} size={18} />
          ) : (
            <Avatar className='bg-[#1890ff]' size={18}>
              {user.fullname[0]}
            </Avatar>
          )
        ) : (
          <Icon size={18} />
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
          user && [
            getDrawerItems(user.fullname, '/profile', BiUserCircle),
            getDrawerItems('Edit', '/profile/edit', FiEdit3),
          ]
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
        return;

      default:
        return push(key);
    }
  };

  return (
    <>
      <MdOutlineKeyboardArrowRight
        className='fixed left-4 top-1/2 translate-y-1/2 cursor-pointer text-slate-600 hover:bg-gray-200 rounded-full z-50'
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
          className='w-60 !font-sans'
          mode='inline'
          defaultSelectedKeys={[pathname]}
          items={items}
          onSelect={({ key }) => routingFn(key)}
        />
      </Drawer>
    </>
  );
};

export default NavDrawer;
