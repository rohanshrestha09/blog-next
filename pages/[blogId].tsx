import Head from 'next/head';
import { NextRouter, useRouter } from 'next/router';
import { GetServerSideProps, GetServerSidePropsContext, NextPage } from 'next';
import { dehydrate, DehydratedState, QueryClient, useQuery } from '@tanstack/react-query';
import { Image } from 'antd';
import parse from 'html-react-parser';
import BlogAxios from '../apiAxios/blogAxios';
import { GET_BLOG } from '../constants/queryKeys';

const Blog: NextPage = () => {
  const {
    query: { blogId },
  }: NextRouter = useRouter();

  const blogAxios = new BlogAxios();

  const { data: blog } = useQuery({
    queryFn: () => blogAxios.getBlog(String(blogId)),
    queryKey: [GET_BLOG, blogId],
  });

  return (
    <div className='w-full flex justify-center'>
      <Head>
        <title>{blog && blog.title}</title>
        <link href='/favicon.ico' rel='icon' />
      </Head>
      {blog && (
        <main className='w-full flex flex-col gap-10 py-4' style={{ overflowWrap: 'anywhere' }}>
          <p className='text-3xl text-white'>{blog.title}</p>

          {blog.image && <Image src={blog.image} />}

          <div className='w-full text-base'>{parse(blog.content)}</div>
        </main>
      )}
    </div>
  );
};

export default Blog;

export const getServerSideProps: GetServerSideProps = async (
  ctx: GetServerSidePropsContext
): Promise<{
  props: { dehydratedState: DehydratedState };
}> => {
  const queryClient = new QueryClient();

  const blogAxios = new BlogAxios(ctx.req.headers.cookie);

  ctx.res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=59');

  await queryClient.prefetchQuery({
    queryFn: () => blogAxios.getBlog(String(ctx.params?.blogId)),
    queryKey: [GET_BLOG, ctx.params?.blogId],
  });

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  };
};
