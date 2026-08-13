import axios, { AxiosInstance } from 'axios';

const BASE_URL = 'https://api.scryfall.com';

const axiosInstance: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

export default axiosInstance;
