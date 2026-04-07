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

    const getToken = async () => {
      return accessToken || await refreshAccessToken();
    };

    const client = getPusherClient(getToken);
    pusherRef.current = client;

    // ✅ Only set ready after Pusher is actually connected
    const handleConnected = () => {
      console.log('[Pusher] Connected, setting isReady');
      setIsReady(true);
    };

    const handleDisconnected = () => {
      console.log('[Pusher] Disconnected');
      setIsReady(false);
    };

    const handleError = (err) => {
      console.error('[Pusher] Connection error:', err);
      setIsReady(false);
    };

    client.connection.bind('connected', handleConnected);
    client.connection.bind('disconnected', handleDisconnected);
    client.connection.bind('failed', handleError);

    // If already connected (e.g. hot reload), set ready immediately
    if (client.connection.state === 'connected') {
      setIsReady(true);
    }

    return () => {
      client.connection.unbind('connected', handleConnected);
      client.connection.unbind('disconnected', handleDisconnected);
      client.connection.unbind('failed', handleError);
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
