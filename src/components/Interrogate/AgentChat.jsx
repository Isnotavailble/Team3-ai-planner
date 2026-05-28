import React, { useState, useEffect, useRef } from 'react';
import { X, Send, User, Mic } from 'lucide-react';
import api from '../../services/api';

export default function AgentChat({
  agents,
  onClose,
  onBackToReport
}) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isDictating, setIsDictating] = useState(false);
  
  const chatBottomRef = useRef(null);

  // Scroll to bottom whenever messages load
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, isDictating]);

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isDictating) return;

    const userMessage = {
      id: `msg-${Date.now()}`,
      sender: 'YOU',
      text: inputText,
      timestamp: new Date().toISOString()
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputText('');
    setIsTyping(true);

    try {
      const response = await api.sendChatMessage('ai-simulation-assistant', updatedMessages);
      const agentResponse = {
        id: `reply-${Date.now()}`,
        sender: response.sender,
        text: response.text,
        timestamp: response.timestamp
      };

      setMessages([...updatedMessages, agentResponse]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsTyping(false);
    }
  };

  const startVoiceDictation = () => {
    if (isDictating || isTyping) return;
    setIsDictating(true);
    setInputText("Listening...");
    
    const mockDictations = [
      "How will the Competitor Price Cut affect our Net Profit next month?",
      "Can you analyze our customer retention risk under credit inflation?",
      "What is our estimated sales drop if supplier costs increase by 15%?",
      "Should we match rival shop discounts to increase market share?"
    ];

    setTimeout(() => {
      const randomText = mockDictations[Math.floor(Math.random() * mockDictations.length)];
      setInputText(randomText);
      setIsDictating(false);
    }, 1800);
  };

  return (
    <div style={{
      width: '380px', height: '100%', borderLeft: '1px solid var(--border-default)',
      background: 'var(--surface-card)', display: 'flex', flexDirection: 'column',
      boxShadow: '-4px 0 16px rgba(0,0,0,0.02)'
    }}>
      {/* Header */}
      <div className="flex justify-between items-center" style={{
        padding: '16px 20px', borderBottom: '1px solid var(--border-light)'
      }}>
        <div>
          <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
            AI Simulation Assistant
          </h2>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            padding: '4px', borderRadius: '4px', color: 'var(--text-tertiary)'
          }}
        >
          <X size={18} />
        </button>
      </div>

      {/* Chat Messages Log */}
      <div className="scrollable" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {messages.map(msg => {
          const isUser = msg.sender === 'YOU';
          return (
            <div
              key={msg.id}
              style={{
                alignSelf: isUser ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                background: isUser ? 'var(--surface-active)' : 'var(--surface-panel)',
                borderRadius: '6px', padding: '12px 16px',
                border: '1px solid var(--border-light)'
              }}
            >
              <div className="mono" style={{ fontSize: '9px', fontWeight: 600, color: isUser ? 'var(--text-secondary)' : 'var(--accent)', marginBottom: '6px' }}>
                {msg.sender.toUpperCase()} {msg.role ? `· ${msg.role}` : ''}
              </div>
              <p style={{ fontSize: '12.5px', color: 'var(--text-primary)', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                {msg.text}
              </p>
            </div>
          );
        })}

        {isTyping && (
          <div style={{
            alignSelf: 'flex-start', background: 'var(--surface-panel)',
            borderRadius: '6px', padding: '10px 12px', border: '1px solid var(--border-light)'
          }}>
            <div className="flex gap-1 items-center" style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
              <User size={12} />
              <span>Assistant typing</span>
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </div>
          </div>
        )}
        <div ref={chatBottomRef} />
      </div>

      {/* Message Input Box */}
      <form onSubmit={handleSendMessage} className="flex gap-2 items-center" style={{
        padding: '16px 20px', borderTop: '1px solid var(--border-light)',
        background: 'var(--surface-card)'
      }}>
        <input
          type="text"
          placeholder={isDictating ? "Speak now..." : "Ask AI Simulation Assistant..."}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={isTyping || isDictating}
          style={{
            flex: 1, height: '36px', border: '1px solid var(--border-default)',
            borderRadius: '6px', padding: '0 12px', fontSize: '13px', outline: 'none',
            background: (isTyping || isDictating) ? 'var(--surface-panel)' : 'var(--surface-page)'
          }}
        />

        {/* Voice Input Button */}
        <button
          type="button"
          onClick={startVoiceDictation}
          disabled={isTyping || isDictating}
          className={isDictating ? "animate-pulse" : ""}
          style={{
            width: '36px', height: '36px', 
            background: isDictating ? 'var(--accent)' : 'var(--surface-active)',
            color: isDictating ? '#fff' : 'var(--text-secondary)', 
            border: '1px solid var(--border-light)', 
            borderRadius: '6px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: (isTyping || isDictating) ? 'not-allowed' : 'pointer'
          }}
          title="Dictate message"
        >
          <Mic size={15} />
        </button>

        <button
          type="submit"
          disabled={!inputText.trim() || isTyping || isDictating || inputText === "Listening..."}
          style={{
            width: '36px', height: '36px', background: 'var(--text-primary)',
            color: 'var(--text-inverse)', border: 'none', borderRadius: '6px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: (inputText.trim() && !isTyping && !isDictating && inputText !== "Listening...") ? 'pointer' : 'not-allowed',
            opacity: (inputText.trim() && !isTyping && !isDictating && inputText !== "Listening...") ? 1 : 0.5
          }}
        >
          <Send size={14} />
        </button>
      </form>
    </div>
  );
}
