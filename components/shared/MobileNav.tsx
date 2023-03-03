import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { AiOutlineMenu, AiOutlineUser } from 'react-icons/ai';
import { BiMessageSquareEdit } from 'react-icons/bi';
import { BsAppIndicator, BsHouse } from 'react-icons/bs';
import { useDispatch } from 'react-redux';
import NotificationAxios from '../../api/NotificationAxios';
import { openDrawer } from '../../store/drawerSlice';
import { NAV_KEYS } from '../../constants/reduxKeys';
import { GET_NOTIFICATIONS } from '../../constants/queryKeys';
import { Badge } from 'antd';

const { HOME_NAV, PROFILE_NAV, CREATE_NAV, NOTIF_NAV } = NAV_KEYS;

const MobileNav = () => {
  const { pathname, push } = useRouter();

  const dispatch = useDispatch();

  const notificationAxios = NotificationAxios();

  const { data: notifications } = useQuery({
    queryFn: () => notificationAxios.getNotifications({ size: 1 }),
    queryKey: [GET_NOTIFICATIONS, { size: 1 }],
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

export default MobileNav;
