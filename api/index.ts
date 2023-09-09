import Axios from 'axios';

const axios = Axios.create();

axios.interceptors.request.use(
  (config) => {
    config.withCredentials = true;

    return config;
  },
  (error) => Promise.reject(error),
);

axios.defaults.baseURL = process.env.NEXT_PUBLIC_BASE_API_URL;

export default axios;
