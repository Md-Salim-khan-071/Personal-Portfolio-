import React from 'react';
import { X, GraduationCap, Calendar, Award } from 'lucide-react';
import { portfolioData } from '../../data/portfolioData';

/**
 * EducationWindow Component
 * 
 * Displays complete educational qualifications from Salim's latest resume:
 * - B.E. in Computer Science (IoT, Cyber Security and Blockchain)
 * - Class XII
 * - Class X
 */
export default function EducationWindow({ onClose }) {
  const { education } = portfolioData;

  return (
    <div className="portfolio-window education-window" role="region" aria-label="Education Section">
      {/* Header */}
      <div className="window-header">
        <div className="window-title-badge">
          <GraduationCap size={16} className="badge-icon" />
          <span>EDUCATION</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="window-close-btn"
          aria-label="Close Education Window"
          title="Close window"
        >
          <X size={18} />
        </button>
      </div>

      <div className="window-intro">
        <p>Academic background from Mohammed Salim Usman Khan's resume:</p>
      </div>

      {/* Education List */}
      <div className="education-list-container">
        {education.map((item, idx) => (
          <div key={idx} className="education-card-main">
            <div className="education-degree-header">
              <div>
                <h3 className="education-degree">{item.qualification}</h3>
                <div className="institution-name">{item.institution}</div>
              </div>
              <div className="cgpa-badge">
                <Award size={15} />
                <span>{item.score}</span>
              </div>
            </div>

            <div className="education-meta">
              <span className="meta-item">
                <Calendar size={13} />
                <span>{item.year}</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
