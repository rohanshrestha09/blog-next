import { useRouter } from 'next/router';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import moment from 'moment';
import { Tabs, Divider, Input, Modal, Spin, Skeleton, List } from 'antd';
import InfiniteScroll from 'react-infinite-scroll-component';
import { LoadingOutlined } from '@ant-design/icons';
import { IconType } from 'react-icons';
import { BiLink, BiSearch } from 'react-icons/bi';
import { BsFillCalendarDateFill, BsFillInfoCircleFill } from 'react-icons/bs';
import { RiUserAddLine, RiUserFollowFill, RiUserFollowLine } from 'react-icons/ri';
import UserSkeleton from 'components/common/UserSkeleton';
import { getUser, getUserFollowers, getUserFollowing } from 'api/user';
import { changeKey } from 'store/followersSlice';
import { setSize, setSearch } from 'store/sortFilterSlice';
import { openModal, closeModal } from 'store/modalSlice';
import { queryKeys } from 'utils';
import { MODAL_KEYS, FOLLOWERS_KEYS } from 'constants/reduxKeys';
import { USER } from 'constants/queryKeys';
import { User } from 'interface/models';

interface Props {
  isSider?: boolean;
}

const { USER_FOLLOWERS, USER_FOLLOWING } = FOLLOWERS_KEYS;

const { USER_FOLLOWERS_MODAL } = MODAL_KEYS;

