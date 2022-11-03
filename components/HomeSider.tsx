import { NextRouter, useRouter } from 'next/router';
import { useDispatch } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import { Button, Divider } from 'antd';
import UserAxios from '../apiAxios/userAxios';
import BlogAxios from '../apiAxios/blogAxios';
import { openModal } from '../store/modalSlice';
import { GET_BLOG_SUGGESTIONS, GET_GENRE, GET_USER_SUGGESTIONS } from '../constants/queryKeys';
import { useAuth } from '../utils/UserAuth';
import UserSkeleton from './shared/UserSkeleton';
import BlogList from './Blogs/BlogList';
import UserSuggestions from './shared/UserSuggestions';
import { MODAL_KEYS } from '../constants/reduxKeys';

const { USER_SUGGESTIONS_MODAL } = MODAL_KEYS;

const HomeSider: React.FC = () => {
  const router: NextRouter = useRouter();

  const dispatch = useDispatch();

  const { authUser } = useAuth();

  const userAxios = new UserAxios();

  const blogAxios = new BlogAxios();

  const { data: userSuggestions } = useQuery({
    queryFn: () => userAxios.getUserSuggestions({ pageSize: 3 }),
    queryKey: [GET_USER_SUGGESTIONS, { pageSize: 3 }],
  });

  const { data: blogSuggestions } = useQuery({
    queryFn: () => blogAxios.getBlogSuggestions({ pageSize: 4 }),
    queryKey: [GET_BLOG_SUGGESTIONS, { pageSize: 4 }],
  });

  const { data: genre } = useQuery({
    queryFn: () => blogAxios.getGenre(),
    queryKey: [GET_GENRE],
  });

  return (
    <div className='w-full'>
      <main className='w-full flex flex-col'>
        <Button
          className='w-full font-semibold font-shalimar uppercase btn-secondary text-xl'
          shape='round'
          size='large'
          onClick={() => router.push('/blog/create')}
        >
          Write a Blog
        </Button>

        <Divider />

        <header className='text-xl pb-4'>Suggestions</header>

        {userSuggestions &&
          userSuggestions.data.map((user) => (
            <UserSkeleton
              key={user._id}
              user={user}
              shouldFollow={!authUser?.following.includes(user._id as never)}
              bioAsDesc
            />
          ))}

        <p
          className='text-[#1890ff] cursor-pointer hover:text-blue-600'
          onClick={() => dispatch(openModal({ key: USER_SUGGESTIONS_MODAL }))}
        >
          View More Suggestions
        </p>

        <Divider />

        <header className='text-xl pb-4'>More Blogs</header>

        {blogSuggestions &&
          blogSuggestions.data.map((blog) => (
            <BlogList key={blog._id} blog={blog} smallContainer />
          ))}

        <header className='text-xl pb-4'>Pick a genre</header>

        <div className='flex flex-col'>
          {genre &&
            genre.map((genre) => (
              <span
                key={genre}
                className='flex flex-col py-2 cursor-pointer hover:bg-zinc-900 transition-all'
              >
                <p>{genre}</p>

                <p className='text-zinc-500'>2 blogs</p>
              </span>
            ))}
        </div>

        <UserSuggestions />
      </main>
    </div>
  );
};

export default HomeSider;
