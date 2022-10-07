import { NextRouter, useRouter } from 'next/router';
import { ReactNode, Key } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Menu, MenuProps } from 'antd';
import { IconType } from 'react-icons';
import { AiOutlineLogout, AiOutlineUser } from 'react-icons/ai';
import { BiBookmark, BiMessageSquareEdit } from 'react-icons/bi';
import { BsAppIndicator, BsHouse } from 'react-icons/bs';
import AuthAxios from '../../apiAxios/authAxios';
import { successNotification, errorNotification } from '../../utils/notification';
import { NAV_KEYS } from '../../constants/reduxKeys';
import type IMessage from '../../interface/message';

interface Props {
  additionalProps?: string;
  isDrawer?: boolean;
}

const { HOME, PROFILE, CREATE, BOOKMARKS, NOTIFICATIONS, LOGOUT } = NAV_KEYS;

type MenuItem = Required<MenuProps>['items'][number];

const Nav: React.FC<Props> = ({ additionalProps, isDrawer }) => {
  const { pathname, push }: NextRouter = useRouter();

  const authAxios = new AuthAxios();

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
      danger: key === LOGOUT,
    } as MenuItem;
  };

  const items: MenuItem[] = [
    { key: LOGOUT, name: 'Logout', icon: AiOutlineLogout },
    { key: NOTIFICATIONS, name: 'Notifications', icon: BsAppIndicator },
    { key: CREATE, name: 'Create', icon: BiMessageSquareEdit },
    { key: BOOKMARKS, name: 'Bookmarks', icon: BiBookmark },
    { key: PROFILE, name: 'Profile', icon: AiOutlineUser },
    { key: HOME, name: 'Feed', icon: BsHouse },
  ].map(({ key, name, icon }) => getDrawerItems(name, key, icon));

  const routingFn = (key: string) => {
    switch (key) {
      case 'logout':
        return handleLogout.mutate();

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
              className={`font-megrim text-current font-black md:text-3xl text-2xl cursor-pointer xl:after:content-["BlogSansar"] ${
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
