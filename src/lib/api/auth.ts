/**
 * Authentication API client
 * Handles login, logout, and session management
 */

import { apiClient } from "./api-client";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

export const authApi = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return apiClient.post<LoginResponse>("/auth/login", credentials);
  },

  async logout(): Promise<void> {
    return apiClient.post<void>("/auth/logout");
  },

  async getCurrentUser() {
    return apiClient.get<LoginResponse["user"]>("/auth/me");
  },
};

