import Image from 'next/image';
import { NextRouter, useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Avatar, Badge } from 'antd';
import moment from 'moment';
import { GoPrimitiveDot } from 'react-icons/go';
import { markAsRead } from 'request/notification';
import { useModalStore } from 'store/hooks';
import { errorNotification } from 'utils/notification';
import { queryKeys } from 'utils';
import { MODALS, NOTIFICATIONS_STATUS, NOTIFICATIONS_TYPE } from 'constants/reduxKeys';
import { NOTIFICATION } from 'constants/queryKeys';
import { Notification } from 'interface/models';

interface Props {
  notification: Notification;
  size?: 'small';
}

const { FOLLOW_USER, LIKE_BLOG, LIKE_COMMENT, POST_BLOG, POST_COMMENT } = NOTIFICATIONS_TYPE;

const { UNREAD } = NOTIFICATIONS_STATUS;

const NotificationCard: React.FC<Props> = ({ notification, size }) => {
  const router: NextRouter = useRouter();

  const queryClient = useQueryClient();

  const { openModal: openDiscussionModal } = useModalStore(MODALS.DISCUSSION_MODAL);

  const [isSSR, setIsSSR] = useState(true);

  useEffect(() => {
    setIsSSR(false);
  }, []);

  const handleMarkAsRead = useMutation(markAsRead, {
    onSuccess: () => queryClient.refetchQueries(queryKeys(NOTIFICATION).all),
    onError: errorNotification,
  });

  const getNotificationBadge = (notificationType: keyof typeof NOTIFICATIONS_TYPE): string => {
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

  const notificationRedirection = (
    notificationType: keyof typeof NOTIFICATIONS_TYPE,
    notification: Notification,
  ): void => {
    switch (notificationType) {
      case FOLLOW_USER:
        router.push(`/profile/${notification?.sender?.id}`);
        break;

      case LIKE_BLOG:
      case POST_BLOG:
        router.push(`/blog/${notification?.blog?.slug}`);
        break;

      case LIKE_COMMENT:
      case POST_COMMENT:
        router.push(`/blog/${notification?.blog?.slug}`);
        openDiscussionModal();
    }
  };

  return (
    <div
      className={`w-full font-sans flex items-center justify-between sm:gap-6 gap-2 px-2 py-3 cursor-pointer transition-all rounded-lg hover:bg-zinc-900 ${
        notification?.status === UNREAD && 'text-white'
      }`}
      onClick={() => {
        notification?.status === UNREAD && handleMarkAsRead.mutate(notification?.id);
        notificationRedirection(notification?.type, notification);
      }}
    >
      <div className='flex items-center gap-4'>
        <Badge
          className='sm:block hidden'
          count={
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className='rounded-full'
              alt=''
              src={getNotificationBadge(notification?.type)}
              width={25}
              height={25}
            />
          }
          offset={[-5, 50]}
        >
          {notification?.sender?.image ? (
            <Avatar
              src={
                <Image
                  alt=''
                  className='object-cover'
                  src={notification.sender.image}
                  layout='fill'
                  priority
                />
              }
              size={60}
            />
          ) : (
            <Avatar className='bg-[#1890ff] flex items-center' size={60}>
              <p className='text-2xl'>{notification?.sender?.name[0]}</p>
            </Avatar>
          )}
        </Badge>

        <Badge
          className='sm:hidden'
          count={
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className='rounded-full'
              alt=''
              src={getNotificationBadge(notification?.type)}
              width={20}
              height={20}
            />
          }
          offset={[-5, 40]}
        >
          {notification?.sender?.image ? (
            <Avatar
              src={
                <Image
                  alt=''
                  className='object-cover'
                  src={notification.sender.image}
                  layout='fill'
                  priority
                />
              }
              size={50}
            />
          ) : (
            <Avatar className='bg-[#1890ff] flex items-center' size={50}>
              <p className='text-2xl'>{notification?.sender?.name[0]}</p>
            </Avatar>
          )}
        </Badge>

        <div className='flex flex-col gap-0.5'>
          <span
            className={`sm:text-base text-sm items-center ${
              !size && 'sm:inline-flex sm:multiline-truncate-title'
            }`}
          >
            {notification?.comment
              ? notification?.description.slice(0, -1)
              : notification?.description}
            {notification?.comment && (
              <p
                className={`${
                  !size && 'sm:before:content-[":"] sm:before:px-1'
                } multiline-truncate-title`}
              >{`"${notification?.comment?.content}"`}</p>
            )}
          </span>

          {notification?.blog && (
            <p className='font-semibold sm:text-base text-sm multiline-truncate-name'>
              {notification?.blog?.title}
            </p>
          )}

          {!isSSR ? (
            <p className='text-xs'>{moment(notification?.createdAt).fromNow()}</p>
          ) : (
            <p className='text-xs'>{moment(notification?.createdAt).fromNow()}</p>
          )}
        </div>
      </div>

      {!size && notification?.status === UNREAD && (
        <GoPrimitiveDot className='text-blue-500' size={24} />
      )}
    </div>
  );
};

export default NotificationCard;
