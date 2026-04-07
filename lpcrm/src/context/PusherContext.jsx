// src/context/PusherContext.jsx
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { getPusherClient, destroyPusherClient } from '../lib/pusher';
import { useAuth } from './AuthContext';

const PusherContext = createContext(null);

export const PusherProvider = ({ children }) => {
  const { accessToken, refreshAccessToken, isAuthenticated } = useAuth();
  const pusherRef = useRef(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      destroyPusherClient();
      pusherRef.current = null;
      setIsReady(false);
      return;
    }

    // Pass a function so authorizer always gets a fresh token
    const getToken = async () => {
      return accessToken || await refreshAccessToken();
    };

    pusherRef.current = getPusherClient(getToken);
    setIsReady(true);

    return () => {
      destroyPusherClient();
      setIsReady(false);
    };
  }, [isAuthenticated, accessToken]);

  return (
    <PusherContext.Provider value={{ pusher: pusherRef.current, isReady }}>
      {children}
    </PusherContext.Provider>
  );
};

export const usePusher = () => useContext(PusherContext);
