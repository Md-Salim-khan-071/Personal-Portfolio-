
import React from 'react';
import { Github, Linkedin, FileText, Code2, ArrowDownRight } from 'lucide-react';
import { portfolioData } from '../data/portfolioData';

export default function Hero() {
  const { profile } = portfolioData;

  return (
    <section className="hero-section" aria-label="Introduction">
      <div className="hero-avatar-wrapper">
        <div
          className="hero-avatar"
          role="img"
          aria-label="Initials SK"
        >
          <span>SK</span>
        </div>
      </div>

      <div className="hero-intro-label">
        <span className="hero-status-dot" aria-hidden="true" />
        <span>COMPUTER SCIENCE ENGINEER</span>
      </div>

      <h1 className="hero-title">
        Hi, I'm <span className="hero-title-accent">Mohammed Salim</span>.
      </h1>

      <div className="hero-roles-wrap">
        <span className="hero-role-primary">Full-Stack Developer</span>
        <span className="hero-role-divider" aria-hidden="true">/</span>
        <span className="hero-role-secondary">AI Enthusiast</span>
      </div>

      <p className="hero-description">
        I build practical software solutions, explore backend architecture,
        and develop AI-powered applications. Explore my work, or ask my
        portfolio assistant about my projects, skills, and experience.
      </p>

      <nav className="hero-actions" aria-label="Professional profiles and resume">
        <a
          href={profile.github}
          target="_blank"
          rel="noopener noreferrer"
          className="action-btn"
          title="Visit GitHub profile"
          aria-label="GitHub profile (opens in a new tab)"
        >
          <Github size={16} aria-hidden="true" />
          <span>GitHub</span>
        </a>

        <a
          href={profile.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="action-btn"
          title="Visit LinkedIn profile"
          aria-label="LinkedIn profile (opens in a new tab)"
        >
          <Linkedin size={16} aria-hidden="true" />
          <span>LinkedIn</span>
        </a>

        <a
          href={profile.leetcode}
          target="_blank"
          rel="noopener noreferrer"
          className="action-btn"
          title="Visit LeetCode profile"
          aria-label="LeetCode profile (opens in a new tab)"
        >
          <Code2 size={16} aria-hidden="true" />
          <span>LeetCode</span>
        </a>

        <a
          href={profile.resumeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="action-btn primary"
          title="View resume PDF"
          aria-label="View resume (opens in a new tab)"
        >
          <FileText size={16} aria-hidden="true" />
          <span>Resume</span>
          <ArrowDownRight size={14} aria-hidden="true" />
        </a>
      </nav>
    </section>
  );
}
