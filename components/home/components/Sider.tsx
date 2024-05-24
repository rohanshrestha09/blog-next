import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import { Button, Divider, Skeleton } from 'antd';
import { useAuth } from 'auth';
import UserSkeleton from 'components/common/UserSkeleton';
import BlogCard from 'components/common/BlogCard';
import { openModal } from 'store/modalSlice';
import { getUserSuggestions } from 'request/user';
import { getBlogSuggestions, getGenre } from 'request/blog';
import { queryKeys } from 'utils';
import { MODAL_KEYS } from 'constants/reduxKeys';
import { BLOG, GENRE, USER } from 'constants/queryKeys';

const { USER_SUGGESTIONS_MODAL, LOGIN_MODAL } = MODAL_KEYS;

const HomeSider = () => {
  const router = useRouter();

  const dispatch = useDispatch();

  const { authUser } = useAuth();

  const { data: userSuggestions, isLoading: isUserSuggestionsLoading } = useQuery({
    queryFn: () => getUserSuggestions({ size: 3 }),
    queryKey: queryKeys(USER).list({ size: 3 }),
  });

  const { data: blogSuggestions, isLoading: isBlogSuggestionsLoading } = useQuery({
    queryFn: () => getBlogSuggestions({ size: 4 }),
    queryKey: queryKeys(BLOG).list({ size: 4 }),
  });

  const { data: genre } = useQuery({
    queryFn: getGenre,
    queryKey: queryKeys(GENRE).lists(),
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
              <Skeleton key={i} className='py-0.5' avatar round paragraph={{ rows: 0 }} active />
            ))
          : userSuggestions?.result?.map((user) => (
              <UserSkeleton key={user.id} user={user} descriptionMode='bio' />
            ))}

        <span
          className='text-[#1890ff] cursor-pointer hover:text-blue-600 transition-all duration-300'
          onClick={() => dispatch(openModal({ key: USER_SUGGESTIONS_MODAL }))}
        >
          View More Suggestions
        </span>

        <Divider />

        <header className='text-xl pb-4'>More Blogs</header>

        {isBlogSuggestionsLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className='py-5' avatar round paragraph={{ rows: 2 }} active />
            ))
          : blogSuggestions?.result?.map((blog) => (
              <BlogCard key={blog.id} blog={blog} size='small' />
            ))}

        <header className='text-xl pb-4'>Pick a genre</header>

        <div className='flex flex-wrap gap-2'>
          {genre &&
            Object.values(genre).map((genre) => (
              <span
                key={genre}
                className='flex flex-col py-1 px-0.5 cursor-pointer hover:bg-zinc-900 transition-all'
                onClick={() => router.push(`/${genre.toLowerCase()}`)}
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
