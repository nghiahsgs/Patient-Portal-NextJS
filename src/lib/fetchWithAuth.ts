interface FetchOptions extends RequestInit {
    headers?: HeadersInit;
  }
  
  export const fetchWithAuth = async (url: string, options: FetchOptions = {}) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };
  
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
  
    return response;
  };