
import React, { useState, useRef, useEffect } from 'react';
import Hero from './components/Hero';
import ChatSection from './components/ChatSection';
import ThemeSelector from './components/ThemeSelector';
import { windowRegistry } from './components/portfolio-windows';
import { portfolioData } from './data/portfolioData';

// Local backend URL. Override with VITE_API_URL when needed.
const API_URL =
  import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

// Number of previous conversation messages sent to the backend.
const MAX_HISTORY_MESSAGES = 8;

export default function App() {
  // Theme state with localStorage persistence.
  const [theme, setTheme] = useState(() => {
    try {
      const savedTheme = localStorage.getItem('portfolio-theme');

      if (
        savedTheme &&
        ['midnight', 'graphite', 'aurora'].includes(savedTheme)
      ) {
        return savedTheme;
      }
    } catch {
      // localStorage may be unavailable.
    }

    return 'midnight';
  });

  useEffect(() => {
    try {
      localStorage.setItem('portfolio-theme', theme);
    } catch {
      // Continue if localStorage is unavailable.
    }

    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Active portfolio window and selected project.
  const [activeWindow, setActiveWindow] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);

  const windowContainerRef = useRef(null);

  // Conversation history shown in the chat UI.
  const [messages, setMessages] = useState([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: "Hi! I'm Salim's portfolio AI. Ask me anything about his projects (Mini ERP CRM, FocusFlow, WishCraft), education, technical skills, or resume.",
    },
  ]);

  const [isThinking, setIsThinking] = useState(false);

  // Resolve the active portfolio window component.
  const ActiveWindowComponent = activeWindow
    ? windowRegistry[activeWindow]
    : null;

  // Scroll to the portfolio window after it renders.
  useEffect(() => {
    if (activeWindow && windowContainerRef.current) {
      const scrollTimer = setTimeout(() => {
        windowContainerRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 80);

      return () => clearTimeout(scrollTimer);
    }
  }, [activeWindow, selectedProject]);

  /**
   * Send a question and recent conversation history to FastAPI.
   */
  const handleSendMessage = async (userQuestion) => {
    const question =
      typeof userQuestion === 'string' ? userQuestion.trim() : '';

    if (!question || isThinking) {
      return;
    }

    // Capture the previous messages before adding the new question.
    // This avoids including the current question twice in the request.
    const history = messages
      .filter(
        (message) =>
          message.id !== 'welcome-1' &&
          (message.sender === 'user' ||
            message.sender === 'assistant') &&
          typeof message.text === 'string' &&
          message.text.trim()
      )
      .slice(-MAX_HISTORY_MESSAGES)
      .map((message) => ({
        role: message.sender,
        content: message.text.trim(),
      }));

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: question,
    };

    setMessages((previous) => [...previous, userMsg]);
    setIsThinking(true);

    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: question,
          history,
        }),
      });

      if (!response.ok) {
        let errorMessage = 'The AI service could not process your request.';

        try {
          const errorData = await response.json();

          if (errorData.detail) {
            errorMessage = errorData.detail;
          }
        } catch {
          // Keep the default error message.
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();

      // Add the AI-generated answer to the conversation.
      const botMsg = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text:
          typeof data.answer === 'string' && data.answer.trim()
            ? data.answer
            : "I couldn't generate a response. Please try again.",
      };

      setMessages((previous) => [...previous, botMsg]);

      // Validate the requested window against the actual registry.
      const requestedType =
        typeof data.type === 'string' &&
        Object.prototype.hasOwnProperty.call(
          windowRegistry,
          data.type
        )
          ? data.type
          : null;

      /*
       * IMPORTANT:
       * A null or invalid type means the AI is answering
       * conversationally. Keep the current window open.
       */
      if (!requestedType) {
        return;
      }

      // Resolve a project slug for project-detail navigation.
      let project = null;

      if (requestedType === 'PROJECT_DETAIL') {
        project = portfolioData.projects.find(
          (item) =>
            item.slug === data.project ||
            item.id === data.project
        );

        // Fall back to the projects list for an invalid slug.
        if (!project) {
          setSelectedProject(null);
          setActiveWindow('PROJECTS');
          return;
        }
      }

      // Change the window only when a valid type was requested.
      setSelectedProject(project);
      setActiveWindow(requestedType);
    } catch (error) {
      console.error('Portfolio chat error:', error);

      setMessages((previous) => [
        ...previous,
        {
          id: `assistant-error-${Date.now()}`,
          sender: 'assistant',
          text:
            error instanceof Error &&
            error.message !== 'Failed to fetch'
              ? error.message
              : 'Sorry, I could not connect to the AI service. Please check that the backend is running and try again.',
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  // Resolve the selected project for the project-detail window.
  const activeProjectData =
    typeof selectedProject === 'object' && selectedProject !== null
      ? selectedProject
      : portfolioData.projects.find(
          (item) =>
            item.slug === selectedProject ||
            item.id === selectedProject
        ) || portfolioData.projects[0];

  return (
    <div className="app-container" data-theme={theme}>
      {/* Top navigation */}
      <header className="top-nav">
        <div className="top-nav-left">
          <div className="brand-badge">
            <span className="brand-dot"></span>
            <span>salim.dev</span>
          </div>

          <div className="status-indicator">
            <span className="status-dot"></span>
            <span>Open to opportunities</span>
          </div>
        </div>

        <ThemeSelector
          currentTheme={theme}
          onSelectTheme={setTheme}
        />
      </header>

      {/* Hero, chat, and dynamic portfolio window */}
      <main className="main-content">
        <Hero />

        <ChatSection
          messages={messages}
          onSendMessage={handleSendMessage}
          isThinking={isThinking}
        />

        {ActiveWindowComponent && (
          <div
            key={activeWindow + (selectedProject?.slug || '')}
            ref={windowContainerRef}
            className="dynamic-window-container"
          >
            <ActiveWindowComponent
              onClose={() => {
                setActiveWindow(null);
                setSelectedProject(null);
              }}
              onSelectProject={(slug) => {
                const project = portfolioData.projects.find(
                  (item) =>
                    item.slug === slug || item.id === slug
                );

                if (project) {
                  setSelectedProject(project);
                  setActiveWindow('PROJECT_DETAIL');
                }
              }}
              project={activeProjectData}
              onBackToProjects={() => {
                setSelectedProject(null);
                setActiveWindow('PROJECTS');
              }}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="portfolio-footer">
        <p>
          © {new Date().getFullYear()} Mohammed Salim Usman Khan
          {' • '}Source of truth: Latest Resume
        </p>
      </footer>
    </div>
  );
}
