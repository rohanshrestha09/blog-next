import Image from 'next/image';
import { Avatar, Badge } from 'antd';
import { NOTIFICATIONS_TYPE } from '../../constants/reduxKeys';
import { INotificationData } from '../../interface/notification';

interface Props {
  notification: INotificationData;
}

const NotificationList: React.FC<Props> = ({ notification: { user } }) => {
  return (
    <div className='w-full flex gap-4 py-4'>
      <Badge
        count={<img className='rounded-full' alt='' src={'/plus.png'} width={25} height={25} />}
        offset={[-5, 50]}
      >
        {user.image ? (
          <Avatar src={<Image alt='' src={user.image} layout='fill' />} size={60} />
        ) : (
          <Avatar className='bg-[#1890ff] flex items-center' size={60}>
            <p className='text-2xl'>{user.fullname[0]}</p>
          </Avatar>
        )}
      </Badge>
    </div>
  );
};

export default NotificationList;
