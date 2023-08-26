import { NextApiRequest, NextApiResponse } from 'next';

export class HttpException extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly message: string,
  ) {
    super(message);
  }
}

export const errorHandler = (err: unknown, _: NextApiRequest, res: NextApiResponse) => {
  if (err instanceof HttpException) res.status(err.statusCode).json({ message: err.message });
  else if (err instanceof Error) res.status(500).json({ message: err.message });
  else res.status(500).json({ message: 'Something went wrong' });
};
