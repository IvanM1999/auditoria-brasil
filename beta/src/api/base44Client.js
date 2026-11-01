import { appParams } from '@/lib/app-params';

const { appId, token, appBaseUrl, functionsVersion } = appParams;
const apiBase = new URL('/api/', appBaseUrl).toString();

class Base44ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'Base44ApiError';
    this.status = status;
  }
}

/**
 * @param {string} path
 * @param {{ method?: string, body?: unknown, allowAnonymous?: boolean }} [options]
 */
const request = async (path, { method = 'GET', body, allowAnonymous = false } = {}) => {
  if (!appId) {
    if (allowAnonymous) return null;
    throw new Error('Configure VITE_BASE44_APP_ID para consultar os dados eleitorais.');
  }

  const headers = { Accept: 'application/json' };
  headers['X-App-Id'] = appId;
  if (path.startsWith('functions/') && functionsVersion) {
    headers['Base44-Functions-Version'] = functionsVersion;
  }
  const accessToken = token || localStorage.getItem('base44_access_token');
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  const response = await fetch(new URL(`apps/${encodeURIComponent(appId)}/${path}`, apiBase), {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = response.status === 204 ? null : await response.json();
  if (!response.ok) {
    const message = data?.error?.message || data?.message || data?.detail || data?.error;
    throw new Base44ApiError(
      message || `A API eleitoral respondeu com HTTP ${response.status}`,
      response.status,
    );
  }
  return data;
};

const queryString = (params) => {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, String(value));
    }
  }
  return search.toString();
};

const isPageOptions = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

const setToken = (value) => {
  if (!value) return;
  localStorage.setItem('base44_access_token', value);
  localStorage.setItem('token', value);
};

const auth = {
  me: async () => {
    try {
      return await request('entities/User/me', { allowAnonymous: true });
    } catch (error) {
      if (error instanceof Base44ApiError && error.status === 401) return null;
      throw error;
    }
  },
  loginViaEmailPassword: async (email, password) => {
    const result = await request('auth/login', { method: 'POST', body: { email, password } });
    setToken(result?.access_token);
    return result;
  },
  register: (payload) => request('auth/register', { method: 'POST', body: payload }),
  verifyOtp: async ({ email, otpCode }) => {
    const result = await request('auth/verify-otp', {
      method: 'POST',
      body: { email, otp_code: otpCode },
    });
    setToken(result?.access_token);
    return result;
  },
  resendOtp: (email) => request('auth/resend-otp', { method: 'POST', body: { email } }),
  resetPasswordRequest: (email) => request('auth/reset-password-request', {
    method: 'POST',
    body: { email },
  }),
  resetPassword: ({ resetToken, newPassword }) => request('auth/reset-password', {
    method: 'POST',
    body: { reset_token: resetToken, new_password: newPassword },
  }),
  setToken,
  logout: () => {
    localStorage.removeItem('base44_access_token');
    localStorage.removeItem('token');
    if (appId) {
      const url = new URL('/api/apps/auth/logout', appBaseUrl);
      url.searchParams.set('from_url', window.location.href);
      window.location.assign(url);
    }
  },
  loginWithProvider: (provider = 'google', fromUrl = '/') => {
    if (!appId) throw new Error('Configure VITE_BASE44_APP_ID para autenticar.');
    const redirectUrl = new URL(fromUrl, window.location.origin).toString();
    const providerPath = provider === 'google' ? '' : `/${encodeURIComponent(provider)}`;
    const url = new URL(`/api/apps/auth${providerPath}/login`, appBaseUrl);
    url.searchParams.set('app_id', appId);
    url.searchParams.set('from_url', redirectUrl);
    window.location.assign(url);
  },
};

const entity = (name) => {
  const basePath = `entities/${encodeURIComponent(name)}`;

  const read = (query, sort, limit, skip, fields) => request(`${basePath}?${queryString({
    ...(query ? { q: JSON.stringify(query) } : {}),
    sort,
    limit,
    skip,
    fields: Array.isArray(fields) ? fields.join(',') : fields,
  })}`);

  const readPage = (query, options = {}) => request(`${basePath}/v2/list?${queryString({
    ...(query ? { q: JSON.stringify(query) } : {}),
    sort: options.sort,
    limit: options.limit,
    cursor: options.cursor,
    fields: Array.isArray(options.fields) ? options.fields.join(',') : options.fields,
  })}`);

  return {
    list: (...args) => {
      const [sort, limit, skip, fields] = args;
      return isPageOptions(sort) ? readPage(undefined, sort) : read(undefined, sort, limit, skip, fields);
    },
    filter: (query, ...args) => {
      const [sort, limit, skip, fields] = args;
      return isPageOptions(sort) ? readPage(query, sort) : read(query, sort, limit, skip, fields);
    },
    get: (id) => request(`${basePath}/${encodeURIComponent(id)}`),
    create: (value) => request(basePath, { method: 'POST', body: value }),
  };
};

export const base44 = {
  auth,
  entities: new Proxy({}, {
    get: (_, name) => typeof name === 'string' ? entity(name) : undefined,
  }),
  functions: {
    invoke: (name, data) => request(`functions/${encodeURIComponent(name)}`, {
      method: 'POST',
      body: data,
    }),
  },
};
