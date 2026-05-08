import { api } from '@/lib/api-client';
import { HUBBLE_APP_SECRET, HUBBLE_CLIENT_ID, HUBBLE_SDK_BASE_URL } from '@/lib/config';
import { ApiError } from '@/lib/errors';

export const rewardsService = {
  async url() {
    const data = await api<{ token: string }>('/rewards/sso-token', { method: 'POST' });
    if (!data.token) throw new ApiError('REWARDS_TOKEN_EMPTY', 'Rewards session could not be created.');
    if (!HUBBLE_CLIENT_ID || !HUBBLE_APP_SECRET) {
      throw new ApiError('HUBBLE_CONFIG_MISSING', 'Hubble rewards credentials are not configured.');
    }
    const url = new URL(HUBBLE_SDK_BASE_URL);
    url.searchParams.set('clientId', HUBBLE_CLIENT_ID);
    url.searchParams.set('appSecret', HUBBLE_APP_SECRET);
    url.searchParams.set('token', data.token);
    url.searchParams.set('theme', 'light');
    url.searchParams.set('appVersion', '0.1.0');
    url.searchParams.set('deviceId', 'wigope-recharge-web');
    return url.toString();
  }
};
