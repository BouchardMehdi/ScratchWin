const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/scratchwin/api";

export const ACCESS_TOKEN_KEY = "scratchwin_token";
export const REFRESH_TOKEN_KEY = "scratchwin_refresh_token";
export const LAST_REFRESH_AT_KEY = "scratchwin_last_refresh_at";
export const SESSION_REFRESHED_EVENT = "scratchwin:session-refreshed";
export const SESSION_EXPIRED_EVENT = "scratchwin:session-expired";

let refreshPromise = null;

function buildHeaders(options) {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

async function parseResponse(response) {
  const contentType = response.headers.get("content-type") || "";
  return contentType.includes("application/json") ? response.json() : response.text();
}

async function refreshAccessToken() {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  if (!refreshToken) {
    throw new Error("Aucun refresh token disponible.");
  }

  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    })
      .then(async (response) => {
        const payload = await parseResponse(response);

        if (!response.ok) {
          const error = new Error(
            typeof payload === "object" ? payload.message : "Impossible de rafraichir la session.",
          );
          error.status = response.status;
          throw error;
        }

        const refreshedAt = Date.now();
        localStorage.setItem(ACCESS_TOKEN_KEY, payload.token);
        localStorage.setItem(REFRESH_TOKEN_KEY, payload.refreshToken);
        localStorage.setItem(LAST_REFRESH_AT_KEY, String(refreshedAt));

        window.dispatchEvent(
          new CustomEvent(SESSION_REFRESHED_EVENT, {
            detail: {
              token: payload.token,
              refreshToken: payload.refreshToken,
              refreshedAt,
              user: payload.user || null,
            },
          }),
        );

        return payload;
      })
      .catch((error) => {
        if (error.status === 401 || error.status === 403) {
          localStorage.removeItem(ACCESS_TOKEN_KEY);
          localStorage.removeItem(REFRESH_TOKEN_KEY);
          localStorage.removeItem(LAST_REFRESH_AT_KEY);
          window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT));
        }

        throw error;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

export async function apiFetch(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: buildHeaders(options),
  });

  const payload = await parseResponse(response);

  const canTryRefresh =
    response.status === 401 &&
    !options.skipAuthRefresh &&
    !path.startsWith("/auth/login") &&
    !path.startsWith("/auth/register") &&
    !path.startsWith("/auth/refresh");

  if (canTryRefresh && localStorage.getItem(REFRESH_TOKEN_KEY)) {
    await refreshAccessToken();

    const retryResponse = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: buildHeaders(options),
    });

    const retryPayload = await parseResponse(retryResponse);

    if (!retryResponse.ok) {
      const message =
        typeof retryPayload === "object" ? retryPayload.message : "Une erreur est survenue.";
      const error = new Error(message);
      error.details = retryPayload.errors || [];
      error.status = retryResponse.status;
      throw error;
    }

    return retryPayload;
  }

  if (!response.ok) {
    const message = typeof payload === "object" ? payload.message : "Une erreur est survenue.";
    const error = new Error(message);
    error.details = payload.errors || [];
    error.status = response.status;
    throw error;
  }

  return payload;
}
