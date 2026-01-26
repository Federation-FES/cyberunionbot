import { useState, useEffect } from 'react';
import { verifySessionToken } from '@/lib/security';

interface SessionData {
  token: string;
  id: string;
  name: string;
  login: string;
  phone: string;
}

export function useSession() {
  const [session, setSession] = useState<SessionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSession = () => {
      try {
        const sessionStr = localStorage.getItem('user_session');
        if (!sessionStr) {
          setSession(null);
          setIsLoading(false);
          return;
        }

        const sessionData = JSON.parse(sessionStr) as SessionData;
        
        // Проверяем токен сессии
        if (sessionData.token) {
          const verified = verifySessionToken(sessionData.token);
          
          if (!verified || verified.expired) {
            // Токен истек или невалиден
            localStorage.removeItem('user_session');
            setSession(null);
            setIsLoading(false);
            return;
          }
        }

        setSession(sessionData);
      } catch (error) {
        console.error('Session load error:', error);
        localStorage.removeItem('user_session');
        setSession(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();
  }, []);

  const clearSession = () => {
    localStorage.removeItem('user_session');
    setSession(null);
  };

  return { session, isLoading, clearSession };
}
