import { api } from '@/lib/api-client';
import { tokenStore } from '@/lib/storage';
import type { AuthUser, SendOtpResponse, VerifyOtpResponse } from '@/types/api';

export const authService = {
  sendOtp(mobile: string) {
    return api<SendOtpResponse>('/auth/send-otp', {
      method: 'POST',
      auth: false,
      body: JSON.stringify({ mobile })
    });
  },
  async verifyOtp(mobile: string, otp: string) {
    const data = await api<VerifyOtpResponse>('/auth/verify-otp', {
      method: 'POST',
      auth: false,
      body: JSON.stringify({
        mobile,
        otp,
        deviceInfo: { platform: 'web', appVersion: '0.1.0' }
      })
    });
    tokenStore.save(data.accessToken, data.refreshToken);
    tokenStore.saveUser(data.user);
    return data;
  },
  me() {
    return api<{ user: AuthUser }>('/auth/me');
  },
  async logout() {
    const refreshToken = tokenStore.refresh;
    try {
      if (refreshToken) {
        await api('/auth/logout', {
          method: 'POST',
          body: JSON.stringify({ refreshToken })
        });
      }
    } finally {
      tokenStore.clear();
    }
  }
};
