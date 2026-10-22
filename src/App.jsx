
import React, { useState, useRef, useEffect } from 'react';
import Hero from './components/Hero';
import ChatSection from './components/ChatSection';
import ThemeSelector from './components/ThemeSelector';
import { windowRegistry } from './components/portfolio-windows';
import { portfolioData } from './data/portfolioData';

// Backend URL. VITE_API_URL can override this in your environment.
const API_URL = (
  import.meta.env.VITE_API_URL ||
  'https://personal-portfolio-k2d9.onrender.com'
).replace(/\/+$/, '');

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

  // References for scrolling between the assistant and detail content.
  const heroChatRef = useRef(null);
  const windowContainerRef = useRef(null);

  // Conversation history shown in the chat UI.
  const [messages, setMessages] = useState([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text:
        "Hi! I'm Salim's portfolio AI. Ask me about his projects, education, technical skills, experience, or resume.",
    },
  ]);

  const [isThinking, setIsThinking] = useState(false);

  // Resolve the active portfolio window component.
  const ActiveWindowComponent = activeWindow
    ? windowRegistry[activeWindow]
    : null;

  // Automatically scroll to detail content after it renders.
  useEffect(() => {
    if (!activeWindow || !windowContainerRef.current) {
      return;
    }

    const scrollTimer = setTimeout(() => {
      windowContainerRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 100);

    return () => clearTimeout(scrollTimer);
  }, [activeWindow, selectedProject]);

  /**
   * Send a question and recent conversation history to FastAPI.
   * Conversational answers stay in the chat.
   * Valid portfolio window types open their corresponding detail view.
   */
  const handleSendMessage = async (userQuestion) => {
    const question =
      typeof userQuestion === 'string' ? userQuestion.trim() : '';

    if (!question || isThinking) {
      return;
    }

    // Capture previous messages before adding the current question.
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
        let errorMessage =
          'The AI service could not process your request.';

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

      // Add the AI answer to the conversation.
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

      // No valid window type means this is a conversational answer.
      // Keep the answer in the chat without opening another panel.
      if (!requestedType) {
        return;
      }

      // Resolve the project for project-detail navigation.
      let project = null;

      if (requestedType === 'PROJECT_DETAIL') {
        project = portfolioData.projects.find(
          (item) =>
            item.slug === data.project ||
            item.id === data.project
        );

        // If the project identifier is invalid, show the projects list.
        if (!project) {
          setSelectedProject(null);
          setActiveWindow('PROJECTS');
          return;
        }
      }

      // Open the requested portfolio window.
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
              : 'Sorry, I could not connect to the AI service. Please check the connection and try again.',
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  // Resolve the selected project for the detail window.
  const activeProjectData =
    typeof selectedProject === 'object' && selectedProject !== null
      ? selectedProject
      : portfolioData.projects.find(
          (item) =>
            item.slug === selectedProject ||
            item.id === selectedProject
        ) || portfolioData.projects[0];

  // Close detail content and return to the main assistant.
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

  // Navigate from a project list to a specific project.
  const handleSelectProject = (slug) => {
    const project = portfolioData.projects.find(
      (item) => item.slug === slug || item.id === slug
    );

    if (!project) {
      return;
    }

    setSelectedProject(project);
    setActiveWindow('PROJECT_DETAIL');
  };

  // Return from a project detail view to the project list.
  const handleBackToProjects = () => {
    setSelectedProject(null);
    setActiveWindow('PROJECTS');
  };

  return (
    <div className="app-container" data-theme={theme}>
      {/* Discreet theme controls; no navigation bar or footer. */}
      <div className="portfolio-controls">
        <ThemeSelector
          currentTheme={theme}
          onSelectTheme={setTheme}
        />
      </div>

      <main className="main-content">
        {/* Main screen: introduction on the left, assistant on the right. */}
        <div
          className="hero-chat-layout"
          ref={heroChatRef}
        >
          <Hero />

          <ChatSection
            messages={messages}
            onSendMessage={handleSendMessage}
            isThinking={isThinking}
          />
        </div>

        {/* Only render a detail panel when the AI requests a valid window. */}
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
