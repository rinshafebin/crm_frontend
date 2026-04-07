import { useEffect, useRef } from 'react';
import { usePusher } from '../context/PusherContext';
import { useAuth } from '../context/AuthContext';

export const useUserChannel = ({ 
  onTaskAssigned,
  onTaskStatusUpdated,
  onLeadAssigned,
  onNewConversation,
} = {}) => {
  const { pusher, isReady } = usePusher();
  const { user } = useAuth();
  const channelRef = useRef(null);

  useEffect(() => {
    if (!isReady || !pusher || !user?.id) return;

    const channelName = `private-user-${user.id}`;
    channelRef.current = pusher.subscribe(channelName);

    if (onTaskAssigned)
      channelRef.current.bind('task.assigned', onTaskAssigned);

    if (onTaskStatusUpdated)
      channelRef.current.bind('task.status_updated', onTaskStatusUpdated);

    if (onLeadAssigned)
      channelRef.current.bind('lead.assigned', onLeadAssigned);

    if (onNewConversation)
      channelRef.current.bind('new-conversation', onNewConversation);

    return () => {
      channelRef.current?.unbind_all();
      pusher.unsubscribe(channelName);
    };
  }, [isReady, pusher, user?.id]);
};
