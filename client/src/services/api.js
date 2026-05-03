const isProduction = import.meta.env.PROD;
const API_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const fetchWithAuth = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

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
  post: (endpoint, data, options = {}) => fetchWithAuth(endpoint, { ...options, method: 'POST', body: JSON.stringify(data) }),
  put: (endpoint, data, options = {}) => fetchWithAuth(endpoint, { ...options, method: 'PUT', body: JSON.stringify(data) }),
  delete: (endpoint, options = {}) => fetchWithAuth(endpoint, { ...options, method: 'DELETE' }),
};
