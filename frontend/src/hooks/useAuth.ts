import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const useAuth = () => {
  const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for existing token
    const storedToken = localStorage.getItem('jwtToken');
    if (storedToken) {
      setToken(storedToken);
    }

    // Check URL params for token (from OAuth redirect)
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    if (urlToken) {
      localStorage.setItem('jwtToken', urlToken);
      setToken(urlToken);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    setIsLoading(false);
  }, []);

  const logout = () => {
    localStorage.removeItem('jwtToken');
    setToken(null);
    navigate('/');
  };

  const requireAuth = (redirectTo: string = '/') => {
    if (!isLoading && !token) {
      navigate(redirectTo);
    }
  };

  return { token, isLoading, logout, requireAuth };
};
