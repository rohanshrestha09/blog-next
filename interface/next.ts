import { NextApiRequest, NextApiResponse } from 'next';

type NextApiHandler<T = any> = (
  req: NextApiRequest & T,
  res: NextApiResponse<T>
) => unknown | Promise<unknown>;

export default NextApiHandler;
