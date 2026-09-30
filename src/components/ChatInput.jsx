import React, { useState } from 'react';
import { ArrowUp } from 'lucide-react';

/**
 * ChatInput Component
 * 
 * Primary input bar for asking questions to navigate the portfolio.
 */
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
    <form className="chat-input-form" onSubmit={handleSubmit}>
      <input
        type="text"
        className="chat-input-field"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder="Ask something about me (e.g., 'What are his projects?')..."
        disabled={disabled}
        aria-label="Ask a question about Salim"
      />

      <button
        type="submit"
        className="chat-submit-btn"
        disabled={disabled || !inputText.trim()}
        title="Submit query"
        aria-label="Submit query"
      >
        <ArrowUp size={16} strokeWidth={2.5} />
      </button>
    </form>
  );
}
