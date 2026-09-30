import React, { useState, useRef, useEffect } from 'react';
import Hero from './components/Hero';
import ChatSection from './components/ChatSection';
import ThemeSelector from './components/ThemeSelector';
import { windowRegistry } from './components/portfolio-windows';
import { portfolioData } from './data/portfolioData';

/**
 * Main Application Component
 * 
 * Features:
 * - 3 Selectable Themes (Midnight, Graphite, Aurora) persisted via localStorage
 * - Conversational AI interface for dynamic navigation
 * - Grounded strictly in Mohammed Salim Usman Khan's latest resume
 */
export default function App() {
  // Theme state with localStorage persistence
  const [theme, setTheme] = useState(() => {
    try {
      const savedTheme = localStorage.getItem('portfolio-theme');
      if (savedTheme && ['midnight', 'graphite', 'aurora'].includes(savedTheme)) {
        return savedTheme;
      }
    } catch (e) {
      // localStorage may fail in restricted sandboxes
    }
    return 'midnight';
  });

  // Apply theme to document root and persist in localStorage
  useEffect(() => {
    try {
      localStorage.setItem('portfolio-theme', theme);
    } catch (e) {
      // Fallback
    }
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Current active portfolio window ('PROJECTS' | 'PROJECT_DETAIL' | 'EDUCATION' | 'SKILLS' | etc., or null)
  const [activeWindow, setActiveWindow] = useState(null);

  // Selected project when activeWindow === 'PROJECT_DETAIL'
  const [selectedProject, setSelectedProject] = useState(null);

  // Reference for the generated dynamic portfolio window container to support smooth auto-scroll
  const windowContainerRef = useRef(null);

  // Conversation history
  const [messages, setMessages] = useState([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: "Hi! I'm Salim's portfolio AI. Ask me anything about his projects (Mini ERP CRM, FocusFlow, WishCraft), education, technical skills, or resume."
    }
  ]);

  const [isThinking, setIsThinking] = useState(false);

  /**
   * Component Registry Lookup
   */
  const ActiveWindowComponent = activeWindow ? windowRegistry[activeWindow] : null;

  /**
   * Automatically scroll down to the generated window after it renders.
   */
  useEffect(() => {
    if (activeWindow && windowContainerRef.current) {
      const scrollTimer = setTimeout(() => {
        windowContainerRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }, 80);

      return () => clearTimeout(scrollTimer);
    }
  }, [activeWindow, selectedProject]);

  /**
   * Intent detector for user questions strictly grounded in the resume
   */
  const parseQueryIntent = (query) => {
    const q = query.toLowerCase();

    // Specific Project Details
    if (q.includes('focusflow') || q.includes('focus flow') || q.includes('productivity')) {
      const proj = portfolioData.projects.find((p) => p.slug === 'focusflow');
      return {
        type: 'PROJECT_DETAIL',
        project: proj,
        message: "Here is the detailed architecture and implementation of FocusFlow."
      };
    }

    if (q.includes('mini erp') || q.includes('erp') || q.includes('crm')) {
      const proj = portfolioData.projects.find((p) => p.slug === 'mini-erp');
      return {
        type: 'PROJECT_DETAIL',
        project: proj,
        message: "Here is the detailed architecture and implementation of the Mini ERP CRM system."
      };
    }

    if (q.includes('wishcraft') || q.includes('wish craft') || q.includes('birthday')) {
      const proj = portfolioData.projects.find((p) => p.slug === 'wishcraft');
      return {
        type: 'PROJECT_DETAIL',
        project: proj,
        message: "Here is the detailed overview of the WishCraft Birthday Page Generator."
      };
    }

    // All Projects
    if (q.includes('project') || q.includes('build') || q.includes('work') || q.includes('app')) {
      return {
        type: 'PROJECTS',
        project: null,
        message: "Here are the featured software projects engineered by Salim from his latest resume."
      };
    }

    // Education
    if (
      q.includes('education') ||
      q.includes('college') ||
      q.includes('degree') ||
      q.includes('study') ||
      q.includes('university') ||
      q.includes('cgpa') ||
      q.includes('school') ||
      q.includes('class xii') ||
      q.includes('class x')
    ) {
      return {
        type: 'EDUCATION',
        project: null,
        message: "Here is Salim's complete educational background from his resume."
      };
    }

    // Skills & Coding Profiles
    if (
      q.includes('skill') ||
      q.includes('tech') ||
      q.includes('stack') ||
      q.includes('language') ||
      q.includes('tool') ||
      q.includes('framework') ||
      q.includes('database') ||
      q.includes('leetcode') ||
      q.includes('certification')
    ) {
      return {
        type: 'SKILLS',
        project: null,
        message: "Here are Salim's technical skills, core CS foundations, coding profiles, and certifications."
      };
    }

    // Resume
    if (q.includes('resume') || q.includes('cv')) {
      return {
        type: 'RESUME',
        project: null,
        message: "Here is Salim's resume overview with direct PDF viewing and download options."
      };
    }

    // Contact
    if (q.includes('contact') || q.includes('reach') || q.includes('email') || q.includes('phone') || q.includes('hire')) {
      return {
        type: 'CONTACT',
        project: null,
        message: "Here is Salim's official contact information."
      };
    }

    // About / Bio
    if (q.includes('about') || q.includes('who is') || q.includes('summary') || q.includes('salim')) {
      return {
        type: 'ABOUT',
        project: null,
        message: "Here is Mohammed Salim Usman Khan's professional background and summary."
      };
    }

    // Default fallback
    return {
      type: 'ABOUT',
      project: null,
      message: "Here is information about Salim. You can also explore his projects, education, technical skills, or resume!"
    };
  };

  /**
   * Handles user submission from either the text input or suggestion chips.
   */
  const handleSendMessage = (userQuestion) => {
    // 1. Append user's question
    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: userQuestion
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsThinking(true);

    // 2. Simulated intent resolution
    setTimeout(() => {
      const { type, project, message } = parseQueryIntent(userQuestion);

      const botMsg = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: message
      };

      setMessages((prev) => [...prev, botMsg]);
      setSelectedProject(project);
      setActiveWindow(type);
      setIsThinking(false);
    }, 250);
  };

  // Helper to resolve currently selected project object for detail window
  const activeProjectData =
    typeof selectedProject === 'object' && selectedProject !== null
      ? selectedProject
      : portfolioData.projects.find((p) => p.slug === selectedProject || p.id === selectedProject) ||
        portfolioData.projects[0];

  return (
    <div className="app-container" data-theme={theme}>
      {/* Top navigation status bar with Theme Selector */}
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

        {/* Compact Theme Selector at top right */}
        <ThemeSelector currentTheme={theme} onSelectTheme={setTheme} />
      </header>

      {/* Main page content: Hero -> Chat -> Generated Window */}
      <main className="main-content">
        {/* 1. Hero Section */}
        <Hero />

        {/* 2. Conversational Chat Section */}
        <ChatSection
          messages={messages}
          onSendMessage={handleSendMessage}
          isThinking={isThinking}
        />

        {/* 3. Generated Window System (Renders directly BELOW Chat) */}
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
                const proj = portfolioData.projects.find((p) => p.slug === slug || p.id === slug);
                setSelectedProject(proj || slug);
                setActiveWindow('PROJECT_DETAIL');
              }}
              project={activeProjectData}
              onBackToProjects={() => setActiveWindow('PROJECTS')}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="portfolio-footer">
        <p>© {new Date().getFullYear()} Mohammed Salim Usman Khan • Source of truth: Latest Resume</p>
      </footer>
    </div>
  );
}
