
import React, { useState, useRef, useEffect } from 'react';
import Hero from './components/Hero';
import ChatSection from './components/ChatSection';
import ThemeSelector from './components/ThemeSelector';
import { windowRegistry } from './components/portfolio-windows';
import { portfolioData } from './data/portfolioData';

// Local backend URL. This can be overridden using a Vite environment variable.
const API_URL =
  import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export default function App() {
  // Theme state with localStorage persistence
  const [theme, setTheme] = useState(() => {
    try {
      const savedTheme = localStorage.getItem('portfolio-theme');

      if (
        savedTheme &&
        ['midnight', 'graphite', 'aurora'].includes(savedTheme)
      ) {
        return savedTheme;
      }
    } catch (e) {
      // localStorage may be unavailable in restricted environments
    }

    return 'midnight';
  });

  useEffect(() => {
    try {
      localStorage.setItem('portfolio-theme', theme);
    } catch (e) {
      // Continue even if localStorage is unavailable
    }

    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Active portfolio window and selected project
  const [activeWindow, setActiveWindow] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);

  const windowContainerRef = useRef(null);

  // Conversation history
  const [messages, setMessages] = useState([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: "Hi! I'm Salim's portfolio AI. Ask me anything about his projects (Mini ERP CRM, FocusFlow, WishCraft), education, technical skills, or resume.",
    },
  ]);

  const [isThinking, setIsThinking] = useState(false);

  // Find the component registered for the active window
  const ActiveWindowComponent = activeWindow
    ? windowRegistry[activeWindow]
    : null;

  // Scroll to the portfolio window after it renders
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
   * Send the visitor's question to FastAPI.
   * Groq generates the answer and decides which portfolio window to open.
   */
  const handleSendMessage = async (userQuestion) => {
    const question =
      typeof userQuestion === 'string' ? userQuestion.trim() : '';

    if (!question || isThinking) {
      return;
    }

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: question,
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsThinking(true);

    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: question,
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
          // Keep the default error message
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();

      // Add the actual AI-generated answer to the conversation
      const botMsg = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text:
          typeof data.answer === 'string' && data.answer.trim()
            ? data.answer
            : "I couldn't generate a response. Please try again.",
      };

      setMessages((prev) => [...prev, botMsg]);

      // Validate the returned window type against the component registry
      const requestedType =
        typeof data.type === 'string' &&
        Object.prototype.hasOwnProperty.call(windowRegistry, data.type)
          ? data.type
          : null;

      // Resolve the AI's project slug to the existing project data object
      let project = null;

      if (requestedType === 'PROJECT_DETAIL') {
        project = portfolioData.projects.find(
          (p) => p.slug === data.project || p.id === data.project
        );

        // If the AI returned an unknown project, show the projects list
        if (!project) {
          setActiveWindow('PROJECTS');
          setSelectedProject(null);
          return;
        }
      }

      setSelectedProject(project);
      setActiveWindow(requestedType);
    } catch (error) {
      console.error('Portfolio chat error:', error);

      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-error-${Date.now()}`,
          sender: 'assistant',
          text: 'Sorry, I could not connect to the AI service. Please check that the backend is running and try again.',
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  // Resolve the selected project object for the project detail window
  const activeProjectData =
    typeof selectedProject === 'object' && selectedProject !== null
      ? selectedProject
      : portfolioData.projects.find(
          (p) =>
            p.slug === selectedProject || p.id === selectedProject
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
                  (p) => p.slug === slug || p.id === slug
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
