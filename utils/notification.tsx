import { AxiosError } from 'axios';
import React from 'react';
import { toast, ToastOptions } from 'react-toastify';

const config: ToastOptions<{}> = {
  className: 'font-sans',
  position: 'top-right',
  theme: 'dark',
  autoClose: 2500,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
};

export const defaultNotification = (message: string) => toast(message, config);

export const successNotification = (message: string) => toast.success(message, config);

export const errorNotification = (err: AxiosError<{ message?: string }>) =>
  toast.error(err.response?.data?.message, config);

export const infoNotification = (message: string) => toast.info(message, config);

export const warningNotification = (message: string) => toast.warn(message, config);

export const jsxNotification = (data: React.ReactNode) =>
  toast(data, {
    ...config,
    position: 'bottom-left',
    autoClose: 5000,
    style: {
      width: window.innerWidth < 639 ? 'auto' : '28rem',
    },
    hideProgressBar: true,
  });
