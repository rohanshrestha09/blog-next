import { useRouter } from 'next/router';
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
import { getUser, getUserFollowers, getUserFollowing } from 'request/user';
import { useFilterStore } from 'store/hooks';
import { useModalStore } from 'store/hooks';
import { queryKeys } from 'utils';
import { MODALS, FILTERS } from 'constants/reduxKeys';
import { FOLLOWER, FOLLOWING, USER } from 'constants/queryKeys';
import { User } from 'interface/models';

interface Props {
  isSider?: boolean;
}

const UserProfileSider: React.FC<Props> = ({ isSider }) => {
  const { query } = useRouter();

  const {
    isOpen: isUserFollowerModalOpen,
    openModal: openUserFollowerModal,
    closeModal: closeUserFollowerModal,
  } = useModalStore(MODALS.USER_FOLLOWER_MODAL);

  const {
    size: userFollowingSize,
    search: userFollowingSearch,
    setSize: setUserFollowingSize,
    setSearch: setUserFollowingSearch,
  } = useFilterStore(FILTERS.USER_FOLLOWING_FILTER);

  const {
    size: userFollowerSize,
    search: userFollowerSearch,
    setSize: setUserFollowerSize,
    setSearch: setUserFollowerSearch,
  } = useFilterStore(FILTERS.USER_FOLLOWER_FILTER);

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
        size: userFollowerSize,
        search: userFollowerSearch,
      }),
    queryKey: queryKeys(USER, FOLLOWER).list({
      id: String(query?.userId),
      size: userFollowerSize,
      search: userFollowerSearch,
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
        size: userFollowingSize,
        search: userFollowingSearch,
      }),
    queryKey: queryKeys(USER, FOLLOWING).list({
      id: String(query?.userId),
      size: userFollowingSize,
      search: userFollowingSearch,
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
              placeholder='Search user...'
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

          {!isFollowersFetchedAfterMount || !isFollowingFetchedAfterMount ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className='py-0.5' avatar round paragraph={{ rows: 0 }} active />
            ))
          ) : (
            <InfiniteScroll
              dataLength={users?.data.length ?? 0}
              next={() => config.setSize(10)}
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
      key: FILTERS.USER_FOLLOWER_FILTER,
      label: 'Followers',
      config: {
        search: userFollowerSearch,
        setSize: setUserFollowerSize,
        setSearch: setUserFollowerSearch,
      },
      users: followers && {
        data: followers?.result,
        count: followers?.count,
      },
      icon: RiUserFollowLine,
    },
    {
      key: FILTERS.USER_FOLLOWING_FILTER,
      label: 'Following',
      config: {
        search: userFollowingSearch,
        setSize: setUserFollowingSize,
        setSearch: setUserFollowingSearch,
      },
      users: following && {
        data: following?.result,
        count: following?.count,
      },
      icon: RiUserAddLine,
    },
  ].map(
    ({ key, label, config, users, icon }) => user && getTabItems(label, key, icon, config, users),
  );

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
                    onClick={openUserFollowerModal}
                  >
                    Check Followers
                  </p>
                </span>

                <Modal
                  open={isUserFollowerModalOpen}
                  onCancel={closeUserFollowerModal}
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
      )}
    </div>
  );
};

export default UserProfileSider;
