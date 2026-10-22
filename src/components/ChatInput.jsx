
import React, { useState } from 'react';
import { ArrowUp, LoaderCircle } from 'lucide-react';

export default function ChatInput({ onSubmit, disabled = false }) {
  const [inputText, setInputText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    const trimmed = inputText.trim();

    if (!trimmed || disabled) return;

    onSubmit(trimmed);
    setInputText('');
  };

  return (
    <form
      className="chat-input-form"
      onSubmit={handleSubmit}
      aria-label="Ask the portfolio assistant"
    >
      <label className="chat-input-label" htmlFor="portfolio-chat-input">
        Message
      </label>

      <input
        id="portfolio-chat-input"
        type="text"
        className="chat-input-field"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder="Ask about projects, skills, or experience..."
        disabled={disabled}
        aria-label="Ask a question about Salim"
        autoComplete="off"
      />

      <button
        type="submit"
        className="chat-submit-btn"
        disabled={disabled || !inputText.trim()}
        title={disabled ? 'Assistant is thinking' : 'Send message'}
        aria-label={disabled ? 'Assistant is thinking' : 'Send message'}
      >
        {disabled ? (
          <LoaderCircle
            size={17}
            strokeWidth={2}
            className="chat-submit-loading"
            aria-hidden="true"
          />
        ) : (
          <ArrowUp
            size={17}
            strokeWidth={2.2}
            aria-hidden="true"
          />
        )}
      </button>
    </form>
  );
}
