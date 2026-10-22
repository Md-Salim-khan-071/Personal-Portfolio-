import React from 'react';
import { MessageSquare, Sparkles, Bot } from 'lucide-react';
import ChatInput from './ChatInput';

const SUGGESTED_QUESTIONS = [
  'What are his projects?',
  'What is his educational background?',
  'What skills does he have?',
  'What is he currently learning?',
  'Tell me about his experience.',
  'Show me his resume.',
];

export default function ChatSection({
  messages = [],
  onSendMessage,
  isThinking = false,
}) {
  const hasMessages = messages.length > 0;

  return (
    <section
      className="chat-section"
      aria-label="Interactive AI Portfolio Assistant"
    >
      {/* Chat header */}
      <header className="chat-header">
        <div className="chat-header-title">
          <div className="chat-bot-icon" aria-hidden="true">
            <Bot size={18} strokeWidth={1.7} />
          </div>

          <div>
            <h3>Portfolio Assistant</h3>
            <p className="chat-header-subtitle">
              Explore projects, skills, and experience
            </p>
          </div>
        </div>

        <span className="chat-live-badge">
          <span className="chat-status-dot" aria-hidden="true" />
          AI Assistant
        </span>
      </header>

      {/* Conversation messages */}
      {hasMessages && (
        <div
          className="chat-messages"
          role="log"
          aria-label="Conversation"
          aria-live="polite"
          aria-relevant="additions"
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`message-bubble ${msg.sender}`}
            >
              <div className="message-sender">
                {msg.sender === 'user' ? 'You' : 'Portfolio AI'}
              </div>

              <div className="message-text">{msg.text}</div>
            </div>
          ))}

          {/* Thinking indicator */}
          {isThinking && (
            <div
              className="message-bubble assistant thinking"
              role="status"
              aria-label="Assistant is thinking"
            >
              <div className="message-sender">Portfolio AI</div>

              <div className="message-text chat-thinking-content">
                <span
                  className="chat-thinking-dots"
                  aria-hidden="true"
                >
                  <span />
                  <span />
                  <span />
                </span>

                <span>Thinking through your question...</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Chat input */}
      <div className="chat-input-wrapper">
        <ChatInput
          onSubmit={onSendMessage}
          disabled={isThinking}
        />
      </div>

      {/* Suggested questions appear before the conversation starts */}
      {!hasMessages && (
        <div className="suggestions-container">
          <div className="suggestions-heading">
            <Sparkles size={14} aria-hidden="true" />

            <span className="suggestions-label">Try asking</span>
          </div>

          <div className="suggestions-grid">
            {SUGGESTED_QUESTIONS.map((question) => (
              <button
                key={question}
                type="button"
                className="suggestion-chip"
                onClick={() => onSendMessage(question)}
                disabled={isThinking}
              >
                <MessageSquare
                  size={13}
                  aria-hidden="true"
                />

                <span>{question}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}