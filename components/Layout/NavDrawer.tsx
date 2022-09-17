import { NextRouter, useRouter } from 'next/router';
import { Key, useState } from 'react';
import { capitalize } from 'lodash';
import { Drawer, Menu, MenuProps } from 'antd';
import { MdOutlineKeyboardArrowRight } from 'react-icons/md';
import { AiOutlineHome, AiOutlineLogout } from 'react-icons/ai';
import { FiEdit3 } from 'react-icons/fi';
import { IoMdShareAlt } from 'react-icons/io';
import { BiMessageSquareEdit, BiUserCircle, BiNotification } from 'react-icons/bi';

const NavDrawer: React.FC = () => {
  const { pathname, push }: NextRouter = useRouter();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  type MenuItem = Required<MenuProps>['items'][number];

  function getItem(
    label: React.ReactNode,
    key: React.Key,
    icon?: React.ReactNode,
    children?: MenuItem[],
    type?: 'group'
  ): MenuItem {
    return {
      key,
      icon,
      children,
      label,
      type,
    } as MenuItem;
  }

  const getDrawerItem = (key: Key, icon: JSX.Element) => {
    switch (key) {
      case 'profile':
        return getItem(capitalize(icon.key as string), icon.key as Key, icon, [
          getItem('Visit', 'visit', <IoMdShareAlt />),
          getItem('Edit', 'edit', <FiEdit3 />),
        ]);

      default:
        return getItem(capitalize(icon.key as string), icon.key as Key, icon);
    }
  };

  const items: MenuItem[] = [
    <AiOutlineLogout key='logout' />,
    <BiNotification key='notification' />,
    <BiMessageSquareEdit key='create' />,
    <BiUserCircle key='profile' />,
    <AiOutlineHome key='feed' />,
  ].map((icon) => getDrawerItem(icon.key as Key, icon));

  const routingFn = (key: string) => {
    switch (key) {
      case 'logout':
        return;
      case 'feed':
        return push('/');
      case 'create':
        return push('/blog/create');
      case 'visit':
        return push('/profile');
    }
  };

  return (
    <>
      <MdOutlineKeyboardArrowRight
        className='fixed left-4 top-1/2 translate-y-1/2 cursor-pointer text-slate-600 hover:bg-gray-200 rounded-full'
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
          onSelect={(el) => routingFn(el.key)}
        />
      </Drawer>
    </>
  );
};

export default NavDrawer;
