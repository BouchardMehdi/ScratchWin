const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || "/scratchwin/api";

export const ACCESS_TOKEN_KEY = "scratchwin_token";
export const REFRESH_TOKEN_KEY = "scratchwin_refresh_token";
export const LAST_REFRESH_AT_KEY = "scratchwin_last_refresh_at";
export const SESSION_REFRESHED_EVENT = "scratchwin:session-refreshed";
export const SESSION_EXPIRED_EVENT = "scratchwin:session-expired";
let refreshPromise = null;
let sessionGeneration = 0;

export function invalidatePendingSession() {
  sessionGeneration += 1;
}

function buildHeaders(options) {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return headers;
}

async function parseResponse(response) {
  return (response.headers.get("content-type") || "").includes("application/json")
    ? response.json() : response.text();
}

function responseError(response, payload) {
  const error = new Error(payload?.message || "Une erreur est survenue. Reessaie dans un instant.");
  error.status = response.status;
  error.details = payload?.errors || [];
  return error;
}

async function request(path, options = {}) {
  const { skipAuthRefresh, ...fetchOptions } = options;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...fetchOptions, signal: fetchOptions.signal || AbortSignal.timeout(15_000), headers: buildHeaders(options),
  });
  return { response, payload: await parseResponse(response) };
}

export function refreshAccessToken() {
  if (refreshPromise) return refreshPromise;
  const requestedToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  const generation = sessionGeneration;
  if (!requestedToken) return Promise.reject(new Error("Session absente."));

  const rotate = async () => {
    if (generation !== sessionGeneration) throw new Error("Session modifiee.");
    const currentToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    // Another tab may have rotated while this tab waited for the browser lock.
    if (currentToken !== requestedToken) {
      if (!currentToken) throw new Error("Session expiree.");
      const session = {
        token: localStorage.getItem(ACCESS_TOKEN_KEY), refreshToken: currentToken,
        refreshedAt: Number(localStorage.getItem(LAST_REFRESH_AT_KEY)),
      };
      window.dispatchEvent(new CustomEvent(SESSION_REFRESHED_EVENT, { detail: session }));
      return session;
    }
    try {
      const { response, payload } = await request("/auth/refresh", {
        method: "POST", body: JSON.stringify({ refreshToken: currentToken }),
      });
      if (!response.ok) throw responseError(response, payload);
      // A late refresh must never restore a session after logout or a new login.
      if (generation !== sessionGeneration || localStorage.getItem(REFRESH_TOKEN_KEY) !== currentToken) {
        throw new Error("Session modifiee.");
      }
      const session = { ...payload, refreshedAt: Date.now() };
      localStorage.setItem(ACCESS_TOKEN_KEY, session.token);
      localStorage.setItem(REFRESH_TOKEN_KEY, session.refreshToken);
      localStorage.setItem(LAST_REFRESH_AT_KEY, String(session.refreshedAt));
      window.dispatchEvent(new CustomEvent(SESSION_REFRESHED_EVENT, { detail: session }));
      return session;
    } catch (error) {
      if ([401, 403].includes(error.status) && generation === sessionGeneration &&
          localStorage.getItem(REFRESH_TOKEN_KEY) === currentToken) {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(LAST_REFRESH_AT_KEY);
        window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT));
      }
      throw error;
    }
  };
  const locks = globalThis.navigator?.locks;
  refreshPromise = (locks ? locks.request("scratchwin-session-refresh", rotate) : rotate())
    .finally(() => { refreshPromise = null; });
  return refreshPromise;
}

export async function apiFetch(path, options = {}) {
  const generation = sessionGeneration;
  const initialToken = localStorage.getItem(ACCESS_TOKEN_KEY);
  let { response, payload } = await request(path, options);
  const canRefresh = response.status === 401 && !options.skipAuthRefresh && !["/auth/login", "/auth/register", "/auth/refresh", "/auth/logout"].some((route) => path.startsWith(route));
  if (canRefresh && localStorage.getItem(REFRESH_TOKEN_KEY) && generation === sessionGeneration) {
    if (localStorage.getItem(ACCESS_TOKEN_KEY) === initialToken) await refreshAccessToken();
    if (generation !== sessionGeneration) throw new Error("Session modifiee.");
    ({ response, payload } = await request(path, options));
  }
  if (response.status === 401 && canRefresh && generation === sessionGeneration) {
    window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT));
  }
  if (!response.ok) throw responseError(response, payload);
  return payload;
}
