import axios, { AxiosRequestConfig } from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';
import { NextHandler } from 'next-connect';
import { HttpException } from 'utils/exception';

export const verifyEmail = async (
  req: NextApiRequest,
  _res: NextApiResponse,
  next: NextHandler,
) => {
  const { email } = req.body;

  const options = {
    method: 'GET',
    url: `https://email-verifier-completely-free.p.rapidapi.com/email-verification/${email}`,
    headers: {
      'X-RapidAPI-Key': process.env.RAPID_API_KEY,
      'X-RapidAPI-Host': 'email-verifier-completely-free.p.rapidapi.com',
    },
  };

  const { data } = await axios.request(options as AxiosRequestConfig);

  if (data.response.email_status !== 'Yes') throw new HttpException(404, 'Invalid Email');

  await next();
};
