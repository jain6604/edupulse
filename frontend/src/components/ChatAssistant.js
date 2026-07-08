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
      <button id="chat-toggle-btn" className="chat-button"
        onClick={() => setIsOpen(true)}
        style={{ display: 'none' }}
      >
        <span role="img" aria-label="chat">💬</span>
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
      background: 'var(--chalk-bg)',
      borderRadius: '8px',
      border: '1.5px solid var(--chalk-border)',
      boxShadow: '0 10px 40px rgba(0,0,0,0.5), 0 0 20px rgba(255,255,255,0.05)',
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
          <h3 style={{ margin: 0, fontFamily: 'Patrick Hand, cursive', fontSize: '20px', fontWeight: '800' }}>
            <span>EduPulse AI</span>
          </h3>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--chalk-dim)', fontFamily: 'Patrick Hand' }}>Your personal academic advisor</p>
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
              borderRadius: msg.role === 'user' ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
              background: msg.role === 'user' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)',
              border: '1px solid var(--chalk-border)',
              color: msg.isError ? 'var(--chalk-pink)' : 'var(--chalk-white)',
              fontSize: '15px',
              lineHeight: '1.4',
              fontFamily: 'Patrick Hand, cursive'
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
                  borderRadius: '6px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1.5px solid var(--chalk-border)',
                  color: 'var(--chalk-white)',
                  fontFamily: 'Patrick Hand',
                  fontSize: '13px',
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
              borderRadius: '6px',
              background: 'rgba(255,255,255,0.03)',
              border: '1.5px solid var(--chalk-border)',
              color: 'var(--chalk-white)',
              fontFamily: 'Patrick Hand',
              fontSize: '15px',
              outline: 'none'
            }}
            disabled={isTyping}
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isTyping}
            style={{
              padding: '0 16px',
              borderRadius: '6px',
              background: 'rgba(255,255,255,0.06)',
              border: '1.5px solid var(--chalk-border)',
              color: 'var(--chalk-white)',
              fontFamily: 'Patrick Hand',
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
