import Image from 'next/image';
import { NextRouter, useRouter } from 'next/router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Avatar, Button, Space } from 'antd';
import { useAuth } from '../../utils/UserAuth';
import AuthAxios from '../../api/AuthAxios';
import { errorNotification, successNotification } from '../../utils/notification';
import {
  AUTH,
  GET_AUTH_FOLLOWERS,
  GET_AUTH_FOLLOWING,
  GET_FOLLOWING_BLOGS,
  GET_USER,
  GET_USER_FOLLOWERS,
  GET_USER_FOLLOWING,
  GET_USER_SUGGESTIONS,
} from '../../constants/queryKeys';
import type { IUserData } from '../../interface/user';

interface Props {
  user: IUserData;
  shouldFollow: boolean;
  bioAsDesc?: boolean;
}

const UserSkeleton: React.FC<Props> = ({
  user: { _id: id, bio, image, fullname, followersCount },
  shouldFollow,
  bioAsDesc,
}) => {
  const router: NextRouter = useRouter();

  const { authUser } = useAuth();

  const queryClient = useQueryClient();

  const handleFollowUser = useMutation(
    ({ id, shouldFollow }: { id: string; shouldFollow: boolean }) =>
      new AuthAxios().followUser({ id, shouldFollow }),
    {
      onSuccess: (res) => {
        successNotification(res.message);
        queryClient.refetchQueries([AUTH]);
        queryClient.refetchQueries([GET_USER]);
        queryClient.refetchQueries([GET_USER_SUGGESTIONS]);
        queryClient.refetchQueries([GET_AUTH_FOLLOWERS]);
        queryClient.refetchQueries([GET_AUTH_FOLLOWING]);
        queryClient.refetchQueries([GET_USER_FOLLOWERS]);
        queryClient.refetchQueries([GET_USER_FOLLOWING]);
        queryClient.refetchQueries([GET_FOLLOWING_BLOGS]);
      },
      onError: (err: Error) => errorNotification(err),
    }
  );

  return (
    <div className='w-full flex items-center justify-between mb-5'>
      <span className='flex items-center gap-4'>
        {image ? (
          <Avatar
            src={<Image alt='' className='object-cover' src={image} layout='fill' />}
            size='large'
          />
        ) : (
          <Avatar className='bg-[#1890ff] flex items-center text-lg' size='large'>
            {fullname[0]}
          </Avatar>
        )}

        <Space className='w-48' direction='vertical' size={0}>
          <p
            className='text-sm text-white multiline-truncate-title break-words cursor-pointer'
            onClick={() => router.push(`/profile/${id}`)}
          >
            {fullname}
          </p>

          {bioAsDesc && bio ? (
            <p className='multiline-truncate-title text-xs text-zinc-500 break-words'>{bio}</p>
          ) : (
            <p className='text-sm text-zinc-500 break-words'>{followersCount} followers</p>
          )}
        </Space>
      </span>

      <Button
        type='primary'
        className='rounded-lg text-xs'
        hidden={authUser?._id === id}
        size='small'
        danger={!shouldFollow}
        loading={handleFollowUser.isLoading}
        onClick={() => handleFollowUser.mutate({ id, shouldFollow })}
      >
        {shouldFollow ? 'Follow' : 'Unfollow'}
      </Button>
    </div>
  );
};

export default UserSkeleton;
