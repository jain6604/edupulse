import React, { useState, useEffect, useRef } from 'react';
import { sendChatMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';

function ChatAssistant() {
  const { student } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Initialize with a welcome message if empty
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        role: 'ai',
        content: "Hi! I'm your EduPulse AI assistant. Ask me anything about your performance, risk level, or how to improve!"
      }]);
    }
  }, [isOpen, messages.length]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const suggestions = [
    "How can I improve my GPA?",
    "Where do I add my skills?",
    "How to upload my resume?",
    "Why is my risk level high?",
    "Where can I check batch comparison?"
  ];

  const handleSend = async (text) => {
    if (!text.trim() || !student) return;

    const userMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      // Force DOM repaint before heavy API call so indicator shows instantly
      await new Promise(resolve => setTimeout(resolve, 50));
      const response = await sendChatMessage(student.student_id, { message: text });
      setMessages(prev => [...prev, { role: 'ai', content: response.data.response }]);
    } catch (err) {
      const errorText = err.response?.data?.detail || "Sorry, I couldn't process that right now. Please check if my API key is configured correctly.";
      setMessages(prev => [...prev, { role: 'ai', content: errorText, isError: true }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!isOpen) {
    return (
      <button className="chat-button"
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: '30px',
          right: '30px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #d4af62, #60a5fa)',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 0 20px rgba(212,175,98,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          color: 'white',
          zIndex: 1000,
          animation: 'pulse 2s infinite'
        }}
      >
        <span role="img" aria-label="chat">💬</span>
        <style>
          {`
            @keyframes pulse {
              0% { box-shadow: 0 0 0 0 rgba(212,175,98,0.4); }
              70% { box-shadow: 0 0 0 15px rgba(212,175,98,0); }
              100% { box-shadow: 0 0 0 0 rgba(212,175,98,0); }
            }
          `}
        </style>
      </button>
    );
  }

  return (
    <div className="chat-window" style={{
      position: 'fixed',
      bottom: '30px',
      right: '30px',
      width: '380px',
      height: '500px',
      background: '#03060f',
      borderRadius: '16px',
      border: '1px solid rgba(255,255,255,0.06)',
      boxShadow: '0 10px 40px rgba(0,0,0,0.5), 0 0 20px rgba(212,175,98,0.1)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 1000,
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(255,255,255,0.03)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h3 style={{ margin: 0, fontFamily: 'Syne, sans-serif', fontSize: '18px', fontWeight: '800' }}>
            <span className="glow-text">EduPulse AI</span>
          </h3>
          <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Your personal academic advisor</p>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#64748b',
            fontSize: '20px',
            cursor: 'pointer'
          }}
        >
          ×
        </button>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        padding: '20px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{
            alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
            maxWidth: '85%'
          }}>
            <div style={{
              padding: '12px 16px',
              borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
              background: msg.role === 'user' ? 'linear-gradient(135deg, #d4af62, #60a5fa)' : 'rgba(255,255,255,0.05)',
              border: msg.role === 'user' ? 'none' : '1px solid rgba(255,255,255,0.06)',
              color: msg.isError ? '#f87171' : 'white',
              fontSize: '14px',
              lineHeight: '1.5',
              fontFamily: 'Space Grotesk, sans-serif'
            }}>
              {msg.content}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div style={{
            alignSelf: 'flex-start',
            padding: '12px 16px',
            borderRadius: '16px 16px 16px 4px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.06)',
            color: '#94a3b8'
          }}>
            <span className="typing-dot">.</span><span className="typing-dot">.</span><span className="typing-dot">.</span>
            <style>
              {`
                .typing-dot { animation: typing 1.4s infinite both; display: inline-block; margin: 0 1px; }
                .typing-dot:nth-child(2) { animation-delay: 0.2s; }
                .typing-dot:nth-child(3) { animation-delay: 0.4s; }
                @keyframes typing {
                  0% { transform: translateY(0px); opacity: 0.5; }
                  50% { transform: translateY(-3px); opacity: 1; }
                  100% { transform: translateY(0px); opacity: 0.5; }
                }
              `}
            </style>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
        {messages.length === 1 && !isTyping && (
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', scrollbarWidth: 'none' }}>
            {suggestions.map((sug, i) => (
              <button
                key={i}
                onClick={() => handleSend(sug)}
                style={{
                  whiteSpace: 'nowrap',
                  padding: '6px 12px',
                  borderRadius: '12px',
                  background: 'rgba(212,175,98,0.1)',
                  border: '1px solid rgba(212,175,98,0.3)',
                  color: '#e2e8f0',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                {sug}
              </button>
            ))}
          </div>
        )}
        
        <form onSubmit={(e) => { e.preventDefault(); handleSend(inputText); }} style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your message..."
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: '8px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'white',
              fontSize: '14px',
              outline: 'none'
            }}
            disabled={isTyping}
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isTyping}
            style={{
              padding: '0 16px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #d4af62, #60a5fa)',
              border: 'none',
              color: 'white',
              cursor: inputText.trim() && !isTyping ? 'pointer' : 'not-allowed',
              opacity: inputText.trim() && !isTyping ? 1 : 0.5
            }}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChatAssistant;
