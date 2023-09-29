import Image from 'next/image';
import { useRouter } from 'next/router';
import { ReactNode, Key, Fragment } from 'react';
import { useDispatch } from 'react-redux';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Menu, MenuProps, Badge, Avatar, Dropdown, Button } from 'antd';
import { IconType } from 'react-icons';
import { AiOutlineLogout, AiOutlineMenu, AiOutlineUser } from 'react-icons/ai';
import { BiBookmark, BiMessageSquareEdit, BiSearch } from 'react-icons/bi';
import { BsThreeDots } from 'react-icons/bs';
import { BsAppIndicator, BsHouse } from 'react-icons/bs';
import { useAuth } from 'auth';
import { logout } from 'request/auth';
import { getNotifications } from 'request/notification';
import ChangePassword from '../components/ChangePassword';
import DeleteAccount from '../components/DeleteAccount';
import CompleteProfile from '../components/CompleteProfile';
import { openDrawer, closeDrawer } from 'store/drawerSlice';
import { openModal } from 'store/modalSlice';
import { successNotification, errorNotification } from 'utils/notification';
import { queryKeys } from 'utils';
import { MODAL_KEYS, NAV_KEYS } from 'constants/reduxKeys';
import { NOTIFICATION } from 'constants/queryKeys';

interface Props {
  className?: string;
  isDrawer?: boolean;
}

const { HOME_NAV, PROFILE_NAV, CREATE_NAV, BOOKMARKS_NAV, NOTIF_NAV, LOGOUT_NAV } = NAV_KEYS;

const {
  USER_SUGGESTIONS_MODAL,
  CHANGE_PASSWORD_MODAL,
  DELETE_ACCOUNT_MODAL,
  COMPLETE_PROFILE_MODAL,
} = MODAL_KEYS;

type MenuItem = Required<MenuProps>['items'][number];

export const DesktopNavbar: React.FC<Props> = ({ className, isDrawer }) => {
  const { pathname, push } = useRouter();

  const dispatch = useDispatch();

  const { authUser } = useAuth();

  const { data: notifications } = useQuery({
    queryFn: () => getNotifications({ size: 1 }),
    queryKey: queryKeys(NOTIFICATION).list({ size: 1 }),
  });

  const handleLogout = useMutation(logout, {
    onSuccess: (res) => {
      successNotification(res.message);
      window.location.reload();
    },
    onError: errorNotification,
  });

  const settingItems = [
    {
      key: 'deleteAccount',
      label: (
        <p className={`py-2 ${!authUser?.isVerified ? 'line-through' : 'text-red-500'}`}>
          Delete Account
        </p>
      ),
      onClick: () => dispatch(openModal({ key: DELETE_ACCOUNT_MODAL })),
      disabled: !authUser?.isVerified,
    },
    {
      key: 'changePassword',
      label: <p className={`py-2 ${!authUser?.isVerified && 'line-through'}`}>Change Password</p>,
      onClick: () => dispatch(openModal({ key: CHANGE_PASSWORD_MODAL })),
      disabled: !authUser?.isVerified,
    },
    {
      key: 'resetPassword',
      label: <p className={`py-2 ${!authUser?.isVerified && 'line-through'}`}>Reset Password</p>,
      onClick: () => push('/security/reset-password'),
      disabled: !authUser?.isVerified,
    },
    {
      className: `${authUser?.isVerified && 'hidden'}`,
      key: 'completeAuth',
      label: <p className='py-2'>Complete Profile</p>,
      onClick: () => dispatch(openModal({ key: COMPLETE_PROFILE_MODAL })),
    },
  ];

  const getDrawerItems = (
    label: ReactNode,
    key: Key,
    Icon: IconType,
    children?: MenuItem[],
    type?: 'group',
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
      case LOGOUT_NAV:
        return handleLogout.mutate({});

      case 'blogsansar':
        return push('/');

      default:
        return push(key);
    }
  };

  return (
    <div
      className={`h-screen font-sans flex flex-col justify-between pb-2 ${
        isDrawer && 'bg-[#141414]'
      }`}
    >
      <Menu
        className={`${className} h-full flex flex-col gap-3`}
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

      <div className={`w-full flex flex-col ${isDrawer && 'border-r border-r-[#303030]'}`}>
        <span className='px-4 py-2'>
          <Button
            className={`w-full xl:flex items-center justify-center gap-1.5 ${
              isDrawer ? 'flex' : 'hidden'
            }`}
            icon={<BiSearch />}
            type='primary'
            shape='round'
            size='large'
            onClick={() => dispatch(openModal({ key: USER_SUGGESTIONS_MODAL }))}
          >
            Search Users
          </Button>

          <BiSearch
            className={`w-full xl:hidden cursor-pointer ${isDrawer ? 'hidden' : 'block'}`}
            size={22}
            onClick={() => dispatch(openModal({ key: USER_SUGGESTIONS_MODAL }))}
          />
        </span>

        {authUser && (
          <Fragment>
            <Dropdown
              overlayClassName='font-sans'
              menu={{ items: settingItems }}
              placement='top'
              trigger={['click']}
            >
              <div className='w-full flex items-center justify-between gap-2 p-4 cursor-pointer transition-all hover:bg-zinc-900'>
                <div className='w-full flex items-center gap-3'>
                  <span>
                    {authUser.image ? (
                      <Avatar
                        src={
                          <Image
                            className='object-cover'
                            alt=''
                            src={authUser.image}
                            layout='fill'
                            priority
                          />
                        }
                        size='large'
                      />
                    ) : (
                      <Avatar className='bg-[#1890ff]' size='large'>
                        {authUser?.name?.[0]}
                      </Avatar>
                    )}
                  </span>

                  <p className='text-white text-base multiline-truncate-title'>{authUser?.name}</p>
                </div>

                <BsThreeDots size={20} />
              </div>
            </Dropdown>

            <ChangePassword />

            <CompleteProfile />

            <DeleteAccount />
          </Fragment>
        )}
      </div>
    </div>
  );
};

export const MobileNavbar = () => {
  const { pathname, push } = useRouter();

  const dispatch = useDispatch();

  const { data: notifications } = useQuery({
    queryFn: () => getNotifications({ size: 1 }),
    queryKey: queryKeys(NOTIFICATION).list({ size: 1 }),
  });

  const items = [
    { key: HOME_NAV, name: 'Feed', Icon: BsHouse },
    { key: PROFILE_NAV, name: 'Profile', Icon: AiOutlineUser },
    { key: CREATE_NAV, name: 'Create', Icon: BiMessageSquareEdit },
    { key: NOTIF_NAV, name: 'Notifications', Icon: BsAppIndicator },
  ];

  return (
    <div className='flex justify-between items-center border-t border-[#1F1F1F] px-6'>
      {items.map(({ key, Icon }) => (
        <div
          key={key}
          className={`px-4 py-4 flex justify-center ${
            pathname === key && 'border-t-2 border-[#1677FF]'
          }`}
          onClick={() => push(key)}
        >
          {key === NOTIF_NAV ? (
            <Badge offset={[-1, 1]} count={notifications?.unread}>
              <Icon size={25} className={`${pathname === key && 'text-[#1677FF]'}`} />
            </Badge>
          ) : (
            <Icon size={25} className={`${pathname === key && 'text-[#1677FF]'}`} />
          )}
        </div>
      ))}

      <div className={`px-4 py-4 flex justify-center `} onClick={() => dispatch(openDrawer())}>
        <AiOutlineMenu size={25} />
      </div>
    </div>
  );
};
