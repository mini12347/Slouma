export const API_URL = import.meta.env.VITE_API_BASE_URL || 'https://slouma-111.onrender.com/api';
export const API_BASE = API_URL.replace(/\/api$/, '');

const fetchWithAuth = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  // Set default Content-Type to JSON only if it's not a FormData and not already set
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'API request failed');
  }

  return response.json();
};

export default {
  get: (endpoint) => fetchWithAuth(endpoint),
  post: (endpoint, data, options = {}) => {
    const isFormData = data instanceof FormData;
    return fetchWithAuth(endpoint, {
      ...options,
      method: 'POST',
      body: isFormData ? data : JSON.stringify(data)
    });
  },
  put: (endpoint, data, options = {}) => {
    const isFormData = data instanceof FormData;
    return fetchWithAuth(endpoint, {
      ...options,
      method: 'PUT',
      body: isFormData ? data : JSON.stringify(data)
    });
  },
  patch: (endpoint, data, options = {}) => {
    const isFormData = data instanceof FormData;
    return fetchWithAuth(endpoint, {
      ...options,
      method: 'PATCH',
      body: isFormData ? data : JSON.stringify(data)
    });
  },
  delete: (endpoint, options = {}) => fetchWithAuth(endpoint, { ...options, method: 'DELETE' }),
};
