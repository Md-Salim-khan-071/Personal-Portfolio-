import React, { useState, useRef, useEffect } from 'react';
import { Palette, Check } from 'lucide-react';

export const THEMES = [
  {
    id: 'midnight',
    name: 'Midnight',
    description: 'Clean • Technical • Professional',
    accentColor: '#38bdf8'
  },
  {
    id: 'graphite',
    name: 'Graphite',
    description: 'Minimal • Elegant • Serious',
    accentColor: '#e4e4e7'
  },
  {
    id: 'aurora',
    name: 'Aurora',
    description: 'Modern • Creative • AI-oriented',
    accentColor: '#c084fc'
  }
];

/**
 * ThemeSelector Component
 * 
 * Compact, modern dropdown positioned at the top-right allowing visitors
 * to choose between Midnight, Graphite, and Aurora.
 */
export default function ThemeSelector({ currentTheme, onSelectTheme }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const activeThemeObj = THEMES.find((t) => t.id === currentTheme) || THEMES[0];

  return (
    <div className="theme-selector-container" ref={dropdownRef}>
      <button
        type="button"
        className={`theme-toggle-btn ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle theme selector"
        aria-expanded={isOpen}
      >
        <span
          className="theme-color-pip"
          style={{ backgroundColor: activeThemeObj.accentColor }}
        />
        <span className="theme-btn-label">{activeThemeObj.name}</span>
        <Palette size={14} className="theme-btn-icon" />
      </button>

      {isOpen && (
        <div className="theme-dropdown-menu" role="menu" aria-label="Theme choices">
          <div className="theme-dropdown-header">Choose Theme</div>

          <div className="theme-options-list">
            {THEMES.map((theme) => {
              const isSelected = currentTheme === theme.id;
              return (
                <button
                  key={theme.id}
                  type="button"
                  className={`theme-option-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => {
                    onSelectTheme(theme.id);
                    setIsOpen(false);
                  }}
                  role="menuitem"
                >
                  <div className="theme-option-left">
                    <span
                      className="theme-swatch"
                      style={{ backgroundColor: theme.accentColor }}
                    />
                    <div className="theme-option-texts">
                      <span className="theme-option-name">{theme.name}</span>
                      <span className="theme-option-desc">{theme.description}</span>
                    </div>
                  </div>

                  {isSelected && <Check size={14} className="theme-check-icon" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
