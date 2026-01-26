const fallbackBase = "http://localhost:5000";

const isBrowser = typeof window !== "undefined";

export const getApiBase = () => {
  const windowBase = isBrowser ? window.__API_BASE__ : undefined;
  const envBase =
    typeof import.meta !== "undefined"
      ? import.meta.env?.VITE_API_BASE_URL
      : undefined;
  return windowBase || envBase || fallbackBase;
};

export const getAuthToken = () => {
  if (!isBrowser) return undefined;
  return (
    window.__APP_TOKEN__ ||
    window.localStorage?.getItem("app_token") ||
    undefined
  );
};

export const buildAuthHeaders = () => {
  const token = getAuthToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
};

const normalizeBody = (body) => {
  if (!body) return undefined;
  if (typeof body === "string") return body;
  try {
    return JSON.stringify(body);
  } catch (error) {
    console.error("[API] Failed to stringify body", error);
    throw error;
  }
};

export const jsonFetch = async (path, options = {}) => {
  const { method = "GET", headers: customHeaders = {}, body } = options;
  const base = getApiBase();
  const url = path.startsWith("http") ? path : `${base}${path}`;
  const normalizedBody = normalizeBody(body);

  const headers = {
    Accept: "application/json",
    ...(normalizedBody ? { "Content-Type": "application/json" } : {}),
    ...buildAuthHeaders(),
    ...customHeaders,
  };

  const fetchConfig = {
    method,
    ...options,
    headers,
    ...(normalizedBody ? { body: normalizedBody } : {}),
  };

  let logBody;
  if (normalizedBody) {
    try {
      logBody = JSON.parse(normalizedBody);
    } catch {
      logBody = normalizedBody;
    }
  }

  console.log(`[API] ${method} ${url}`, logBody);
  const response = await fetch(url, fetchConfig);
  const text = await response.text();
  let payload = null;

  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }
  }

  console.log(`[API] Response ${response.status} ${url}`, payload);

  if (!response.ok) {
    const error = new Error(
      payload?.message || `Request failed with status ${response.status}`,
    );
    error.status = response.status;
    error.data = payload;
    throw error;
  }

  return payload;
};

// Upload a file using FormData. Do not set Content-Type manually.
export const uploadFile = async (path, file, fieldName = "file") => {
  const base = getApiBase();
  const url = path.startsWith("http") ? path : `${base}${path}`;
  const form = new FormData();
  form.append(fieldName, file);

  const headers = {
    ...buildAuthHeaders(),
  };

  console.log(`[API] POST (upload) ${url} -> ${file?.name}`);
  const response = await fetch(url, {
    method: "POST",
    headers,
    body: form,
  });

  const text = await response.text();
  let payload = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }
  }

  console.log(`[API] Response ${response.status} ${url}`, payload);

  if (!response.ok) {
    const error = new Error(
      payload?.message || `Upload failed with status ${response.status}`,
    );
    error.status = response.status;
    error.data = payload;
    throw error;
  }

  return payload;
};
