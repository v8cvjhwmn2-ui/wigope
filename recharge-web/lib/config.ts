export const SERVER_API_BASE_URL =
  process.env.BACKEND_API_BASE_URL ?? 'https://recharge-api.wigope.com/api/v1';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.startsWith('/api/proxy')
  ? process.env.NEXT_PUBLIC_API_BASE_URL
  : '/api/proxy';

export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://recharge.wigope.com';

export const HUBBLE_SDK_BASE_URL =
  process.env.NEXT_PUBLIC_HUBBLE_SDK_BASE_URL ?? 'https://sdk.dev.myhubble.money/';

export const HUBBLE_CLIENT_ID = process.env.NEXT_PUBLIC_HUBBLE_CLIENT_ID ?? 'wigope-dev-sdk-mwcofdsa';

export const HUBBLE_APP_SECRET =
  process.env.NEXT_PUBLIC_HUBBLE_APP_SECRET ?? '';

export const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? '';
