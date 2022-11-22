import Image from 'next/image';
import { NextRouter, useRouter } from 'next/router';
import { ReactNode, Key } from 'react';
import { useDispatch } from 'react-redux';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Menu, MenuProps, Badge, Avatar, Dropdown } from 'antd';
import { IconType } from 'react-icons';
import { AiOutlineLogout, AiOutlineUser } from 'react-icons/ai';
import { BiBookmark, BiMessageSquareEdit } from 'react-icons/bi';
import { BsThreeDots } from 'react-icons/bs';
import { BsAppIndicator, BsHouse } from 'react-icons/bs';
import { useAuth } from '../../utils/UserAuth';
import AuthAxios from '../../api/AuthAxios';
import NotificationAxios from '../../api/NotificationAxios';
import { closeDrawer } from '../../store/drawerSlice';
import { successNotification, errorNotification } from '../../utils/notification';
import { NAV_KEYS } from '../../constants/reduxKeys';
import { GET_NOTIFICATIONS } from '../../constants/queryKeys';

interface Props {
  additionalProps?: string;
  isDrawer?: boolean;
}

const { HOME_NAV, PROFILE_NAV, CREATE_NAV, BOOKMARKS_NAV, NOTIF_NAV, LOGOUT_NAV } = NAV_KEYS;

type MenuItem = Required<MenuProps>['items'][number];

const Nav: React.FC<Props> = ({ additionalProps, isDrawer }) => {
  const { pathname, push }: NextRouter = useRouter();

  const dispatch = useDispatch();

  const { authUser } = useAuth();

  const authAxios = new AuthAxios();

  const notificationAxios = new NotificationAxios();

  const { data: notifications } = useQuery({
    queryFn: () => notificationAxios.getNotifications({ pageSize: 1 }),
    queryKey: [GET_NOTIFICATIONS, { pageSize: 1 }],
  });

  const handleLogout = useMutation(() => authAxios.logout(), {
    onSuccess: (res) => {
      successNotification(res.message);
      window.location.reload();
    },
    onError: (err: Error) => errorNotification(err),
  });

  const settingItems = [
    {
      key: 'logout',
      label: (
        <p className='py-2 text-red-500' onClick={() => routingFn(LOGOUT_NAV)}>
          Logout
        </p>
      ),
    },
    {
      key: 'changePassword',
      label: <p className='py-2'>Change Password</p>,
    },
    {
      key: 'resetPassword',
      label: <p className='py-2'>Reset Password</p>,
    },
  ];

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
            <Badge offset={[1, -18]} count={notifications?.unread} />
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

  const routingFn = (key: NAV_KEYS | 'blogsansar') => {
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
    <div className={`h-screen flex flex-col justify-between pb-${isDrawer ? '0' : '4'}`}>
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
          routingFn(key as NAV_KEYS);
          dispatch(closeDrawer());
        }}
      />

      {authUser && (
        <Dropdown
          overlayClassName='font-sans'
          menu={{ items: settingItems }}
          placement='top'
          trigger={['click']}
        >
          <div className='font-sans w-full flex items-center justify-between gap-2 p-4 cursor-pointer transition-all hover:bg-zinc-900'>
            <div className='w-full flex items-center gap-3'>
              <span>
                {authUser.image ? (
                  <Avatar
                    src={<Image alt='' src={authUser.image} layout='fill' priority />}
                    size='large'
                  />
                ) : (
                  <Avatar className='bg-[#1890ff]' size='large'>
                    {authUser.fullname[0]}
                  </Avatar>
                )}
              </span>

              <p className='text-white text-base multiline-truncate-title'>{authUser.fullname}</p>
            </div>

            <BsThreeDots size={20} />
          </div>
        </Dropdown>
      )}
    </div>
  );
};

export default Nav;
