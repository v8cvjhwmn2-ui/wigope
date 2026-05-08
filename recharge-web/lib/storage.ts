const ACCESS = 'wigope_access_token';
const REFRESH = 'wigope_refresh_token';
const USER = 'wigope_user';

export const tokenStore = {
  get access() {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(ACCESS);
  },
  get refresh() {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(REFRESH);
  },
  save(accessToken: string, refreshToken: string) {
    window.localStorage.setItem(ACCESS, accessToken);
    window.localStorage.setItem(REFRESH, refreshToken);
  },
  clear() {
    window.localStorage.removeItem(ACCESS);
    window.localStorage.removeItem(REFRESH);
    window.localStorage.removeItem(USER);
  },
  saveUser(user: unknown) {
    window.localStorage.setItem(USER, JSON.stringify(user));
  },
  readUser<T>() {
    if (typeof window === 'undefined') return null;
    try {
      const raw = window.localStorage.getItem(USER);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  }
};
