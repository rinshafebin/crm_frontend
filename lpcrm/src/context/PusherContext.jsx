import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { getPusherClient, destroyPusherClient } from '../lib/pusher';
import { useAuth } from './AuthContext';

const PusherContext = createContext(null);

export const PusherProvider = ({ children }) => {
  const { accessToken, isAuthenticated } = useAuth();
  const pusherRef = useRef(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      destroyPusherClient();
      pusherRef.current = null;
      setIsReady(false);
      return;
    }

    pusherRef.current = getPusherClient(accessToken);
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
