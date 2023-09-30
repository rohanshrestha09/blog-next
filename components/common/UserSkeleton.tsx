import Image from 'next/image';
import { NextRouter, useRouter } from 'next/router';
import { useDispatch } from 'react-redux';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Avatar, Button, Space } from 'antd';
import { useAuth } from 'auth';
import { followUser, unfollowUser } from 'request/user';
import { errorNotification, successNotification } from 'utils/notification';
import { closeModal } from 'store/modalSlice';
import { queryKeys } from 'utils';
import { MODAL_KEYS } from 'constants/reduxKeys';
import { FOLLOWER, FOLLOWING } from 'constants/queryKeys';
import { User } from 'interface/models';

interface Props {
  user: User;
  descriptionMode: 'bio' | 'followersCount';
  isModal?: boolean;
}

const { USER_SUGGESTIONS_MODAL } = MODAL_KEYS;

const UserSkeleton: React.FC<Props> = ({ user, descriptionMode, isModal }) => {
  const router: NextRouter = useRouter();

  const dispatch = useDispatch();

  const { authUser } = useAuth();

  const queryClient = useQueryClient();

  const handleFollowUser = useMutation(followUser, {
    onSuccess: (res) => {
      successNotification(res.message);
      queryClient.refetchQueries(queryKeys(FOLLOWER).all);
      queryClient.refetchQueries(queryKeys(FOLLOWING).all);
    },
    onError: errorNotification,
  });

  const handleUnfollowUser = useMutation(unfollowUser, {
    onSuccess: (res) => {
      successNotification(res.message);
      queryClient.refetchQueries(queryKeys(FOLLOWER).all);
      queryClient.refetchQueries(queryKeys(FOLLOWING).all);
    },
    onError: errorNotification,
  });

  return (
    <div className='w-full flex items-center justify-between mb-5'>
      <div className='flex items-center gap-4'>
        {user?.image ? (
          <Avatar
            src={<Image alt='' className='object-cover' src={user?.image} layout='fill' priority />}
            size='large'
          />
        ) : (
          <Avatar className='bg-[#1890ff] flex items-center text-lg' size='large'>
            {user?.name[0]}
          </Avatar>
        )}

        <Space className='w-48' direction='vertical' size={0}>
          <p
            className='text-sm text-white multiline-truncate-title break-words cursor-pointer'
            onClick={() => {
              router.push(`/profile/${user?.id}`);
              isModal && dispatch(closeModal({ key: USER_SUGGESTIONS_MODAL }));
            }}
          >
            {user?.name}
          </p>

          {descriptionMode === 'bio' && user?.bio ? (
            <p className='multiline-truncate-title text-xs text-zinc-500 break-words'>
              {user?.bio}
            </p>
          ) : (
            <p className='text-sm text-zinc-500 break-words'>
              {user?._count?.followedBy} followers
            </p>
          )}
        </Space>
      </div>

      <Button
        type='primary'
        className='rounded-lg text-xs'
        hidden={authUser?.id === user?.id}
        size='small'
        danger={user?.followedByViewer}
        loading={user?.followedByViewer ? handleUnfollowUser.isLoading : handleFollowUser.isLoading}
        onClick={() =>
          user?.followedByViewer
            ? handleUnfollowUser.mutate(user?.id)
            : handleFollowUser.mutate(user?.id)
        }
      >
        {!user?.followedByViewer ? 'Follow' : 'Unfollow'}
      </Button>
    </div>
  );
};

export default UserSkeleton;
