import Head from 'next/head';
import { NextPage } from 'next';
import { Button } from 'antd';

const Fallback: NextPage = () => {
  return (
    <div>
      <Head>
        <title>Create Next App</title>
        <link href='/favicon.ico' rel='icon' />
      </Head>

      <main className='absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center'>
        <label htmlFor='registerModal'>
          <Button className='btn min-h-8 h-10 focus:bg-[#021431]'>Signup</Button>
        </label>

        <label htmlFor='loginModal'>
          <Button className='modal-button min-h-8 h-10 mx-2 rounded-[0.5rem] border-slate-600 uppercase'>
            Signin
          </Button>
        </label>
      </main>
    </div>
  );
};

export default Fallback;
