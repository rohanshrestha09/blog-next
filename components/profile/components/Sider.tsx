import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import moment from 'moment';
import { Empty, Tabs, Divider, Input, Modal, Spin, Skeleton, List, ConfigProvider } from 'antd';
import InfiniteScroll from 'react-infinite-scroll-component';
import { isEmpty } from 'lodash';
import { LoadingOutlined } from '@ant-design/icons';
import { IconType } from 'react-icons';
import { BiLink, BiSearch } from 'react-icons/bi';
import { BsFillCalendarDateFill, BsFillInfoCircleFill } from 'react-icons/bs';
import { RiUserAddLine, RiUserFollowFill, RiUserFollowLine } from 'react-icons/ri';
import { useAuth } from 'auth';
import UserSkeleton from 'components/common/UserSkeleton';
import { getFollowers, getFollowing } from 'api/auth';
import { changeKey } from 'store/followersSlice';
import { setSize, setSearch } from 'store/sortFilterSlice';
import { openModal, closeModal } from 'store/modalSlice';
import { queryKeys } from 'utils';
import { AUTH, FOLLOWER, FOLLOWING } from 'constants/queryKeys';
import { MODAL_KEYS, FOLLOWERS_KEYS } from 'constants/reduxKeys';
import { User } from 'interface/models';

interface Props {
  isSider?: boolean;
}

const { AUTH_FOLLOWERS, AUTH_FOLLOWING } = FOLLOWERS_KEYS;

const { AUTH_FOLLOWERS_MODAL, USER_SUGGESTIONS_MODAL } = MODAL_KEYS;

const ProfileSider: React.FC<Props> = ({ isSider }) => {
  const { authKey } = useSelector((state: RootState) => state.followers, shallowEqual);

  const { size, search } = useSelector((state: RootState) => state.sortFilter, shallowEqual);

  const { isOpen } = useSelector((state: RootState) => state.modal);

  const dispatch = useDispatch();

  const { authUser } = useAuth();

  const {
    data: followers,
    isPreviousData: isFollowersPreviousData,
    isFetchedAfterMount: isFollowersFetchedAfterMount,
  } = useQuery({
    queryFn: () =>
      getFollowers({
        size: size[AUTH_FOLLOWERS],
        search: search[AUTH_FOLLOWERS],
      }),
    queryKey: queryKeys(AUTH, FOLLOWER).list({
      size: size[AUTH_FOLLOWERS],
      search: search[AUTH_FOLLOWERS],
    }),
    keepPreviousData: true,
  });

  const {
    data: following,
    isPreviousData: isFollowingPreviousData,
    isFetchedAfterMount: isFollowingFetchedAfterMount,
  } = useQuery({
    queryFn: () =>
      getFollowing({
        size: size[AUTH_FOLLOWING],
        search: search[AUTH_FOLLOWING],
      }),
    queryKey: queryKeys(AUTH, FOLLOWING).list({
      size: size[AUTH_FOLLOWING],
      search: search[AUTH_FOLLOWING],
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
              placeholder='Search users...'
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
              dataLength={users?.data?.length ?? 0}
              next={() => dispatch(setSize({ key, size: 10 }))}
              hasMore={users?.data ? users?.data?.length < users?.count : false}
              loader={<Skeleton avatar round paragraph={{ rows: 1 }} active />}
              endMessage={
                !isEmpty(users?.data) && (
                  <p
                    className='text-[#1890ff] cursor-pointer hover:text-blue-600 transition-all duration-300'
                    onClick={() => dispatch(openModal({ key: USER_SUGGESTIONS_MODAL }))}
                  >
                    View More Suggestions
                  </p>
                )
              }
            >
              <ConfigProvider
                renderEmpty={() => (
                  <Empty>
                    <p
                      className='text-[#1890ff] cursor-pointer hover:text-blue-600 transition-all duration-300'
                      onClick={() => dispatch(openModal({ key: USER_SUGGESTIONS_MODAL }))}
                    >
                      View Suggestions
                    </p>
                  </Empty>
                )}
              >
                <List
                  itemLayout='vertical'
                  dataSource={users?.data}
                  renderItem={(user) => (
                    <UserSkeleton key={user?.id} user={user} descriptionMode='followersCount' />
                  )}
                />
              </ConfigProvider>
            </InfiniteScroll>
          )}
        </div>
      ),
    };
  };

  const items = [
    {
      key: AUTH_FOLLOWERS,
      label: 'Followers',
      users: followers && {
        data: followers?.result,
        count: followers?.count,
      },
      icon: RiUserFollowLine,
    },
    {
      key: AUTH_FOLLOWING,
      label: 'Following',
      users: following && {
        data: following?.result,
        count: following?.count,
      },
      icon: RiUserAddLine,
    },
  ].map(({ key, label, users, icon }) => authUser && getTabItems(label, key, icon, users));

  return (
    <div className={`w-full sm:order-last ${!isSider && 'lg:hidden'}`}>
      <main className='w-full flex flex-col'>
        {isSider && <header className='text-xl break-words pb-4'>About {authUser?.name}</header>}

        <div
          className='w-full flex flex-col gap-3 [&>*]:flex [&>*]:items-center [&>*]:gap-2'
          style={{ overflowWrap: 'anywhere' }}
        >
          {authUser?.bio && (
            <span className='flex-wrap'>
              <BsFillInfoCircleFill />
              <p>{authUser.bio}</p>
            </span>
          )}

          {authUser?.website && (
            <span>
              <BiLink />
              <a
                className='underline'
                href={
                  !authUser.website.startsWith('https://')
                    ? `https://${authUser.website}`
                    : authUser.website
                }
                target='_blank'
                rel='noreferrer'
              >
                {authUser.website}
              </a>
            </span>
          )}

          <span>
            <BsFillCalendarDateFill />
            <p>{`Joined ${moment(authUser?.createdAt).format('ll')}`}</p>
          </span>

          {!isSider && (
            <>
              <span>
                <RiUserFollowFill />
                <p
                  className='text-[#1890ff] cursor-pointer hover:text-blue-600'
                  onClick={() => dispatch(openModal({ key: AUTH_FOLLOWERS_MODAL }))}
                >
                  Check Followers
                </p>
              </span>

              <Modal
                open={isOpen[AUTH_FOLLOWERS_MODAL]}
                onCancel={() => dispatch(closeModal({ key: AUTH_FOLLOWERS_MODAL }))}
                footer={null}
              >
                <Tabs
                  defaultActiveKey={authKey}
                  className='w-full'
                  items={items as []}
                  onTabClick={(key) =>
                    dispatch(
                      changeKey({ key, type: 'authKey' } as {
                        key: FOLLOWERS_KEYS;
                        type: 'authKey';
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
              defaultActiveKey={authKey}
              className='w-full'
              items={items as []}
              onTabClick={(key) =>
                dispatch(
                  changeKey({ key, type: 'authKey' } as { key: FOLLOWERS_KEYS; type: 'authKey' }),
                )
              }
            />
          </>
        )}
      </main>
    </div>
  );
};

export default ProfileSider;
