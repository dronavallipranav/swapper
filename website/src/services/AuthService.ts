import api from "./AxiosInterceptor";
import {jwtDecode} from 'jwt-decode';
import { User } from "../models/User";

export const register = async (
    email: string,
    password: string,
    name: string
): Promise<User> => {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await api.post<{ token: string }>(`/signup`, { email, password, name});

      if (response.status !== 200) {
        reject(response);
      } else {

      const tok = response.data.token;
      localStorage.setItem('token', tok);

      const decoded: User = jwtDecode<User>(tok);
      localStorage.setItem('user', JSON.stringify(decoded));
      resolve(decoded);
      }
    } catch (error) {
      reject(error);
    }
  });

};

export const login = (
    u: { email: string; password: string }
): Promise<User> => {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await api.post<{ token: string }>(`/login`, u);
      const tok = response.data.token;
      localStorage.setItem('token', tok);

      const decoded: User = jwtDecode<User>(tok);
      localStorage.setItem('user', JSON.stringify(decoded));
      resolve(decoded);
    } catch (error) {
      reject(error);
    }
  });
};

export const logout = (): void => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
};

export const isAuth = (): boolean => {
  return Boolean(localStorage.getItem('token'));
};