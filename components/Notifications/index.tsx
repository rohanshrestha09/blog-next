import Image from 'next/image';
import { NextRouter, useRouter } from 'next/router';
import { useDispatch } from 'react-redux';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Avatar, Badge } from 'antd';
import moment from 'moment';
import { GoPrimitiveDot } from 'react-icons/go';
import NotificationAxios from '../../api/NotificationAxios';
import { errorNotification } from '../../utils/notification';
import { openModal } from '../../store/modalSlice';
import { MODAL_KEYS, NOTIFICATIONS_STATUS, NOTIFICATIONS_TYPE } from '../../constants/reduxKeys';
import { INotificationData } from '../../interface/notification';
import { GET_NOTIFICATIONS } from '../../constants/queryKeys';

interface Props {
  notification: INotificationData;
  smallContainer?: boolean;
}

const { FOLLOW_USER, LIKE_BLOG, LIKE_COMMENT, POST_BLOG, POST_COMMENT } = NOTIFICATIONS_TYPE;

const { UNREAD } = NOTIFICATIONS_STATUS;

const { DISCUSSIONS_MODAL } = MODAL_KEYS;

const NotificationList: React.FC<Props> = ({
  notification: { _id, type, user, description, blog, comment, status, createdAt },
  smallContainer,
}) => {
  const router: NextRouter = useRouter();

  const queryClient = useQueryClient();

  const dispatch = useDispatch();

  const notificationAxios = new NotificationAxios();

  const handleMarkAsRead = useMutation((id: string) => notificationAxios.markAsRead(id), {
    onSuccess: () => queryClient.refetchQueries([GET_NOTIFICATIONS]),
    onError: (err: AxiosError) => errorNotification(err),
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

  const notificationRedirection = (notificationType: NOTIFICATIONS_TYPE): void => {
    switch (notificationType) {
      case FOLLOW_USER:
        router.push(`/profile/${user._id}`);
        break;

      case LIKE_BLOG:
      case POST_BLOG:
        router.push(`/${blog?._id}`);
        break;

      case LIKE_COMMENT:
      case POST_COMMENT:
        router.push(`/${blog?._id}`);
        dispatch(openModal({ key: DISCUSSIONS_MODAL }));
    }
  };

  return (
    <div
      className={`w-full font-sans flex items-center justify-between sm:gap-6 gap-2 px-2 py-3 cursor-pointer transition-all rounded-lg hover:bg-zinc-900 ${
        status === UNREAD && 'text-white'
      }`}
      onClick={() => {
        status === UNREAD && handleMarkAsRead.mutate(_id);
        notificationRedirection(type);
      }}
    >
      <div className='flex items-center gap-4'>
        <Badge
          className='sm:block hidden'
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
            <Avatar
              src={
                <Image alt='' className='object-cover' src={user.image} layout='fill' priority />
              }
              size={60}
            />
          ) : (
            <Avatar className='bg-[#1890ff] flex items-center' size={60}>
              <p className='text-2xl'>{user.fullname[0]}</p>
            </Avatar>
          )}
        </Badge>

        <Badge
          className='sm:hidden'
          count={
            <img
              className='rounded-full'
              alt=''
              src={getNotificationBadge(type)}
              width={20}
              height={20}
            />
          }
          offset={[-5, 40]}
        >
          {user.image ? (
            <Avatar
              src={
                <Image alt='' className='object-cover' src={user.image} layout='fill' priority />
              }
              size={50}
            />
          ) : (
            <Avatar className='bg-[#1890ff] flex items-center' size={50}>
              <p className='text-2xl'>{user.fullname[0]}</p>
            </Avatar>
          )}
        </Badge>

        <div className='flex flex-col gap-0.5'>
          <span
            className={`sm:text-base text-sm items-center ${
              !smallContainer && 'sm:inline-flex sm:multiline-truncate-title'
            }`}
          >
            {comment ? description.slice(0, -1) : description}
            {comment && (
              <p
                className={`${
                  !smallContainer && 'sm:before:content-[":"] sm:before:px-1'
                } multiline-truncate-title`}
              >{`"${comment.comment}"`}</p>
            )}
          </span>

          {blog && (
            <p className='font-semibold sm:text-base text-sm multiline-truncate-name'>
              {blog.title}
            </p>
          )}

          <p className='text-xs'>{moment(createdAt).fromNow()}</p>
        </div>
      </div>

      {!smallContainer && status === UNREAD && (
        <GoPrimitiveDot className='text-blue-500' size={24} />
      )}
    </div>
  );
};

export default NotificationList;
