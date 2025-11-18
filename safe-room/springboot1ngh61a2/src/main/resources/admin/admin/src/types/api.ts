/**
 * API响应类型定义
 */

import type { ApiResponse, PaginationResponse } from "./index";

// 登录响应
export interface LoginResponse extends ApiResponse {
  data?: {
    token: string;
    userInfo: {
      id: number;
      username: string;
      name: string;
      role: string;
      [key: string]: any;
    };
  };
}

// 注册响应
export interface RegisterResponse extends ApiResponse {
  data?: {
    id: number;
    username: string;
  };
}

// 通用列表响应
export type ListResponse<T> = ApiResponse<PaginationResponse<T>>;
