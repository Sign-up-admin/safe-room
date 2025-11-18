/**
 * API请求工具
 */

import axios, { type AxiosRequestConfig, type AxiosResponse } from "axios";
import { API_BASE_URL } from "./constants";
import { getToken } from "./auth";
import { ElMessage } from "element-plus";

// 创建axios实例
const instance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 请求拦截器
instance.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 响应拦截器
instance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token过期，跳转到登录页
      ElMessage.error("登录已过期，请重新登录");
      // 这里可以调用logout函数
    } else if (error.response?.status >= 500) {
      ElMessage.error("服务器错误，请稍后重试");
    } else {
      const message =
        error.response?.data?.message || error.message || "请求失败";
      ElMessage.error(message);
    }
    return Promise.reject(error);
  },
);

// 请求方法
export interface RequestConfig extends AxiosRequestConfig {
  showError?: boolean;
}

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

/**
 * 通用请求方法
 */
export const request = {
  get: <T = any>(url: string, config?: RequestConfig): Promise<T> => {
    return instance.get(url, config).then((res) => res.data);
  },
  post: <T = any>(
    url: string,
    data?: any,
    config?: RequestConfig,
  ): Promise<T> => {
    return instance.post(url, data, config).then((res) => res.data);
  },
  put: <T = any>(
    url: string,
    data?: any,
    config?: RequestConfig,
  ): Promise<T> => {
    return instance.put(url, data, config).then((res) => res.data);
  },
  delete: <T = any>(url: string, config?: RequestConfig): Promise<T> => {
    return instance.delete(url, config).then((res) => res.data);
  },
  patch: <T = any>(
    url: string,
    data?: any,
    config?: RequestConfig,
  ): Promise<T> => {
    return instance.patch(url, data, config).then((res) => res.data);
  },
};

// 导出别名以保持向后兼容
export const get = request.get;
export const post = request.post;
export const put = request.put;
export const del = request.delete;
export const patch = request.patch;
