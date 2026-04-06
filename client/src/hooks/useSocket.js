import { useEffect, useRef } from 'react';
import socket from '../services/socket';

export default function useSocket(event, callback) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    const handler = (...args) => savedCallback.current(...args);
    socket.on(event, handler);
    return () => socket.off(event, handler);
  }, [event]);

  return socket;
}
