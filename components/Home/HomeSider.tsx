import { NextRouter, useRouter } from 'next/router';
import { useDispatch } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import { Button, Divider, Skeleton } from 'antd';
import UserAxios from '../../api/UserAxios';
import BlogAxios from '../../api/BlogAxios';
import { openModal } from '../../store/modalSlice';
import { GET_BLOG_SUGGESTIONS, GET_GENRE, GET_USER_SUGGESTIONS } from '../../constants/queryKeys';
import { useAuth } from '../../utils/UserAuth';
import UserSkeleton from '../shared/UserSkeleton';
import BlogList from '../Blogs/BlogList';
import { MODAL_KEYS } from '../../constants/reduxKeys';

const { USER_SUGGESTIONS_MODAL, LOGIN_MODAL } = MODAL_KEYS;

const HomeSider: React.FC = () => {
  const router: NextRouter = useRouter();

  const dispatch = useDispatch();

  const { authUser } = useAuth();

  const userAxios = UserAxios();

  const blogAxios = BlogAxios();

  const { data: userSuggestions, isLoading: isUserSuggestionsLoading } = useQuery({
    queryFn: () => userAxios.getUserSuggestions({ pageSize: 3 }),
    queryKey: [GET_USER_SUGGESTIONS, { pageSize: 3 }],
  });

  const { data: blogSuggestions, isLoading: isBlogSuggestionsLoading } = useQuery({
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
          onClick={() =>
            authUser ? router.push('/blog/create') : dispatch(openModal({ key: LOGIN_MODAL }))
          }
        >
          {authUser ? 'Write a Blog' : 'Login / Register'}
        </Button>

        <Divider />

        <header className='text-xl pb-4'>Suggestions</header>

        {isUserSuggestionsLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className='py-1' avatar round paragraph={{ rows: 0 }} active />
            ))
          : userSuggestions &&
            userSuggestions.data.map((user) => (
              <UserSkeleton
                key={user._id}
                user={user}
                shouldFollow={!authUser?.following.includes(user._id as never)}
                bioAsDesc
              />
            ))}

        <p
          className='text-[#1890ff] cursor-pointer hover:text-blue-600 transition-all duration-300'
          onClick={() => dispatch(openModal({ key: USER_SUGGESTIONS_MODAL }))}
        >
          View More Suggestions
        </p>

        <Divider />

        <header className='text-xl pb-4'>More Blogs</header>

        {isBlogSuggestionsLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className='py-5' avatar round paragraph={{ rows: 2 }} active />
            ))
          : blogSuggestions &&
            blogSuggestions.data.map((blog) => (
              <BlogList key={blog._id} blog={blog} smallContainer />
            ))}

        <header className='text-xl pb-4'>Pick a genre</header>

        <div className='flex flex-wrap gap-2'>
          {genre &&
            genre.map((genre) => (
              <span
                key={genre}
                className='flex flex-col py-1 px-0.5 cursor-pointer hover:bg-zinc-900 transition-all'
                onClick={() => router.push(`/blog/${genre.toLowerCase()}`)}
              >
                <p>&#35;{genre}</p>
              </span>
            ))}
        </div>

        <div className='flex gap-2 my-4'>
          <a href='https://rohanshrestha09.com.np' target='_blank' rel='noreferrer'>
            About Developer
          </a>

          <span>&#8226;</span>

          <a
            href='https://github.com/rohanshrestha09/Blog-Express'
            target='_blank'
            rel='noreferrer'
          >
            Github
          </a>

          <span>&#8226;</span>

          <a
            href='https://www.linkedin.com/in/rohan-shrestha-9b5580232/'
            target='_blank'
            rel='noreferrer'
          >
            Linkedin
          </a>
        </div>
      </main>
    </div>
  );
};

export default HomeSider;
