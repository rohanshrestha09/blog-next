import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import moment from 'moment';
import { isEmpty } from 'lodash';
import { Empty, Tabs, Divider, Input, Modal, Spin, Skeleton, List } from 'antd';
import InfiniteScroll from 'react-infinite-scroll-component';
import { LoadingOutlined } from '@ant-design/icons';
import { IconType } from 'react-icons';
import { BiLink, BiSearch } from 'react-icons/bi';
import { BsFillCalendarDateFill, BsFillInfoCircleFill } from 'react-icons/bs';
import { RiUserAddLine, RiUserFollowFill, RiUserFollowLine } from 'react-icons/ri';
import { useAuth } from '../../utils/UserAuth';
import AuthAxios from '../../api/AuthAxios';
import UserSkeleton from '../shared/UserSkeleton';
import { changeKey } from '../../store/followersSlice';
import { setPageSize, setSearch } from '../../store/sortFilterSlice';
import { openModal, closeModal } from '../../store/modalSlice';
import { GET_AUTH_FOLLOWERS, GET_AUTH_FOLLOWING } from '../../constants/queryKeys';
import { MODAL_KEYS, FOLLOWERS_KEYS } from '../../constants/reduxKeys';
import type { IUsers } from '../../interface/user';

interface Props {
  isSider?: boolean;
}

const { AUTH_FOLLOWERS, AUTH_FOLLOWING } = FOLLOWERS_KEYS;

const { AUTH_FOLLOWERS_MODAL, USER_SUGGESTIONS_MODAL } = MODAL_KEYS;

const Profile: React.FC<Props> = ({ isSider }) => {
  const { authKey } = useSelector((state: RootState) => state.followers, shallowEqual);

  const { pageSize, search } = useSelector((state: RootState) => state.sortFilter, shallowEqual);

  const { isOpen } = useSelector((state: RootState) => state.modal);

  const dispatch = useDispatch();

  const { authUser } = useAuth();

  const authAxios = AuthAxios();

  const { data: followers, isPreviousData: isFollowersLoading } = useQuery({
    queryFn: () =>
      authAxios.getFollowers({
        pageSize: pageSize[AUTH_FOLLOWERS],
        search: search[AUTH_FOLLOWERS],
      }),
    queryKey: [
      GET_AUTH_FOLLOWERS,
      { pageSize: pageSize[AUTH_FOLLOWERS], search: search[AUTH_FOLLOWERS] },
    ],
    keepPreviousData: true,
  });

  const { data: following, isPreviousData: isFollowingLoading } = useQuery({
    queryFn: () =>
      authAxios.getFollowing({
        pageSize: pageSize[AUTH_FOLLOWING],
        search: search[AUTH_FOLLOWING],
      }),
    queryKey: [
      GET_AUTH_FOLLOWING,
      { pageSize: pageSize[AUTH_FOLLOWING], search: search[AUTH_FOLLOWING] },
    ],
    keepPreviousData: true,
  });

  let timeout: any = 0;

  const getTabItems = (label: string, key: FOLLOWERS_KEYS, Icon: IconType, users?: IUsers) => {
    return {
      key,
      label: (
        <span className='sm:mx-2 mx-auto flex items-center gap-1.5'>
          <Icon className='inline' />{' '}
          {`${authUser[key === AUTH_FOLLOWERS ? 'followersCount' : 'followingCount']} ${label}`}
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

            {(key === AUTH_FOLLOWERS ? isFollowersLoading : isFollowingLoading) && (
              <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
            )}
          </span>

          <Divider />

          {isEmpty(users?.data) ? (
            <Empty>
              <p
                className='text-[#1890ff] cursor-pointer hover:text-blue-600 transition-all duration-300'
                onClick={() => dispatch(openModal({ key: USER_SUGGESTIONS_MODAL }))}
              >
                View Suggestions
              </p>
            </Empty>
          ) : (
            <InfiniteScroll
              dataLength={users?.data.length ?? 0}
              next={() => dispatch(setPageSize({ key, pageSize: 10 }))}
              hasMore={users?.data ? users?.data.length < users?.count : false}
              loader={<Skeleton avatar round paragraph={{ rows: 1 }} active />}
              endMessage={
                <p
                  className='text-[#1890ff] cursor-pointer hover:text-blue-600 transition-all duration-300'
                  onClick={() => dispatch(openModal({ key: USER_SUGGESTIONS_MODAL }))}
                >
                  View More Suggestions
                </p>
              }
            >
              <List
                itemLayout='vertical'
                dataSource={users?.data}
                renderItem={(user) => (
                  <UserSkeleton
                    key={user._id}
                    user={user}
                    shouldFollow={!authUser.following.includes(user._id as never)}
                  />
                )}
              />
            </InfiniteScroll>
          )}
        </div>
      ),
    };
  };

  const items = [
    { key: AUTH_FOLLOWERS, label: 'Followers', users: followers, icon: RiUserFollowLine },
    { key: AUTH_FOLLOWING, label: 'Following', users: following, icon: RiUserAddLine },
  ].map(({ key, label, users, icon }) => authUser && getTabItems(label, key, icon, users));

  return (
    <div className={`w-full sm:order-last ${!isSider && 'lg:hidden'}`}>
      {authUser && (
        <main className='w-full flex flex-col'>
          {isSider && (
            <header className='text-xl break-words pb-4'>About {authUser.fullname}</header>
          )}

          <div
            className='w-full flex flex-col gap-3 [&>*]:flex [&>*]:items-center [&>*]:gap-2'
            style={{ overflowWrap: 'anywhere' }}
          >
            {authUser.bio && (
              <span className='flex-wrap'>
                <BsFillInfoCircleFill />
                <p>{authUser.bio}</p>
              </span>
            )}

            {authUser.website && (
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
              <p>{`Joined ${moment(authUser.createdAt).format('ll')}`}</p>
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
                    items={items}
                    onTabClick={(key) =>
                      dispatch(
                        changeKey({ key, type: 'authKey' } as {
                          key: FOLLOWERS_KEYS;
                          type: 'authKey';
                        })
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
                items={items}
                onTabClick={(key) =>
                  dispatch(
                    changeKey({ key, type: 'authKey' } as { key: FOLLOWERS_KEYS; type: 'authKey' })
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

export default Profile;
