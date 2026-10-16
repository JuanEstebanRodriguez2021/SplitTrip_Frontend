import { request } from './client'
import type { AuthResponse, MessageResponse, User } from './types'

export const authApi = {
  register: (name: string, email: string, password: string) =>
    request<MessageResponse>('/auth/register', { method: 'POST', body: { name, email, password } }),

  verifyEmail: (token: string) =>
    request<MessageResponse>('/auth/verify-email', { method: 'POST', body: { token } }),

  resendVerification: (email: string) =>
    request<MessageResponse>('/auth/resend-verification', { method: 'POST', body: { email } }),

  login: (email: string, password: string, rememberMe: boolean) =>
    request<AuthResponse>('/auth/login', { method: 'POST', body: { email, password, rememberMe } }),

  forgotPassword: (email: string) =>
    request<MessageResponse>('/auth/forgot-password', { method: 'POST', body: { email } }),

  resetPassword: (token: string, newPassword: string) =>
    request<MessageResponse>('/auth/reset-password', { method: 'POST', body: { token, newPassword } }),

  me: () => request<User>('/auth/me'),
}