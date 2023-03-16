import Image from 'next/image';
import { NextRouter, useRouter } from 'next/router';
import { useDispatch } from 'react-redux';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Avatar, Button, Space } from 'antd';
import { useAuth } from '../../utils/UserAuth';
import AuthAxios from '../../api/AuthAxios';
import { errorNotification, successNotification } from '../../utils/notification';
import { closeModal } from '../../store/modalSlice';
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
import { MODAL_KEYS } from '../../constants/reduxKeys';
import type { IUserData } from '../../interface/user';

interface Props {
  user: IUserData;
  bioAsDesc?: boolean;
  isModal?: boolean;
}

const { USER_SUGGESTIONS_MODAL } = MODAL_KEYS;

const UserSkeleton: React.FC<Props> = ({
  user: { _id: id, bio, image, fullname, followerCount, followedByViewer },
  bioAsDesc,
  isModal,
}) => {
  const router: NextRouter = useRouter();

  const dispatch = useDispatch();

  const { authUser } = useAuth();

  const queryClient = useQueryClient();

  const handleFollowUser = useMutation(
    ({ id, shouldFollow }: { id: string; shouldFollow: boolean }) =>
      AuthAxios().followUser({ id, shouldFollow }),
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
      onError: (err: AxiosError) => errorNotification(err),
    }
  );

  return (
    <div className='w-full flex items-center justify-between mb-5'>
      <div className='flex items-center gap-4'>
        {image ? (
          <Avatar
            src={<Image alt='' className='object-cover' src={image} layout='fill' priority />}
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
            onClick={() => {
              router.push(`/profile/${id}`);
              isModal && dispatch(closeModal({ key: USER_SUGGESTIONS_MODAL }));
            }}
          >
            {fullname}
          </p>

          {bioAsDesc && bio ? (
            <p className='multiline-truncate-title text-xs text-zinc-500 break-words'>{bio}</p>
          ) : (
            <p className='text-sm text-zinc-500 break-words'>{followerCount} followers</p>
          )}
        </Space>
      </div>

      <Button
        type='primary'
        className='rounded-lg text-xs'
        hidden={authUser?._id === id}
        size='small'
        danger={followedByViewer}
        loading={handleFollowUser.isLoading}
        onClick={() => handleFollowUser.mutate({ id, shouldFollow: !followedByViewer })}
      >
        {!followedByViewer ? 'Follow' : 'Unfollow'}
      </Button>
    </div>
  );
};

export default UserSkeleton;
