import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [text, setText] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const bottomRef = useRef(null);
  const typingTimer = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { socketRef, disconnect } = useSocket();
  const username = localStorage.getItem('username');

  useEffect(() => {
    const socket = socketRef.current;

    if (!socket) { navigate('/'); return; }

    socket.on('history', (msgs) => setMessages(msgs));
    socket.emit('requestHistory');
    socket.on('newMessage', (msg) => setMessages(prev => [...prev, msg]));
    socket.on('onlineUsers', (users) => setOnlineUsers(users));
    socket.on('userTyping', ({ username: u, isTyping }) => {
      setTypingUsers(prev => {
        const next = new Set(prev);
        isTyping ? next.add(u) : next.delete(u);
        return next;
      });
    });

    return () => socket.removeAllListeners();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!text.trim()) return;
    socketRef.current?.emit('sendMessage', text);
    setText('');
    inputRef.current?.focus();
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

  // Avatar initials helper
  const initials = (name) => name?.slice(0, 2).toUpperCase() || '??';

  // Soft hash → deterministic hue for avatar bg
  const avatarHue = (name) => {
    let h = 0;
    for (let i = 0; i < (name?.length || 0); i++) h = (h * 31 + name.charCodeAt(i)) % 360;
    return h;
  };

  const formatTime = (ts) =>
    new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: "'DM Sans', system-ui, sans-serif", background: '#f7f6f3', overflow: 'hidden' }}>

      {/* ── Left Sidebar ── */}
      <div className={`sidebar ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`} style={{
        display: 'flex',
        flexDirection: 'column',
        background: '#0f1117',
        transition: 'width 0.25s ease',
        overflow: 'hidden',
        flexShrink: 0,
        position: 'relative',
      }}>
        {/* Subtle grid overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          pointerEvents: 'none',
          zIndex: 0,
        }} />

        {/* Logo + collapse toggle */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 20px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          position: 'relative', zIndex: 1,
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
            <div style={{
              width: 32, height: 32, background: '#e8e4d9', borderRadius: 7,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
                <rect x="2" y="2" width="6" height="6" rx="1.5" fill="#0f1117" />
                <rect x="10" y="2" width="6" height="6" rx="1.5" fill="#0f1117" opacity="0.4" />
                <rect x="2" y="10" width="6" height="6" rx="1.5" fill="#0f1117" opacity="0.4" />
                <rect x="10" y="10" width="6" height="6" rx="1.5" fill="#0f1117" />
              </svg>
            </div>
            <span className="sidebar-label" style={{ color: '#e8e4d9', fontWeight: 600, fontSize: 15, letterSpacing: '-0.3px', whiteSpace: 'nowrap' }}>
              Instant
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(o => !o)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'rgba(232,228,217,0.4)', padding: 4, display: 'flex',
              flexShrink: 0,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="2" y="4" width="12" height="1.5" rx="0.75" fill="currentColor" />
              <rect x="2" y="7.25" width="8" height="1.5" rx="0.75" fill="currentColor" />
              <rect x="2" y="10.5" width="10" height="1.5" rx="0.75" fill="currentColor" />
            </svg>
          </button>
        </div>

        {/* Online users */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 12px', position: 'relative', zIndex: 1 }}>
          <div className="sidebar-label" style={{
            fontSize: 10, fontWeight: 600, color: 'rgba(232,228,217,0.3)',
            letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12, paddingLeft: 8,
            whiteSpace: 'nowrap',
          }}>
            Online — {onlineUsers.length}
          </div>
          {onlineUsers.map((u) => {
            const hue = avatarHue(u.username);
            const isCurrentUser = u.username === username;
            return (
              <div key={u.userId} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '7px 8px', borderRadius: 8, marginBottom: 2,
                background: isCurrentUser ? 'rgba(232,228,217,0.06)' : 'transparent',
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 7, flexShrink: 0,
                  background: `hsl(${hue},40%,30%)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 700, color: `hsl(${hue},60%,80%)`,
                  position: 'relative',
                }}>
                  {initials(u.username)}
                  <span style={{
                    position: 'absolute', bottom: -2, right: -2,
                    width: 7, height: 7, borderRadius: '50%',
                    background: '#4ade80', border: '1.5px solid #0f1117',
                  }} />
                </div>
                <span className="sidebar-label" style={{
                  fontSize: 13, color: isCurrentUser ? '#e8e4d9' : 'rgba(232,228,217,0.65)',
                  fontWeight: isCurrentUser ? 500 : 400,
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {u.username}{isCurrentUser ? ' (you)' : ''}
                </span>
              </div>
            );
          })}
        </div>

        {/* User + logout */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.07)',
          padding: '14px 12px',
          display: 'flex', alignItems: 'center', gap: 10,
          position: 'relative', zIndex: 1, flexShrink: 0,
        }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8, flexShrink: 0,
            background: `hsl(${avatarHue(username)},40%,30%)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, fontWeight: 700, color: `hsl(${avatarHue(username)},60%,80%)`,
          }}>
            {initials(username)}
          </div>
          <span className="sidebar-label" style={{
            flex: 1, fontSize: 13, fontWeight: 500, color: '#e8e4d9',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {username}
          </span>
          <button
            onClick={handleLogout}
            className="sidebar-label"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'rgba(232,228,217,0.35)', padding: 4, display: 'flex', flexShrink: 0,
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#e8e4d9'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(232,228,217,0.35)'}
            title="Logout"
          >
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path d="M6 2H3a1 1 0 00-1 1v9a1 1 0 001 1h3M10 10l3-3-3-3M13 7.5H6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Main Chat Area ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 24px',
          height: 56,
          background: '#fff',
          borderBottom: '1px solid #e8e6e0',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%', background: '#4ade80',
              boxShadow: '0 0 0 2px rgba(74,222,128,0.25)',
            }} />
            <span style={{ fontWeight: 600, fontSize: 14, color: '#0f1117', letterSpacing: '-0.3px' }}>
              # general
            </span>
            <span style={{ fontSize: 12, color: '#a8a49f', marginLeft: 4 }}>
              {onlineUsers.length} member{onlineUsers.length !== 1 ? 's' : ''} online
            </span>
          </div>
        </div>

        {/* Messages */}
        <div style={{
          flex: 1, overflowY: 'auto',
          padding: '24px 28px',
          display: 'flex', flexDirection: 'column', gap: 2,
          background: '#f7f6f3',
        }}>
          {messages.length === 0 && (
            <div style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              color: '#a8a49f', fontSize: 14, gap: 8,
              paddingBottom: 80,
            }}>
              <div style={{
                width: 48, height: 48, background: '#0f1117', borderRadius: 12,
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8,
              }}>
                <svg width="22" height="22" viewBox="0 0 18 18" fill="none">
                  <rect x="2" y="2" width="6" height="6" rx="1.5" fill="#e8e4d9" />
                  <rect x="10" y="2" width="6" height="6" rx="1.5" fill="#e8e4d9" opacity="0.4" />
                  <rect x="2" y="10" width="6" height="6" rx="1.5" fill="#e8e4d9" opacity="0.4" />
                  <rect x="10" y="10" width="6" height="6" rx="1.5" fill="#e8e4d9" />
                </svg>
              </div>
              <span style={{ fontWeight: 600, color: '#3a3a3a', fontSize: 15 }}>Welcome to #general</span>
              <span>This is the beginning of the conversation.</span>
            </div>
          )}

          {messages.map((msg, idx) => {
            const isMe = msg.username === username;
            const prevMsg = messages[idx - 1];
            const isSameAuthor = prevMsg && prevMsg.username === msg.username &&
              new Date(msg.createdAt) - new Date(prevMsg.createdAt) < 5 * 60 * 1000;
            const hue = avatarHue(msg.username);

            return (
              <div key={msg._id} style={{
                display: 'flex',
                flexDirection: isMe ? 'row-reverse' : 'row',
                alignItems: 'flex-end',
                gap: 8,
                marginTop: isSameAuthor ? 2 : 14,
              }}>
                {/* Avatar — only show for first in group */}
                <div style={{ width: 30, flexShrink: 0 }}>
                  {!isSameAuthor && (
                    <div style={{
                      width: 30, height: 30, borderRadius: 8,
                      background: isMe ? '#0f1117' : `hsl(${hue},35%,85%)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, fontWeight: 700,
                      color: isMe ? '#e8e4d9' : `hsl(${hue},50%,35%)`,
                    }}>
                      {initials(msg.username)}
                    </div>
                  )}
                </div>

                <div style={{ maxWidth: '62%', display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                  {!isSameAuthor && (
                    <div style={{
                      fontSize: 11, fontWeight: 600,
                      color: isMe ? '#6b6b6b' : '#3a3a3a',
                      marginBottom: 4,
                      paddingLeft: isMe ? 0 : 2,
                      paddingRight: isMe ? 2 : 0,
                    }}>
                      {isMe ? 'You' : msg.username}
                    </div>
                  )}
                  <div style={{
                    background: isMe ? '#0f1117' : '#fff',
                    color: isMe ? '#e8e4d9' : '#0f1117',
                    borderRadius: isSameAuthor
                      ? (isMe ? '14px 4px 4px 14px' : '4px 14px 14px 4px')
                      : (isMe ? '14px 4px 14px 14px' : '4px 14px 14px 14px'),
                    padding: '9px 14px',
                    fontSize: 14,
                    lineHeight: 1.55,
                    boxShadow: isMe ? 'none' : '0 1px 2px rgba(0,0,0,0.06)',
                    border: isMe ? 'none' : '1px solid #ede9e3',
                    wordBreak: 'break-word',
                  }}>
                    {msg.text}
                  </div>
                  <div style={{
                    fontSize: 10, color: '#c4bfb8',
                    marginTop: 3,
                    paddingLeft: isMe ? 0 : 2,
                    paddingRight: isMe ? 2 : 0,
                  }}>
                    {formatTime(msg.createdAt)}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Typing indicator */}
          {typingList.length > 0 && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              marginTop: 8, paddingLeft: 38,
            }}>
              <div style={{ display: 'flex', gap: 3 }}>
                {[0, 1, 2].map(i => (
                  <span key={i} className="typing-dot" style={{
                    width: 5, height: 5, borderRadius: '50%',
                    background: '#a8a49f',
                    display: 'inline-block',
                    animationDelay: `${i * 0.18}s`,
                  }} />
                ))}
              </div>
              <span style={{ fontSize: 12, color: '#a8a49f', fontStyle: 'italic' }}>
                {typingList.join(', ')} {typingList.length === 1 ? 'is' : 'are'} typing
              </span>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input bar */}
        <div style={{
          padding: '12px 20px 16px',
          background: '#fff',
          borderTop: '1px solid #e8e6e0',
          flexShrink: 0,
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: '#f7f6f3',
            border: '1.5px solid #e2e0da',
            borderRadius: 12,
            padding: '0 6px 0 16px',
            transition: 'border-color 0.15s',
          }}
            onFocusCapture={e => e.currentTarget.style.borderColor = '#0f1117'}
            onBlurCapture={e => e.currentTarget.style.borderColor = '#e2e0da'}
          >
            <input
              ref={inputRef}
              placeholder={`Message #general…`}
              value={text}
              onChange={handleTyping}
              onKeyDown={handleKeyDown}
              style={{
                flex: 1,
                height: 44,
                border: 'none',
                background: 'transparent',
                outline: 'none',
                fontSize: 14,
                color: '#0f1117',
                fontFamily: "'DM Sans', system-ui, sans-serif",
              }}
            />
            <button
              onClick={sendMessage}
              disabled={!text.trim()}
              style={{
                height: 34,
                padding: '0 16px',
                background: text.trim() ? '#0f1117' : '#e2e0da',
                color: text.trim() ? '#e8e4d9' : '#a8a49f',
                border: 'none',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                cursor: text.trim() ? 'pointer' : 'not-allowed',
                transition: 'background 0.15s, color 0.15s',
                fontFamily: "'DM Sans', system-ui, sans-serif",
                letterSpacing: '-0.2px',
                display: 'flex', alignItems: 'center', gap: 6,
                flexShrink: 0,
              }}
              onMouseEnter={e => { if (text.trim()) e.currentTarget.style.background = '#2a2a2a'; }}
              onMouseLeave={e => { if (text.trim()) e.currentTarget.style.background = '#0f1117'; }}
            >
              Send
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path d="M1.5 6.5h10M7 2l4.5 4.5L7 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

        * { box-sizing: border-box; }

        /* Sidebar responsive widths */
        .sidebar { width: 220px; }
        .sidebar.sidebar-closed { width: 56px; }
        .sidebar.sidebar-closed .sidebar-label { display: none; }

        /* Scrollbar styling */
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.12); border-radius: 4px; }

        /* Typing animation */
        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
          30% { transform: translateY(-4px); opacity: 1; }
        }
        .typing-dot { animation: typingBounce 1.1s infinite ease-in-out; }

        /* Responsive breakpoints */
        @media (max-width: 900px) {
          .sidebar { width: 180px; }
        }
        @media (max-width: 700px) {
          .sidebar { width: 56px; }
          .sidebar .sidebar-label { display: none; }
        }
      `}</style>
    </div>
  );
}