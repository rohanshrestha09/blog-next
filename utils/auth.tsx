import { GetServerSidePropsContext } from 'next';
import { DehydratedState } from '@tanstack/react-query';

const withAuth = (
  gssp: (context: GetServerSidePropsContext) => Promise<{
    props: { dehydratedState: DehydratedState };
  }>
) => {
  return async (context: GetServerSidePropsContext) => {
    const { req } = context;

    const { token } = req.cookies;

    if (!token) {
      return {
        redirect: {
          destination: '/fallback',
        },
      };
    }

    const { props } = await gssp(context); // Run `getServerSideProps` to get page-specific data

    // Pass page-specific props along with user data from `withAuth` to component
    return {
      props,
    };
  };
};

export default withAuth;
