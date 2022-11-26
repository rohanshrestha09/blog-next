import { AxiosResponse } from 'axios';

declare global {
  interface IMessage {
    message: string;
  }

  interface AxiosError {
    response: AxiosResponse<IMessage>;
  }
}
