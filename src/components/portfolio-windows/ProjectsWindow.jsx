import React from 'react';
import { X, ExternalLink, Github, FolderGit2, Info } from 'lucide-react';
import { portfolioData } from '../../data/portfolioData';

/**
 * ProjectsWindow Component
 * 
 * Renders all projects from Salim's latest resume as reusable, modern cards.
 * Each card features independent buttons for Live Website and GitHub repository.
 * 
 * Props:
 * - onClose: function to close the window
 * - onSelectProject: function(projectSlug: string) to open specific project detail
 */
export default function ProjectsWindow({ onClose, onSelectProject }) {
  const { projects } = portfolioData;

  return (
    <div className="portfolio-window projects-window" role="region" aria-label="Projects Section">
      {/* Header */}
      <div className="window-header">
        <div className="window-title-badge">
          <FolderGit2 size={16} className="badge-icon" />
          <span>PROJECTS</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="window-close-btn"
          aria-label="Close Projects Window"
          title="Close window"
        >
          <X size={18} />
        </button>
      </div>

      <div className="window-intro">
        <p>Featured projects engineered by Mohammed Salim Usman Khan, sourced from his latest resume:</p>
      </div>

      {/* Projects Grid */}
      <div className="projects-grid">
        {projects.map((proj) => (
          <article key={proj.id} className="project-card">
            <div>
              <div className="project-card-header">
                <span className="project-category">{proj.subtitle}</span>
              </div>

              <h3 className="project-name">{proj.name}</h3>

              {/* Primary highlight summary from resume */}
              <p className="project-desc">{proj.bullets[0]}</p>

              {/* Technologies */}
              <div className="project-tech-tags">
                {proj.technologies.map((tech, i) => (
                  <span key={i} className="tech-tag">
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Differentiated Action Buttons */}
            <div className="project-actions-container">
              <div className="project-links-row">
                {proj.liveUrl && (
                  <a
                    href={proj.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-live-link"
                    title={`Open ${proj.name} live deployment`}
                  >
                    <span>Live Website</span>
                    <ExternalLink size={13} />
                  </a>
                )}

                {proj.githubUrl && (
                  <a
                    href={proj.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-github-link"
                    title={`View ${proj.name} source code on GitHub`}
                  >
                    <Github size={13} />
                    <span>GitHub</span>
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>

              {onSelectProject && (
                <button
                  type="button"
                  onClick={() => onSelectProject(proj.slug)}
                  className="btn-details-link"
                  title={`View detailed architecture of ${proj.name}`}
                >
                  <Info size={13} />
                  <span>View Details</span>
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
