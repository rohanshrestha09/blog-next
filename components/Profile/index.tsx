import { useQuery } from '@tanstack/react-query';
import moment from 'moment';
import { isEmpty, capitalize } from 'lodash';
import { Empty, Tabs, Divider, Input, Modal } from 'antd';
import { IconType } from 'react-icons';
import { BiLink, BiSearch } from 'react-icons/bi';
import { BsFillCalendarDateFill, BsFillInfoCircleFill } from 'react-icons/bs';
import { RiUserAddLine, RiUserFollowFill, RiUserFollowLine } from 'react-icons/ri';
import { useAuth } from '../../utils/UserAuth';
import AuthAxios from '../../apiAxios/authAxios';
import { GET_FOLLOWERS } from '../../constants/queryKeys';
import { PROFILE_SIDER_KEYS } from '../../constants/reduxKeys';

interface Props {
  isSider?: boolean;
}

const { FOLLOWERS, FOLLOWING } = PROFILE_SIDER_KEYS;

const Profile: React.FC<Props> = ({ isSider }) => {
  const { authUser } = useAuth();

  const authAxios = new AuthAxios();

  const { data: followers, isLoading } = useQuery({
    queryFn: () => authAxios.getFollowers({}),
    queryKey: [GET_FOLLOWERS, { pageSize: 20, search: '' }],
  });

  let timeout: any = 0;

  const getTabItems = (label: string, key: string, Icon: IconType) => {
    return {
      key,
      label: (
        <span className='sm:mx-2 mx-auto flex items-center gap-1.5'>
          <Icon className='inline' /> {`${authUser?.followingCount} ${label}`}
        </span>
      ),
      children: authUser && (
        <div className='w-full pt-3'>
          <Input
            className='rounded-lg py-[5px] bg-black'
            defaultValue={''}
            placeholder='Search title...'
            prefix={<BiSearch />}
            onChange={({ target: { value } }) => {
              if (timeout) clearTimeout(timeout);
            }}
          />

          <Divider />

          {isEmpty(followers) ? (
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
    { key: FOLLOWERS, icon: RiUserFollowLine },
    { key: FOLLOWING, icon: RiUserAddLine },
  ].map(({ key, icon }) => getTabItems(capitalize(key), key, icon));

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
                  <p className='text-[#1890ff] cursor-pointer hover:text-blue-600'>
                    Check Followers
                  </p>
                </span>

                <Modal open={false} footer={null}>
                  <Tabs className='w-full' items={items} />
                </Modal>
              </>
            )}
          </div>

          {isSider && (
            <>
              <Divider className='mb-3' />

              <Tabs className='w-full' items={items} />
            </>
          )}
        </main>
      )}
    </div>
  );
};

export default Profile;
