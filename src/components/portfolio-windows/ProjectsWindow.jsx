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
        {projects.map((proj) => {
          const slug = proj.slug;
          const name = proj.name ?? proj.title ?? 'Untitled Project';
          const description =
            proj.bullets?.[0] ??
            proj.description ??
            proj.features?.[0] ??
            'Project details coming soon.';
          const technologies =
            proj.technologies ?? proj.techStack ?? [];
          const liveUrl = proj.liveUrl ?? proj.live;
          const githubUrl = proj.githubUrl ?? proj.github;

          return (
            <article key={proj.id ?? slug ?? name} className="project-card">
              <div>
                <div className="project-card-header">
                  <span className="project-category">
                    {proj.subtitle ?? 'Featured Project'}
                  </span>
                </div>

                <h3 className="project-name">{name}</h3>
                <p className="project-desc">{description}</p>

                <div className="project-tech-tags">
                  {technologies.map((tech, i) => (
                    <span key={i} className="tech-tag">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div className="project-actions-container">
                <div className="project-links-row">
                  {liveUrl && (
                    <a
                      href={liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-live-link"
                      title={`Open ${name} live deployment`}
                    >
                      <span>Live Website</span>
                      <ExternalLink size={13} />
                    </a>
                  )}

                  {githubUrl && (
                    <a
                      href={githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-github-link"
                      title={`View ${name} source code on GitHub`}
                    >
                      <Github size={13} />
                      <span>GitHub</span>
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>

                {onSelectProject && slug && (
                  <button
                    type="button"
                    onClick={() => onSelectProject(slug)}
                    className="btn-details-link"
                    title={`View detailed architecture of ${name}`}
                  >
                    <Info size={13} />
                    <span>View Details</span>
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>

    </div>
  );
}
