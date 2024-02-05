import Head from 'next/head';
import Link from 'next/link';
import { Fragment } from 'react';
import { Button, Result } from 'antd';

export default function Error() {
  return (
    <Fragment>
      <Head>
        <title>Error | BlogSansar</title>
      </Head>

      <div className='flex items-center justify-center h-full'>
        <Result
          status='404'
          title='404'
          subTitle='Sorry, the page you visited does not exist.'
          extra={
            <Link href='/'>
              <Button className='rounded-lg' type='primary'>
                Back Home
              </Button>
            </Link>
          }
        />
      </div>
    </Fragment>
  );
}
