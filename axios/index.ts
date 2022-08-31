import Axios, { AxiosRequestConfig } from 'axios';

const axios = Axios.create();

axios.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const auth_token = localStorage.getItem('token');

    const { headers } = config;

    if (headers) headers['Authorization'] = 'Bearer ' + auth_token;
    return config;
  },
  (error) => Promise.reject(error)
);

export default axios;
