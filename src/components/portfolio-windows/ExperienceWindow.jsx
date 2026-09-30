import React from 'react';
import { X, Briefcase, Calendar, MapPin } from 'lucide-react';

/**
 * ExperienceWindow Component
 * 
 * Displays Salim's practical experience, internships, and project engineering roles.
 * 
 * Props:
 * - onClose: function to close this window and reset activeWindow
 */
export default function ExperienceWindow({ onClose }) {
  const experiences = [
    {
      role: 'Student Developer & Engineering Projects',
      organization: 'Academic & Independent Engineering',
      period: '2023 - Present',
      location: 'Bengaluru, India',
      highlights: [
        'Developed end-to-end full stack and desktop applications including FocusFlow and BirthdayGen.',
        'Engineered database-driven systems utilizing Python and MySQL with clean normalized schemas.',
        'Collaborated on engineering lab implementations in Cyber Security, IoT, and Blockchain.'
      ]
    }
  ];

  return (
    <div className="portfolio-window experience-window" role="region" aria-label="Experience Section">
      <div className="window-header">
        <div className="window-title-badge">
          <Briefcase size={16} className="badge-icon" />
          <span>EXPERIENCE</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="window-close-btn"
          aria-label="Close Experience Window"
          title="Close window"
        >
          <X size={18} />
        </button>
      </div>

      <div className="window-intro">
        <p>Practical engineering experience and project development:</p>
      </div>

      <div className="experience-list">
        {experiences.map((exp, idx) => (
          <div key={idx} className="experience-card">
            <div className="experience-card-header">
              <h3 className="experience-role">{exp.role}</h3>
              <span className="experience-org">{exp.organization}</span>
            </div>

            <div className="experience-meta">
              <span className="meta-item">
                <Calendar size={13} />
                <span>{exp.period}</span>
              </span>
              <span className="meta-item">
                <MapPin size={13} />
                <span>{exp.location}</span>
              </span>
            </div>

            <ul className="experience-bullets">
              {exp.highlights.map((point, pIdx) => (
                <li key={pIdx}>{point}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
