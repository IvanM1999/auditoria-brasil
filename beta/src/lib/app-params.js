const params = new URLSearchParams(window.location.search);
const configuredBaseUrl = import.meta.env.VITE_BASE44_APP_BASE_URL || 'https://base44.app';
const parsedBaseUrl = new URL(configuredBaseUrl);

if (parsedBaseUrl.protocol !== 'https:' && parsedBaseUrl.hostname !== 'localhost') {
  throw new Error('VITE_BASE44_APP_BASE_URL deve usar HTTPS.');
}

export const appParams = {
  appId: import.meta.env.VITE_BASE44_APP_ID || params.get('app_id') || '',
  token: params.get('access_token') || '',
  functionsVersion: import.meta.env.VITE_BASE44_FUNCTIONS_VERSION || params.get('functions_version') || '',
  appBaseUrl: parsedBaseUrl.origin,
};
