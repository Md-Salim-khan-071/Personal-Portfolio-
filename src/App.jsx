
import React, { useState, useRef, useEffect } from 'react';
import Hero from './components/Hero';
import ChatSection from './components/ChatSection';
import ThemeSelector from './components/ThemeSelector';
import { windowRegistry } from './components/portfolio-windows';
import { portfolioData } from './data/portfolioData';

// Load either supported image filename from src/.
const portfolioImages = import.meta.glob('./portfolio_image.{jpg,png}', {
  eager: true,
  query: '?url',
  import: 'default',
});

const portfolioImage =
  portfolioImages['./portfolio_image.jpg'] ||
  portfolioImages['./portfolio_image.png'];

// Backend URL. VITE_API_URL can override this in your environment.
const API_URL = (
  import.meta.env.VITE_API_URL ||
  'https://personal-portfolio-k2d9.onrender.com'
).replace(/\/+$/, '');

const MAX_HISTORY_MESSAGES = 8;

export default function App() {
  const [theme, setTheme] = useState(() => {
    try {
      const savedTheme = localStorage.getItem('portfolio-theme');

      if (savedTheme && ['midnight', 'graphite', 'aurora'].includes(savedTheme)) {
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

  const [activeWindow, setActiveWindow] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);

  const heroChatRef = useRef(null);
  const windowContainerRef = useRef(null);

  const [messages, setMessages] = useState([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: "Hi! I'm Salim's portfolio AI. Ask me about his projects, education, technical skills, experience, or resume.",
    },
  ]);

  const [isThinking, setIsThinking] = useState(false);

  const ActiveWindowComponent = activeWindow
    ? windowRegistry[activeWindow]
    : null;

  useEffect(() => {
    if (!activeWindow || !windowContainerRef.current) return;

    const scrollTimer = setTimeout(() => {
      windowContainerRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 100);

    return () => clearTimeout(scrollTimer);
  }, [activeWindow, selectedProject]);

  const handleSendMessage = async (userQuestion) => {
    const question =
      typeof userQuestion === 'string' ? userQuestion.trim() : '';

    if (!question || isThinking) return;

    const history = messages
      .filter(
        (message) =>
          message.id !== 'welcome-1' &&
          (message.sender === 'user' || message.sender === 'assistant') &&
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
          if (errorData.detail) errorMessage = errorData.detail;
        } catch {
          // Keep the default error message.
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();

      setMessages((previous) => [
        ...previous,
        {
          id: `assistant-${Date.now()}`,
          sender: 'assistant',
          text:
            typeof data.answer === 'string' && data.answer.trim()
              ? data.answer
              : "I couldn't generate a response. Please try again.",
        },
      ]);

      const requestedType =
        typeof data.type === 'string' &&
        Object.prototype.hasOwnProperty.call(windowRegistry, data.type)
          ? data.type
          : null;

      // Conversational answers stay in the chat.
      if (!requestedType) return;

      let project = null;

      if (requestedType === 'PROJECT_DETAIL') {
        project = portfolioData.projects.find(
          (item) => item.slug === data.project || item.id === data.project
        );

        if (!project) {
          setSelectedProject(null);
          setActiveWindow('PROJECTS');
          return;
        }
      }

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
            error instanceof Error && error.message !== 'Failed to fetch'
              ? error.message
              : 'Sorry, I could not connect to the AI service. Please check the connection and try again.',
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  const activeProjectData =
    typeof selectedProject === 'object' && selectedProject !== null
      ? selectedProject
      : portfolioData.projects.find(
          (item) =>
            item.slug === selectedProject || item.id === selectedProject
        ) || portfolioData.projects[0];

  const handleCloseWindow = () => {
    setActiveWindow(null);
    setSelectedProject(null);

    requestAnimationFrame(() => {
      heroChatRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    });
  };

  const handleSelectProject = (slug) => {
    const project = portfolioData.projects.find(
      (item) => item.slug === slug || item.id === slug
    );

    if (!project) return;

    setSelectedProject(project);
    setActiveWindow('PROJECT_DETAIL');
  };

  const handleBackToProjects = () => {
    setSelectedProject(null);
    setActiveWindow('PROJECTS');
  };

  return (
    <div
      className="app-container"
      data-theme={theme}
      style={{
        '--portfolio-image': portfolioImage
          ? `url("${portfolioImage}")`
          : 'none',
      }}
    >
      <div className="portfolio-controls">
        <ThemeSelector
          currentTheme={theme}
          onSelectTheme={setTheme}
        />
      </div>

      <main className="main-content">
        <div className="hero-chat-layout" ref={heroChatRef}>
          <Hero />

          <ChatSection
            messages={messages}
            onSendMessage={handleSendMessage}
            isThinking={isThinking}
          />
        </div>

        {ActiveWindowComponent && (
          <div
            key={`${activeWindow}-${activeProjectData?.slug || ''}`}
            ref={windowContainerRef}
            className="dynamic-window-container"
          >
            <ActiveWindowComponent
              onClose={handleCloseWindow}
              onSelectProject={handleSelectProject}
              project={activeProjectData}
              onBackToProjects={handleBackToProjects}
            />
          </div>
        )}
      </main>
    </div>
  );
}
