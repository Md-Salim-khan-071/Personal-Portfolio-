import React from 'react';
import { MessageSquare, Sparkles, Bot } from 'lucide-react';
import ChatInput from './ChatInput';

/**
 * Predefined suggested questions for quick exploration.
 */
const SUGGESTED_QUESTIONS = [
  'What are his projects?',
  'What is his educational background?',
  'What skills does he have?',
  'What is he currently learning?',
  'Tell me about his experience.',
  'Show me his resume.'
];

/**
 * ChatSection Component
 * 
 * Houses the conversational interface:
 * 1. Status header
 * 2. Message history stream
 * 3. Primary search/question input
 * 4. Suggested question chips
 */
export default function ChatSection({
  messages = [],
  onSendMessage,
  isThinking = false
}) {
  return (
    <section className="chat-section" aria-label="Interactive AI Portfolio Chatbot">
      {/* Header */}
      <div className="chat-header">
        <div className="chat-header-title">
          <div className="chat-bot-icon">
            <Sparkles size={16} />
          </div>
          <div>
            <h3>AI Portfolio Assistant</h3>
            <p className="chat-header-subtitle">Ask questions to dynamically navigate Salim's work</p>
          </div>
        </div>
        <span className="chat-live-badge">Active</span>
      </div>

      {/* Conversation Stream */}
      {messages.length > 0 && (
        <div className="chat-messages" role="log" aria-live="polite">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`message-bubble ${msg.sender}`}
            >
              <div className="message-sender">
                {msg.sender === 'user' ? 'You' : 'Salim AI'}
              </div>
              <div className="message-text">{msg.text}</div>
            </div>
          ))}

          {isThinking && (
            <div className="message-bubble assistant thinking">
              <div className="message-sender">Salim AI</div>
              <div className="message-text">Analyzing query and loading window...</div>
            </div>
          )}
        </div>
      )}

      {/* Primary Input */}
      <div className="chat-input-wrapper">
        <ChatInput onSubmit={onSendMessage} disabled={isThinking} />
      </div>

      {/* Suggested Questions */}
      <div className="suggestions-container">
        <span className="suggestions-label">Suggested Queries</span>
        <div className="suggestions-grid">
          {SUGGESTED_QUESTIONS.map((question, index) => (
            <button
              key={index}
              type="button"
              className="suggestion-chip"
              onClick={() => onSendMessage(question)}
            >
              {question}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