const UserProfileSider: React.FC<Props> = ({ isSider }) => {
  const { query } = useRouter();

  const { userKey } = useSelector((state: RootState) => state.followers, shallowEqual);

  const { size, search } = useSelector((state: RootState) => state.sortFilter, shallowEqual);

  const { isOpen } = useSelector((state: RootState) => state.modal);

  const dispatch = useDispatch();

  const { data: user } = useQuery({
    queryFn: () => getUser(String(query?.userId)),
    queryKey: queryKeys(USER).detail(String(query?.userId)),
  });

  const {
    data: followers,
    isPreviousData: isFollowersPreviousData,
    isFetchedAfterMount: isFollowersFetchedAfterMount,
  } = useQuery({
    queryFn: () =>
      getUserFollowers({
        id: String(query?.userId),
        size: size[USER_FOLLOWERS],
        search: search[USER_FOLLOWERS],
      }),
    queryKey: queryKeys(USER).list({
      id: String(query?.userId),
      size: size[USER_FOLLOWERS],
      search: search[USER_FOLLOWERS],
    }),
    keepPreviousData: true,
  });

  const {
    data: following,
    isPreviousData: isFollowingPreviousData,
    isFetchedAfterMount: isFollowingFetchedAfterMount,
  } = useQuery({
    queryFn: () =>
      getUserFollowing({
        id: String(query?.userId),
        size: size[USER_FOLLOWING],
        search: search[USER_FOLLOWING],
      }),
    queryKey: queryKeys(USER).list({
      id: String(query?.userId),
      size: size[USER_FOLLOWING],
      search: search[USER_FOLLOWING],
    }),
    keepPreviousData: true,
  });

  let timeout: any = 0;

  const getTabItems = (
    label: string,
    key: FOLLOWERS_KEYS,
    Icon: IconType,
    users?: { data: User[]; count: number },
  ) => {
    return {
      key,
      label: (
        <span className='sm:mx-2 mx-auto flex items-center gap-1.5'>
          <Icon className='inline' /> {`${users?.count} ${label}`}
        </span>
      ),
      children: (
        <div className='w-full pt-3'>
          <span className='w-full flex gap-3 items-center'>
            <Input
              className='rounded-lg py-[5px] bg-black'
              defaultValue={search[key]}
              placeholder='Search user...'
              prefix={<BiSearch />}
              onChange={({ target: { value } }) => {
                if (timeout) clearTimeout(timeout);
                timeout = setTimeout(() => dispatch(setSearch({ key, search: value })), 700);
              }}
              allowClear
            />

            {(isFollowersPreviousData || isFollowingPreviousData) && (
              <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
            )}
          </span>

          <Divider />

          {!isFollowersFetchedAfterMount || !isFollowingFetchedAfterMount ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className='py-0.5' avatar round paragraph={{ rows: 0 }} active />
            ))
          ) : (
            <InfiniteScroll
              dataLength={users?.data.length ?? 0}
              next={() => dispatch(setSize({ key, size: 10 }))}
              hasMore={users?.data ? users?.data.length < users?.count : false}
              loader={<Skeleton avatar round paragraph={{ rows: 1 }} active />}
            >
              <List
                itemLayout='vertical'
                dataSource={users?.data}
                renderItem={(user) => (
                  <UserSkeleton key={user?.id} user={user} descriptionMode='followersCount' />
                )}
              />
            </InfiniteScroll>
          )}
        </div>
      ),
    };
  };

  const items = [
    {
      key: USER_FOLLOWERS,
      label: 'Followers',
      users: followers && {
        data: followers?.result,
        count: followers?.count,
      },
      icon: RiUserFollowLine,
    },
    {
      key: USER_FOLLOWING,
      label: 'Following',
      users: following && {
        data: following?.result,
        count: following?.count,
      },
      icon: RiUserAddLine,
    },
  ].map(({ key, label, users, icon }) => user && getTabItems(label, key, icon, users));

  return (
    <div className={`w-full sm:order-last ${!isSider && 'lg:hidden'}`}>
      {user && (
        <main className='w-full flex flex-col'>
          {isSider && <header className='text-xl break-words pb-4'>About {user?.name}</header>}

          <div
            className='w-full flex flex-col gap-3 [&>*]:flex [&>*]:items-center [&>*]:gap-2'
            style={{ overflowWrap: 'anywhere' }}
          >
            {user.bio && (
              <span className='flex-wrap'>
                <BsFillInfoCircleFill />
                <p>{user.bio}</p>
              </span>
            )}

            {user.website && (
              <span>
                <BiLink />
                <a
                  className='underline'
                  href={
                    !user.website.startsWith('https://') ? `https://${user.website}` : user.website
                  }
                  target='_blank'
                  rel='noreferrer'
                >
                  {user.website}
                </a>
              </span>
            )}

            <span>
              <BsFillCalendarDateFill />
              <p>{`Joined ${moment(user.createdAt).format('ll')}`}</p>
            </span>

            {!isSider && (
              <>
                <span>
                  <RiUserFollowFill />
                  <p
                    className='text-[#1890ff] cursor-pointer hover:text-blue-600'
                    onClick={() => dispatch(openModal({ key: USER_FOLLOWERS_MODAL }))}
                  >
                    Check Followers
                  </p>
                </span>

                <Modal
                  open={isOpen[USER_FOLLOWERS_MODAL]}
                  onCancel={() => dispatch(closeModal({ key: USER_FOLLOWERS_MODAL }))}
                  footer={null}
                >
                  <Tabs
                    defaultActiveKey={userKey}
                    className='w-full'
                    items={items as []}
                    onTabClick={(key) =>
                      dispatch(
                        changeKey({ key, type: 'userKey' } as {
                          key: FOLLOWERS_KEYS;
                          type: 'userKey';
                        }),
                      )
                    }
                  />
                </Modal>
              </>
            )}
          </div>

          {isSider && (
            <>
              <Divider className='mb-3' />

              <Tabs
                defaultActiveKey={userKey}
                className='w-full'
                items={items as []}
                onTabClick={(key) =>
                  dispatch(
                    changeKey({ key, type: 'userKey' } as { key: FOLLOWERS_KEYS; type: 'userKey' }),
                  )
                }
              />
            </>
          )}
        </main>
      )}
    </div>
  );
};

export default UserProfileSider;
