import type { NextPage } from 'next';
import Head from 'next/head';

const Home: NextPage = () => {
  return (
    <div>
      <Head>
        <title>Create Next App</title>
        <link href='/favicon.ico' rel='icon' />
      </Head>

      <main>
        <label className='btn modal-button w-24' htmlFor='registerModal'>
          open Register
        </label>
        <label className='btn modal-button w-24' htmlFor='loginModal'>
          open login
        </label>
      </main>
    </div>
  );
};

export default Home;
