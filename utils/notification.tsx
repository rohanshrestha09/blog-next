import { toast, ToastOptions } from 'react-toastify';

const config: ToastOptions<{}> = {
  position: 'top-right',
  autoClose: 2500,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
};

export const defaultNotification = (message: string) => toast(message, config);

export const successNotification = (message: string) => toast.success(message, config);

export const errorNotification = (err: Error | any) =>
  toast.error(err?.response?.data?.message, config);

export const infoNotification = (message: string) => toast.info(message, config);

export const warningNotification = (message: string) => toast.warn(message, config);
