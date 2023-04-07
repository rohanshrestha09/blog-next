import Image from 'next/image';
import { NextRouter, useRouter } from 'next/router';
import { ReactNode, Key, Fragment } from 'react';
import { signOut } from 'firebase/auth';
import { useDispatch } from 'react-redux';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Menu, MenuProps, Badge, Avatar, Dropdown, Button } from 'antd';
import { IconType } from 'react-icons';
import { AiOutlineLogout, AiOutlineUser } from 'react-icons/ai';
import { BiBookmark, BiMessageSquareEdit, BiSearch } from 'react-icons/bi';
import { BsThreeDots } from 'react-icons/bs';
import { BsAppIndicator, BsHouse } from 'react-icons/bs';
import { useAuth } from '../../utils/UserAuth';
import { auth } from '../../utils/firebase';
import AuthAxios from '../../api/AuthAxios';
import NotificationAxios from '../../api/NotificationAxios';
import ChangePassword from './ChangePassword';
import DeleteAccount from './DeleteAccount';
import CompleteAuth from './CompleteAuth';
import { closeDrawer } from '../../store/drawerSlice';
import { openModal } from '../../store/modalSlice';
import { successNotification, errorNotification } from '../../utils/notification';
import { MODAL_KEYS, NAV_KEYS } from '../../constants/reduxKeys';
import { GET_NOTIFICATIONS } from '../../constants/queryKeys';

interface Props {
  additionalProps?: string;
  isDrawer?: boolean;
}

const { HOME_NAV, PROFILE_NAV, CREATE_NAV, BOOKMARKS_NAV, NOTIF_NAV, LOGOUT_NAV } = NAV_KEYS;

const { USER_SUGGESTIONS_MODAL, CHANGE_PASSWORD_MODAL, DELETE_ACCOUNT_MODAL, COMPLETE_AUTH_MODAL } =
  MODAL_KEYS;

type MenuItem = Required<MenuProps>['items'][number];

const Nav: React.FC<Props> = ({ additionalProps, isDrawer }) => {
  const { pathname, push }: NextRouter = useRouter();

  const dispatch = useDispatch();

  const { authUser } = useAuth();

  const authAxios = AuthAxios();

  const notificationAxios = NotificationAxios();

  const { data: notifications } = useQuery({
    queryFn: () => notificationAxios.getNotifications({ size: 1 }),
    queryKey: [GET_NOTIFICATIONS, { size: 1 }],
  });

  const handleLogout = useMutation(() => authAxios.logout(), {
    onSuccess: (res) => {
      successNotification(res.message);
      window.location.reload();
    },
    onError: (err: AxiosError) => errorNotification(err),
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
      onClick: () => dispatch(openModal({ key: COMPLETE_AUTH_MODAL })),
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
      case LOGOUT_NAV:
        signOut(auth);
        return handleLogout.mutate();

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
        className={`${additionalProps} h-full flex flex-col gap-3`}
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
                        {authUser.fullname[0]}
                      </Avatar>
                    )}
                  </span>

                  <p className='text-white text-base multiline-truncate-title'>
                    {authUser.fullname}
                  </p>
                </div>

                <BsThreeDots size={20} />
              </div>
            </Dropdown>

            <ChangePassword />

            <CompleteAuth />

            <DeleteAccount />
          </Fragment>
        )}
      </div>
    </div>
  );
};

export default Nav;
