import React from 'react';
import { X, ExternalLink, Github, ArrowLeft, Layers, CheckCircle2 } from 'lucide-react';
import { portfolioData } from '../../data/portfolioData';

/**
 * ProjectDetailWindow Component
 * 
 * Displays deep-dive information for a single project strictly sourced from the resume.
 * 
 * Props:
 * - project: Object | null (optional if selectedProject is passed, otherwise defaults to FocusFlow)
 * - selectedProjectSlug: string (optional)
 * - onClose: function
 * - onBackToProjects: function (optional)
 */
export default function ProjectDetailWindow({
  project,
  selectedProjectSlug,
  onClose,
  onBackToProjects
}) {
  // If project object is not directly passed, look it up by slug or default to first project
  const currentProject =
    project ||
    portfolioData.projects.find(
      (p) =>
        p.slug.toLowerCase() === (selectedProjectSlug || '').toLowerCase() ||
        p.name.toLowerCase() === (selectedProjectSlug || '').toLowerCase()
    ) ||
    portfolioData.projects[1]; // FocusFlow default

  return (
    <div className="portfolio-window project-detail-window" role="region" aria-label={`${currentProject.name} Details`}>
      {/* Header */}
      <div className="window-header">
        <div className="window-header-left">
          {onBackToProjects && (
            <button
              type="button"
              onClick={onBackToProjects}
              className="window-back-btn"
              title="Back to all projects"
              aria-label="Back to all projects"
            >
              <ArrowLeft size={16} />
              <span>All Projects</span>
            </button>
          )}
          <div className="window-title-badge">
            <Layers size={15} className="badge-icon" />
            <span>{currentProject.name.toUpperCase()}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="window-close-btn"
          aria-label="Close Project Detail Window"
          title="Close window"
        >
          <X size={18} />
        </button>
      </div>

      {/* Subtitle & Role */}
      <div className="project-detail-heading">
        <h2 className="project-detail-title">{currentProject.name}</h2>
        <p className="project-detail-subtitle">{currentProject.subtitle}</p>
      </div>

      {/* Technologies Section */}
      <div className="project-detail-section">
        <h4 className="detail-section-label">Technologies Used</h4>
        <div className="tech-tags-list">
          {currentProject.technologies.map((tech, idx) => (
            <span key={idx} className="tech-tag-badge">
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* About & Implementation Details */}
      <div className="project-detail-section">
        <h4 className="detail-section-label">Key Highlights & Architecture</h4>
        <ul className="project-detail-bullets">
          {currentProject.bullets.map((bullet, idx) => (
            <li key={idx} className="detail-bullet-item">
              <CheckCircle2 size={16} className="bullet-icon" />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Action Buttons (Live Website & GitHub) */}
      <div className="project-detail-actions">
        {currentProject.liveUrl && (
          <a
            href={currentProject.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="action-btn-live"
          >
            <span>Live Website</span>
            <ExternalLink size={15} />
          </a>
        )}

        {currentProject.githubUrl && (
          <a
            href={currentProject.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="action-btn-github"
          >
            <Github size={16} />
            <span>GitHub Repository</span>
            <ExternalLink size={14} />
          </a>
        )}
      </div>
    </div>
  );
}
