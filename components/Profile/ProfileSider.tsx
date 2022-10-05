import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import moment from 'moment';
import { isEmpty, capitalize } from 'lodash';
import { Empty, Tabs, Divider, Input, Modal, Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { IconType } from 'react-icons';
import { BiLink, BiSearch } from 'react-icons/bi';
import { BsFillCalendarDateFill, BsFillInfoCircleFill } from 'react-icons/bs';
import { RiUserAddLine, RiUserFollowFill, RiUserFollowLine } from 'react-icons/ri';
import { useAuth } from '../../utils/UserAuth';
import AuthAxios from '../../apiAxios/authAxios';
import { changeKey, setPageSize, setSearch } from '../../store/followersSlice';
import { openModal, closeModal } from '../../store/modalSlice';
import { GET_FOLLOWERS, GET_FOLLOWING } from '../../constants/queryKeys';
import { MODAL_KEYS, PROFILE_SIDER_KEYS } from '../../constants/reduxKeys';
import type { IFollowers, IFollowing } from '../../interface/user';
import type { RootState } from '../../store';

interface Props {
  isSider?: boolean;
}

const { FOLLOWERS, FOLLOWING } = PROFILE_SIDER_KEYS;

const { FOLLOWERS_MODAL } = MODAL_KEYS;

const Profile: React.FC<Props> = ({ isSider }) => {
  const { key, pageSize, search } = useSelector(
    (state: RootState) => state.followers,
    shallowEqual
  );

  const { isOpen } = useSelector((state: RootState) => state.modal);

  const dispatch = useDispatch();

  const { authUser } = useAuth();

  const authAxios = new AuthAxios();

  const { data: followers, isLoading } = useQuery({
    queryFn: () =>
      authAxios.getFollowers({ pageSize: pageSize[FOLLOWERS], search: search[FOLLOWERS] }),
    queryKey: [GET_FOLLOWERS, { pageSize: pageSize[FOLLOWERS], search: search[FOLLOWERS] }],
  });

  const { data: following } = useQuery({
    queryFn: () =>
      authAxios.getFollowing({ pageSize: pageSize[FOLLOWING], search: search[FOLLOWING] }),
    queryKey: [GET_FOLLOWING, { pageSize: pageSize[FOLLOWING], search: search[FOLLOWING] }],
  });

  let timeout: any = 0;

  const getTabItems = (
    label: string,
    key: string,
    Icon: IconType,
    users?: IFollowers['followers'] | IFollowing['following']
  ) => {
    return {
      key,
      label: (
        <span className='sm:mx-2 mx-auto flex items-center gap-1.5'>
          <Icon className='inline' /> {`${authUser.followingCount} ${label}`}
        </span>
      ),
      children: (
        <div className='w-full pt-3'>
          <span className='w-full flex gap-3 items-center'>
            <Input
              className='rounded-lg py-[5px] bg-black'
              defaultValue={search[key as PROFILE_SIDER_KEYS]}
              placeholder='Search title...'
              prefix={<BiSearch />}
              onChange={({ target: { value } }) => {
                if (timeout) clearTimeout(timeout);
                timeout = setTimeout(() => dispatch(setSearch({ search: value })), 700);
              }}
            />

            {isLoading && <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />}
          </span>

          <Divider />

          {isEmpty(users) ? (
            <Empty>
              <p className='text-[#1890ff] cursor-pointer hover:text-blue-600'>View Suggestions</p>
            </Empty>
          ) : (
            <></>
          )}
        </div>
      ),
    };
  };

  const items = [
    { key: FOLLOWERS, users: followers, icon: RiUserFollowLine },
    { key: FOLLOWING, users: following, icon: RiUserAddLine },
  ].map(({ key, users, icon }) => authUser && getTabItems(capitalize(key), key, icon, users));

  return (
    <div className={`w-full sm:order-last ${!isSider && 'lg:hidden'}`}>
      {authUser && (
        <main className='w-full flex flex-col'>
          {isSider && (
            <header className='text-2xl break-words pb-4'>More from {authUser.fullname}</header>
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
                <a className='!underline' href={authUser.website} target='_blank' rel='noreferrer'>
                  https://rohanshrestha09.com.np
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
                    onClick={() => dispatch(openModal({ key: FOLLOWERS_MODAL }))}
                  >
                    Check Followers
                  </p>
                </span>

                <Modal
                  open={isOpen[FOLLOWERS_MODAL]}
                  onCancel={() => dispatch(closeModal({ key: FOLLOWERS_MODAL }))}
                  footer={null}
                >
                  <Tabs
                    defaultActiveKey={key}
                    className='w-full'
                    items={items}
                    onTabClick={(key) =>
                      dispatch(changeKey({ key } as { key: PROFILE_SIDER_KEYS }))
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
                defaultActiveKey={key}
                className='w-full'
                items={items}
                onTabClick={(key) => dispatch(changeKey({ key } as { key: PROFILE_SIDER_KEYS }))}
              />
            </>
          )}
        </main>
      )}
    </div>
  );
};

export default Profile;
