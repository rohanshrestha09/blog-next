import { NextRouter, useRouter } from 'next/router';
import { ReactNode, Key } from 'react';
import { useDispatch } from 'react-redux';
import { useMutation } from '@tanstack/react-query';
import { Menu, MenuProps, Badge } from 'antd';
import { IconType } from 'react-icons';
import { AiOutlineLogout, AiOutlineUser } from 'react-icons/ai';
import { BiBookmark, BiMessageSquareEdit } from 'react-icons/bi';
import { BsAppIndicator, BsHouse } from 'react-icons/bs';
import AuthAxios from '../../api/AuthAxios';
import { closeDrawer } from '../../store/drawerSlice';
import { successNotification, errorNotification } from '../../utils/notification';
import { NAV_KEYS } from '../../constants/reduxKeys';

interface Props {
  additionalProps?: string;
  isDrawer?: boolean;
}

const { HOME_NAV, PROFILE_NAV, CREATE_NAV, BOOKMARKS_NAV, NOTIF_NAV, LOGOUT_NAV } = NAV_KEYS;

type MenuItem = Required<MenuProps>['items'][number];

const Nav: React.FC<Props> = ({ additionalProps, isDrawer }) => {
  const { pathname, push }: NextRouter = useRouter();

  const dispatch = useDispatch();

  const authAxios = new AuthAxios();

  const handleLogout = useMutation(() => authAxios.logout(), {
    onSuccess: (res) => {
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
      label:
        key === NOTIF_NAV ? (
          <>
            {label}
            <Badge offset={[1, -18]} count={24} />
          </>
        ) : (
          label
        ),
      type,
      danger: key === LOGOUT_NAV,
    } as MenuItem;
  };

  const items: MenuItem[] = [
    { key: LOGOUT_NAV, name: 'Logout', icon: AiOutlineLogout },
    { key: NOTIF_NAV, name: 'Notifications', icon: BsAppIndicator },
    { key: CREATE_NAV, name: 'Create', icon: BiMessageSquareEdit },
    { key: BOOKMARKS_NAV, name: 'Bookmarks', icon: BiBookmark },
    { key: PROFILE_NAV, name: 'Profile', icon: AiOutlineUser },
    { key: HOME_NAV, name: 'Feed', icon: BsHouse },
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
      className={`${additionalProps} font-sans h-full flex flex-col gap-3`}
      mode='inline'
      defaultSelectedKeys={[pathname]}
      items={[
        {
          key: 'blogsansar',
          label: (
            <span
              className={`font-shalimar text-white text-5xl cursor-pointer xl:after:content-["BlogSansar"] ${
                isDrawer ? 'after:content-["BlogSansar"]' : 'after:content-["B"]'
              }`}
            ></span>
          ),
        },
        ...items,
      ]}
      onClick={({ key }) => {
        routingFn(key);
        dispatch(closeDrawer());
      }}
    />
  );
};

export default Nav;
