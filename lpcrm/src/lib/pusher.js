import Pusher from 'pusher-js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

let pusherInstance = null;

export const getPusherClient = (accessToken) => {
  if (pusherInstance) return pusherInstance;

  pusherInstance = new Pusher(import.meta.env.VITE_PUSHER_KEY, {
    cluster: import.meta.env.VITE_PUSHER_CLUSTER,
    forceTLS: true,
    authorizer: (channel) => ({
      authorize: async (socketId, callback) => {
        try {
          const res = await fetch(`${API_BASE_URL}/pusher/auth/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
              socket_id: socketId,
              channel_name: channel.name,
            }),
          });
          const data = await res.json();
          callback(null, data);
        } catch (err) {
          callback(err, null);
        }
      },
    }),
  });

  return pusherInstance;
};

export const destroyPusherClient = () => {
  if (pusherInstance) {
    pusherInstance.disconnect();
    pusherInstance = null;
  }
};
