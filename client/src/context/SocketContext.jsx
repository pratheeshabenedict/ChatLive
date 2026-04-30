import { createContext, useContext, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const socketRef = useRef(null);

  const connect = (token) => {
    if (socketRef.current?.connected) return;
    socketRef.current = io(process.env.REACT_APP_SERVER_URL, {
      auth: { token }
    });
  };
  const token = localStorage.getItem('token');
  console.log('SocketProvider init, token:', token, 'socket:', socketRef.current);
  if (token && !socketRef.current) connect(token);

  const disconnect = () => {
    socketRef.current?.disconnect();
    socketRef.current = null;
  };

  useEffect(() => () => disconnect(), []);

  return (
    <SocketContext.Provider value={{ socketRef, connect, disconnect }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);