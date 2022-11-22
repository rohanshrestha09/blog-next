import Image from 'next/image';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Avatar, Badge } from 'antd';
import moment from 'moment';
import { GoPrimitiveDot } from 'react-icons/go';
import NotificationAxios from '../../api/NotificationAxios';
import { errorNotification } from '../../utils/notification';
import { NOTIFICATIONS_STATUS, NOTIFICATIONS_TYPE } from '../../constants/reduxKeys';
import { INotificationData } from '../../interface/notification';
import { GET_NOTIFICATIONS } from '../../constants/queryKeys';

interface Props {
  notification: INotificationData;
}

const { FOLLOW_USER, LIKE_BLOG, LIKE_COMMENT, POST_BLOG, POST_COMMENT } = NOTIFICATIONS_TYPE;

const { UNREAD } = NOTIFICATIONS_STATUS;

const NotificationList: React.FC<Props> = ({
  notification: { _id, type, user, description, blog, comment, status, createdAt },
}) => {
  const queryClient = useQueryClient();

  const notificationAxios = new NotificationAxios();

  const handleMarkAsRead = useMutation((id: string) => notificationAxios.markAsRead(id), {
    onSuccess: () => queryClient.refetchQueries([GET_NOTIFICATIONS]),
    onError: (err: Error) => errorNotification(err),
  });

  const getNotificationBadge = (notificationType: NOTIFICATIONS_TYPE): string => {
    switch (notificationType) {
      case FOLLOW_USER:
        return '/user.png';

      case LIKE_BLOG:
        return '/like.png';

      case LIKE_COMMENT:
        return '/like-comment.png';

      case POST_BLOG:
        return '/plus.png';

      case POST_COMMENT:
        return '/chat.png';

      default:
        return '/like.png';
    }
  };

  return (
    <div
      className={`w-full flex items-center justify-between gap-6 px-2 py-3 cursor-pointer transition-all rounded-lg hover:bg-zinc-900 ${
        status === UNREAD && 'text-white'
      }`}
      onClick={() => status === UNREAD && handleMarkAsRead.mutate(_id)}
    >
      <div className='flex items-center gap-4'>
        <Badge
          count={
            <img
              className='rounded-full'
              alt=''
              src={getNotificationBadge(type)}
              width={25}
              height={25}
            />
          }
          offset={[-5, 50]}
        >
          {user.image ? (
            <Avatar src={<Image alt='' src={user.image} layout='fill' priority />} size={60} />
          ) : (
            <Avatar className='bg-[#1890ff] flex items-center' size={60}>
              <p className='text-2xl'>{user.fullname[0]}</p>
            </Avatar>
          )}
        </Badge>

        <div className='flex flex-col gap-0.5'>
          <span className='text-base inline-flex items-center multiline-truncate-title'>
            {comment ? description.slice(0, -1) : description}
            {comment && <p>{` : "${comment.comment}"`}</p>}
          </span>

          {blog && <p className='font-semibold text-base multiline-truncate-name'>{blog.title}</p>}

          <p className='text-xs'>{moment(createdAt).fromNow()}</p>
        </div>
      </div>

      {status === UNREAD && <GoPrimitiveDot className='text-blue-500' size={24} />}
    </div>
  );
};

export default NotificationList;
