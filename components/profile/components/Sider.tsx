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
import { getFollowers, getFollowing } from 'request/auth';
import { useModalStore, useFilterStore } from 'store/hooks';
import { queryKeys } from 'utils';
import { AUTH, FOLLOWER, FOLLOWING } from 'constants/queryKeys';
import { MODALS, FILTERS } from 'constants/reduxKeys';
import { User } from 'interface/models';

interface Props {
  isSider?: boolean;
}

const ProfileSider: React.FC<Props> = ({ isSider }) => {
  const {
    size: authFollowerSize,
    search: authFollowerSearch,
    setSize: setAuthFollowerSize,
    setSearch: setAuthFollowerSearch,
  } = useFilterStore(FILTERS.AUTH_FOLLOWER_FILTER);

  const {
    size: authFollowingSize,
    search: authFollowingSearch,
    setSize: setAuthFollowingSize,
    setSearch: setAuthFollowingSearch,
  } = useFilterStore(FILTERS.AUTH_FOLLOWING_FILTER);

  const {
    isOpen: isAuthFollowersModalOpen,
    openModal: openAuthFollowersModal,
    closeModal: closeAuthFollowersModal,
  } = useModalStore(MODALS.AUTH_FOLLOWER_MODAL);

  const { openModal: openUserSuggestionModal } = useModalStore(MODALS.USER_SUGGESTION_MODAL);

  const { authUser } = useAuth();

  const {
    data: followers,
    isPreviousData: isFollowersPreviousData,
    isLoading: isFollowersLoading,
  } = useQuery({
    queryFn: () =>
      getFollowers({
        size: authFollowerSize,
        search: authFollowerSearch,
      }),
    queryKey: queryKeys(AUTH, FOLLOWER).list({
      size: authFollowerSize,
      search: authFollowerSearch,
    }),
    keepPreviousData: true,
  });

  const {
    data: following,
    isPreviousData: isFollowingPreviousData,
    isLoading: isFollowingLoading,
  } = useQuery({
    queryFn: () =>
      getFollowing({
        size: authFollowingSize,
        search: authFollowingSearch,
      }),
    queryKey: queryKeys(AUTH, FOLLOWING).list({
      size: authFollowingSize,
      search: authFollowingSearch,
    }),
    keepPreviousData: true,
  });

  let timeout: any = 0;

  const getTabItems = (
    label: string,
    key: FILTERS,
    Icon: IconType,
    config: {
      search: string;
      setSize: (size: number) => void;
      setSearch: (search: string) => void;
    },
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
              defaultValue={config.search}
              placeholder='Search users...'
              prefix={<BiSearch />}
              onChange={({ target: { value } }) => {
                if (timeout) clearTimeout(timeout);
                timeout = setTimeout(() => config.setSearch(value), 700);
              }}
              allowClear
            />

            {(isFollowersPreviousData || isFollowingPreviousData) && (
              <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
            )}
          </span>

          <Divider />

          {isFollowersLoading || isFollowingLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className='py-0.5' avatar round paragraph={{ rows: 0 }} active />
            ))
          ) : (
            <InfiniteScroll
              dataLength={users?.data?.length ?? 0}
              next={() => config.setSize(10)}
              hasMore={users?.data ? users?.data?.length < users?.count : false}
              loader={<Skeleton avatar round paragraph={{ rows: 1 }} active />}
              endMessage={
                !isEmpty(users?.data) && (
                  <p
                    className='text-[#1890ff] cursor-pointer hover:text-blue-600 transition-all duration-300'
                    onClick={openUserSuggestionModal}
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
                      onClick={openUserSuggestionModal}
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
      key: FILTERS.AUTH_FOLLOWER_FILTER,
      label: 'Followers',
      config: {
        search: authFollowerSearch,
        setSize: setAuthFollowerSize,
        setSearch: setAuthFollowerSearch,
      },
      users: followers && {
        data: followers?.result,
        count: followers?.count,
      },
      icon: RiUserFollowLine,
    },
    {
      key: FILTERS.AUTH_FOLLOWING_FILTER,
      label: 'Following',
      config: {
        search: authFollowingSearch,
        setSize: setAuthFollowingSize,
        setSearch: setAuthFollowingSearch,
      },
      users: following && {
        data: following?.result,
        count: following?.count,
      },
      icon: RiUserAddLine,
    },
  ].map(
    ({ key, label, config, users, icon }) =>
      authUser && getTabItems(label, key, icon, config, users),
  );

  return (
    <div className={`w-full sm:order-last ${!isSider && 'lg:hidden'}`}>
      <main className='w-full flex flex-col'>
        {isSider && <header className='text-xl break-words pb-4'>About {authUser?.name}</header>}

        <div
          className='w-full flex flex-col gap-3 [&>*]:flex [&>*]:items-center [&>*]:gap-2'
          style={{ overflowWrap: 'anywhere' }}
        >
          {authUser?.bio && (
            <span>
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
                  onClick={openAuthFollowersModal}
                >
                  Check Followers
                </p>
              </span>

              <Modal
                open={isAuthFollowersModalOpen}
                onCancel={closeAuthFollowersModal}
                footer={null}
              >
                <Tabs className='w-full' items={items as []} />
              </Modal>
            </>
          )}
        </div>

        {isSider && (
          <>
            <Divider className='mb-3' />

            <Tabs className='w-full' items={items as []} />
          </>
        )}
      </main>
    </div>
  );
};

export default ProfileSider;
