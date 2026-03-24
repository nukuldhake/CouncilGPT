const API_BASE_URL = "http://localhost:8000";

export const getAuthToken = () => localStorage.getItem("token");

export const authenticatedFetch = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem("token");
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }

  return response;
};

export const api = {
  get: (endpoint: string) => authenticatedFetch(endpoint, { method: "GET" }),
  post: (endpoint: string, body: any) =>
    authenticatedFetch(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
    }),
};
