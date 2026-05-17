const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export const apiFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(errorBody || 'Ocurrió un error en la petición');
  }

  // If response is JSON, parse it
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  
  return response.text();
};

export const login = async (username, password) => {
  const data = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  if (data && data.token) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('username', username);
    if (data.rol) {
      localStorage.setItem('rol', data.rol);
    }
  }
  return data;
};

export const register = async (username, password, rol) => {
  return apiFetch('/auth/registro', {
    method: 'POST',
    body: JSON.stringify({ username, password, rol }),
  });
};

export const getCarnes = async () => {
  return apiFetch('/carnes');
};

export const getCarneByCodigo = async (codigo) => {
  return apiFetch(`/carnes/${codigo}`);
};

export const getCarnesByLote = async (codigoLote) => {
  return apiFetch(`/carnes/lote/${codigoLote}`);
};

export const registerCarne = async (carneData) => {
  return apiFetch('/carnes', {
    method: 'POST',
    body: JSON.stringify(carneData),
  });
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('username');
};
