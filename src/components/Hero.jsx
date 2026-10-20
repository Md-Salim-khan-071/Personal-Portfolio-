import React from 'react';
import { Github, Linkedin, FileText, Code2 } from 'lucide-react';
import { portfolioData } from '../data/portfolioData';

/**
 * Hero Component
 * 
 * Minimal, modern, and uncluttered presentation of Salim.
 */
export default function Hero() {
  const { profile } = portfolioData;

  return (
    <section className="hero-section" aria-label="Introduction">
      {/* Avatar Badge */}
      <div className="hero-avatar-wrapper">
        <div className="hero-avatar" aria-label="Mohammed Salim Usman Khan">
          <span>SK</span>
        </div>
      </div>

      {/* Main Greeting */}
      <h1 className="hero-title">
        Hi, I'm <span className="hero-title-accent"> Mohammed Salim </span>.
      </h1>

      {/* Clean Dual Subtitle */}
      <div className="hero-roles-wrap">
        <span className="hero-role-primary">Computer Science Engineer</span>
        <span className="hero-role-divider">•</span>
        <span className="hero-role-secondary">Developer & AI Enthusiast</span>
      </div>

      {/* Short 1-2 line intro */}
      <p className="hero-description">
        Building practical full-stack systems and exploring backend architecture and AI development.
        Ask my portfolio assistant below to explore my projects, skills, or education.
      </p>

      {/* Social / External Action Buttons */}
      <div className="hero-actions">
        <a
          href={profile.github}
          target="_blank"
          rel="noopener noreferrer"
          className="action-btn"
          title="Visit Salim's GitHub profile"
        >
          <Github size={15} />
          <span>GitHub</span>
        </a>

        <a
          href={profile.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="action-btn"
          title="Visit Salim's LinkedIn profile"
        >
          <Linkedin size={15} />
          <span>LinkedIn</span>
        </a>

        <a
          href={profile.leetcode}
          target="_blank"
          rel="noopener noreferrer"
          className="action-btn"
          title="Visit Salim's LeetCode profile"
        >
          <Code2 size={15} />
          <span>LeetCode</span>
        </a>

        <a
          href={profile.resumeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="action-btn primary"
          title="View Salim's Resume PDF"
        >
          <FileText size={15} />
          <span>Resume</span>
        </a>
      </div>
    </section>
  );
}
