import React from 'react';
import { X, Wrench, Code2, Database, Globe, Cpu, Terminal, ExternalLink, Award } from 'lucide-react';
import { portfolioData } from '../../data/portfolioData';

/**
 * SkillsWindow Component
 * 
 * Displays the complete technical skills, coding profiles, and certifications
 * strictly matching the latest resume.
 */
export default function SkillsWindow({ onClose }) {
  const { skills, codingProfiles, certifications } = portfolioData;

  const categoryIcons = {
    'Programming Languages': <Code2 size={16} />,
    'Databases': <Database size={16} />,
    'Web Technologies': <Globe size={16} />,
    'Frameworks': <Cpu size={16} />,
    'Tools & Platforms': <Wrench size={16} />,
    'Core CS': <Terminal size={16} />
  };

  return (
    <div className="portfolio-window skills-window" role="region" aria-label="Skills Section">
      {/* Header */}
      <div className="window-header">
        <div className="window-title-badge">
          <Wrench size={16} className="badge-icon" />
          <span>TECHNICAL SKILLS</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="window-close-btn"
          aria-label="Close Skills Window"
          title="Close window"
        >
          <X size={18} />
        </button>
      </div>

      <div className="window-intro">
        <p>Technical competencies strictly extracted from Mohammed Salim Usman Khan's resume:</p>
      </div>

      {/* Skills Grid */}
      <div className="skills-grid">
        {Object.entries(skills).map(([category, items], idx) => (
          <div key={idx} className="skill-category-card">
            <div className="skill-category-header">
              <span className="category-icon">{categoryIcons[category] || <Wrench size={16} />}</span>
              <h4 className="category-title">{category}</h4>
            </div>
            <div className="skill-pills-wrap">
              {items.map((skill, sIdx) => (
                <span key={sIdx} className="skill-pill">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Coding Profiles & Certifications from Resume */}
      <div className="skills-extras-grid">
        {/* Coding Profiles */}
        <div className="skill-extra-card">
          <h4 className="extra-card-title">Coding Profiles</h4>
          <div className="extra-items-list">
            {codingProfiles.map((cp, idx) => (
              <div key={idx} className="extra-profile-row">
                <span className="extra-profile-name">{cp.platform}:</span>
                <span className="extra-profile-details">{cp.details}</span>
                <a
                  href={cp.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="extra-link"
                  title={`Open ${cp.platform} profile`}
                >
                  <ExternalLink size={13} />
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Certifications */}
        <div className="skill-extra-card">
          <h4 className="extra-card-title">
            <Award size={14} className="badge-icon" />
            <span>Certifications</span>
          </h4>
          <ul className="certifications-list">
            {certifications.map((cert, idx) => (
              <li key={idx} className="cert-item">
                <span className="cert-title">{cert.title}</span>
                <span className="cert-meta">— {cert.issuer}, {cert.date}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
