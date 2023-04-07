import { NextFunction, Request, Response } from 'express';
import axios, { AxiosRequestConfig } from 'axios';
const asyncHandler = require('express-async-handler');

export default asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
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

    if (data.response.email_status !== 'Yes')
      return res.status(404).json({ message: 'Invalid Email' });

    next();
  }
);
