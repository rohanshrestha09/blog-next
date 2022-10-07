import Image from 'next/image';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Avatar, Button, Space } from 'antd';
import AuthAxios from '../../apiAxios/authAxios';
import { errorNotification, successNotification } from '../../utils/notification';
import { AUTH, GET_FOLLOWERS, GET_FOLLOWING } from '../../constants/queryKeys';
import type { IUserData } from '../../interface/user';
import type IMessage from '../../interface/message';

interface Props {
  user: IUserData;
  shouldFollow: boolean;
}

const UserSkeleton: React.FC<Props> = ({
  user: { _id: id, image, fullname, followersCount },
  shouldFollow,
}) => {
  const queryClient = useQueryClient();

  const handleFollowUser = useMutation(
    ({ id, shouldFollow }: { id: string; shouldFollow: boolean }) =>
      new AuthAxios().followUser({ id, shouldFollow }),
    {
      onSuccess: (res: IMessage) => {
        successNotification(res.message);
        queryClient.refetchQueries([AUTH]);
        queryClient.refetchQueries([GET_FOLLOWERS]);
        queryClient.refetchQueries([GET_FOLLOWING]);
      },
      onError: (err: Error | any) => errorNotification(err),
    }
  );

  return (
    <div className='w-full flex items-center justify-between pb-2'>
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

        <Space direction='vertical' size={0}>
          <p className='text-sm' style={{ overflowWrap: 'anywhere' }}>
            {fullname}
          </p>
          <p className='text-sm text-stone-600' style={{ overflowWrap: 'anywhere' }}>
            {followersCount} followers
          </p>
        </Space>
      </span>

      <Button
        type='primary'
        className='rounded-lg text-xs'
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
