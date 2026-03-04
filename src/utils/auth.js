const ROLE_CLAIM_KEYS = [
  'roleId',
  'RoleId',
  'role',
  'Role',
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role',
];

function parseNumeric(value) {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

function toRoleId(value) {
  const numeric = parseNumeric(value);
  if (numeric !== null) return numeric;

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'admin') return 1;
    if (normalized === 'user') return 2;
  }

  return null;
}

export function decodeJwtPayload(token) {
  if (!token || typeof token !== 'string') return null;

  const parts = token.split('.');
  if (parts.length < 2) return null;

  try {
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const json = atob(padded);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function getTokenFromStorage() {
  return localStorage.getItem('token');
}

export function buildAuthHeaders(existingHeaders = {}) {
  const token = getTokenFromStorage();
  if (!token) return existingHeaders;

  return {
    ...existingHeaders,
    Authorization: `Bearer ${token}`,
  };
}

export function authFetch(url, options = {}) {
  const headers = buildAuthHeaders(options.headers || {});

  return fetch(url, {
    ...options,
    headers,
  });
}

export function getRoleIdFromClaims(claims) {
  if (!claims || typeof claims !== 'object') return null;

  for (const key of ROLE_CLAIM_KEYS) {
    if (claims[key] !== undefined && claims[key] !== null) {
      const roleId = toRoleId(claims[key]);
      if (roleId !== null) return roleId;
    }
  }

  return null;
}

export function getStoredRoleId() {
  const storedRoleId = parseNumeric(localStorage.getItem('roleId'));
  if (storedRoleId !== null) return storedRoleId;

  const token = getTokenFromStorage();
  const claims = decodeJwtPayload(token);
  return getRoleIdFromClaims(claims);
}

export function isUserLoggedIn() {
  const token = getTokenFromStorage();
  const userId = localStorage.getItem('userId');
  return Boolean(token || userId);
}