import Image from 'next/image';
import { useRouter } from 'next/router';
import { Fragment } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Menu, MenuProps, Badge, Avatar, Dropdown, Button } from 'antd';
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
import { useModalStore, useDrawerStore } from 'store/hooks';
import { successNotification, errorNotification } from 'utils/notification';
import { queryKeys } from 'utils';
import { MODALS } from 'constants/reduxKeys';
import { NOTIFICATION } from 'constants/queryKeys';

interface Props {
  className?: string;
  isDrawer?: boolean;
}

type MenuItem = Required<MenuProps>['items'][number];

export const DesktopNavbar: React.FC<Props> = ({ className, isDrawer }) => {
  const { pathname, push } = useRouter();

  const { openModal: openUserSuggestionModal } = useModalStore(MODALS.USER_SUGGESTION_MODAL);

  const { openModal: openChangePasswordModal } = useModalStore(MODALS.CHANGE_PASSWORD_MODAL);

  const { openModal: openDeleteAccountModal } = useModalStore(MODALS.DELETE_ACCOUNT_MODAL);

  const { openModal: openCompleteProfileModal } = useModalStore(MODALS.COMPLETE_PROFILE_MODAL);

  const { closeDrawer } = useDrawerStore();

  const { authUser } = useAuth();

  const { data: notifications } = useQuery({
    queryFn: () => getNotifications({ size: 1 }),
    queryKey: queryKeys(NOTIFICATION).list({ size: 1 }),
  });

  const handleLogout = useMutation(logout, {
    onSuccess: (res) => {
      successNotification(res.message);
      localStorage.clear();
      window.location.reload();
    },
    onError: errorNotification,
  });

  const settingItems = [
    {
      key: 'deleteAccount',
      label: (
        <p className={`py-2 ${!authUser?.isVerified ? 'line-through' : 'text-[red]'}`}>
          Delete Account
        </p>
      ),
      onClick: openDeleteAccountModal,
      disabled: !authUser?.isVerified,
    },
    {
      key: 'changePassword',
      label: <p className={`py-2 ${!authUser?.isVerified && 'line-through'}`}>Change Password</p>,
      onClick: openChangePasswordModal,
      disabled: !authUser?.isVerified,
    },
    {
      key: 'resetPassword',
      label: <p className={`py-2 ${!authUser?.isVerified && 'line-through'}`}>Reset Password</p>,
      onClick: () => push('/auth/reset-password'),
      disabled: !authUser?.isVerified,
    },
    {
      className: `${authUser?.isVerified && 'hidden'}`,
      key: 'completeAuth',
      label: <p className='py-2'>Complete Profile</p>,
      onClick: openCompleteProfileModal,
    },
  ];

  const items: MenuItem[] = [
    {
      key: 'logout',
      label: 'Logout',
      icon: <AiOutlineLogout size={18} />,
      onClick: () => handleLogout.mutate(undefined),
      danger: true,
    },
    {
      key: '/notifications',
      label: (
        <>
          Notifications
          <Badge offset={[1, -18]} count={notifications?.unread} />
        </>
      ),
      icon: <BsAppIndicator size={18} />,
      onClick: () => push('/notifications'),
    },
    {
      key: '/blog/create',
      label: 'Create',
      icon: <BiMessageSquareEdit size={18} />,
      onClick: () => push('/blog/create'),
    },
    {
      key: '/blog/bookmark',
      label: 'Bookmarks',
      icon: <BiBookmark size={18} />,
      onClick: () => push('/blog/bookmark'),
    },
    {
      key: '/profile',
      label: 'Profile',
      icon: <AiOutlineUser size={18} />,
      onClick: () => push('/profile'),
    },
    {
      key: '/',
      label: 'Feed',
      icon: <BsHouse size={18} />,
      onClick: () => push('/'),
    },
  ];

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
        onClick={() => {
          closeDrawer();
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
            onClick={openUserSuggestionModal}
          >
            Search Users
          </Button>

          <BiSearch
            className={`w-full xl:hidden cursor-pointer ${isDrawer ? 'hidden' : 'block'}`}
            size={22}
            onClick={openUserSuggestionModal}
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

  const { openDrawer } = useDrawerStore();

  const { data: notifications } = useQuery({
    queryFn: () => getNotifications({ size: 1 }),
    queryKey: queryKeys(NOTIFICATION).list({ size: 1 }),
  });

  const items = [
    { key: '/', name: 'Feed', Icon: BsHouse },
    { key: '/profile', name: 'Profile', Icon: AiOutlineUser },
    { key: '/blog/create', name: 'Create', Icon: BiMessageSquareEdit },
    { key: '/notifications', name: 'Notifications', Icon: BsAppIndicator },
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
          {key === '/notifications' ? (
            <Badge offset={[-1, 1]} count={notifications?.unread}>
              <Icon size={25} className={`${pathname === key && 'text-[#1677FF]'}`} />
            </Badge>
          ) : (
            <Icon size={25} className={`${pathname === key && 'text-[#1677FF]'}`} />
          )}
        </div>
      ))}

      <div className={`px-4 py-4 flex justify-center`} onClick={openDrawer}>
        <AiOutlineMenu size={25} />
      </div>
    </div>
  );
};
