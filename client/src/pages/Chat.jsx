import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';

export default function Chat() {
  const [messages, setMessages]       = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [text, setText]               = useState('');
  const bottomRef                     = useRef(null);
  const typingTimer                   = useRef(null);
  const navigate                      = useNavigate();
  const { socketRef, disconnect }     = useSocket();
  const username                      = localStorage.getItem('username');

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) { navigate('/'); return; }

    socket.on('history',     (msgs) => setMessages(msgs));
    socket.on('newMessage',  (msg)  => setMessages(prev => [...prev, msg]));
    socket.on('onlineUsers', (users) => setOnlineUsers(users));
    socket.on('userTyping',  ({ username: u, isTyping }) => {
      setTypingUsers(prev => {
        const next = new Set(prev);
        isTyping ? next.add(u) : next.delete(u);
        return next;
      });
    });

    return () => socket.removeAllListeners();
  }, []);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!text.trim()) return;
    socketRef.current?.emit('sendMessage', text);
    setText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const handleTyping = (e) => {
    setText(e.target.value);
    socketRef.current?.emit('typing', true);
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socketRef.current?.emit('typing', false);
    }, 1500);
  };

  const handleLogout = () => {
    disconnect();
    localStorage.clear();
    navigate('/');
  };

  const typingList = [...typingUsers].filter(u => u !== username);

  return (
    <div style={{ display: 'flex', height: '100vh', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 20px', borderBottom: '0.5px solid var(--color-border-tertiary)' }}>
        <span style={{ fontWeight: 500 }}>Chat Room</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
            {onlineUsers.length} online
          </span>
          <button onClick={handleLogout} style={{ fontSize: 13 }}>Logout</button>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px',
                      display: 'flex', flexDirection: 'column', gap: 8 }}>
          {messages.map((msg) => {
            const isMe = msg.username === username;
            return (
              <div key={msg._id} style={{ display: 'flex',
                justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '70%',
                  background: isMe ? 'var(--color-background-info)' : 'var(--color-background-secondary)',
                  borderRadius: 12,
                  padding: '8px 12px',
                }}>
                  {!isMe && (
                    <div style={{ fontSize: 11, fontWeight: 500,
                                  color: 'var(--color-text-secondary)', marginBottom: 2 }}>
                      {msg.username}
                    </div>
                  )}
                  <div style={{ fontSize: 14 }}>{msg.text}</div>
                  <div style={{ fontSize: 10, color: 'var(--color-text-tertiary)',
                                marginTop: 4, textAlign: 'right' }}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            );
          })}
          {typingList.length > 0 && (
            <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
              {typingList.join(', ')} {typingList.length === 1 ? 'is' : 'are'} typing...
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Online users sidebar */}
        <div style={{ width: 160, borderLeft: '0.5px solid var(--color-border-tertiary)',
                      padding: '16px 12px', overflowY: 'auto' }}>
          <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-tertiary)',
                        marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Online
          </div>
          {onlineUsers.map((u) => (
            <div key={u.userId} style={{ display: 'flex', alignItems: 'center',
                                         gap: 6, marginBottom: 8, fontSize: 13 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%',
                             background: 'var(--color-text-success)', flexShrink: 0 }}/>
              {u.username}
            </div>
          ))}
        </div>
      </div>

      {/* Input bar */}
      <div style={{ display: 'flex', gap: 8, padding: '12px 16px',
                    borderTop: '0.5px solid var(--color-border-tertiary)' }}>
        <input
          style={{ flex: 1 }}
          placeholder="Type a message..."
          value={text}
          onChange={handleTyping}
          onKeyDown={handleKeyDown}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}