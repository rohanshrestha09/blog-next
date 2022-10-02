import { Image, Space } from 'antd';
import moment from 'moment';
import { BiLink, BiUserPlus } from 'react-icons/bi';
import {
  BsFacebook,
  BsTwitter,
  BsInstagram,
  BsLinkedin,
  BsFillCalendarDateFill,
  BsLink,
  BsFillInfoCircleFill,
} from 'react-icons/bs';
import { FaUserCheck, FaUserPlus } from 'react-icons/fa';
import { useAuth } from '../../utils/UserAuth';

const Profile: React.FC = () => {
  const { authUser } = useAuth();
  return (
    <div className='w-full'>
      {authUser && (
        <main className='w-full flex flex-col'>
          <header className='text-2xl uppercase break-words pb-4'>More from Rohan Shrestha</header>

          <div className='flex flex-col gap-3 break-words [&>*]:flex [&>*]:items-center [&>*]:gap-2'>
            {authUser.bio && (
              <span>
                <BsFillInfoCircleFill /> <p> {authUser.bio}</p>
              </span>
            )}

            <Space size={20}>
              <span className='flex items-center gap-2'>
                <FaUserPlus />
                <p>{authUser.followingCount} following</p>
              </span>

              <span className='flex items-center gap-2'>
                <FaUserCheck />
                <p>{authUser.followerCount} followers</p>
              </span>
            </Space>

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

            <Space wrap size={15}>
              <BsFacebook />
              <BsTwitter />
              <BsInstagram />
              <BsLinkedin />
            </Space>
          </div>
        </main>
      )}
    </div>
  );
};

export default Profile;
