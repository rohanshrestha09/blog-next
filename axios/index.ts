import Axios from 'axios';

const axios = Axios.create();

axios.interceptors.request.use(
  (config) => {
    config.withCredentials = true;

    return config;
  },
  (error) => Promise.reject(error)
);

export default axios;
