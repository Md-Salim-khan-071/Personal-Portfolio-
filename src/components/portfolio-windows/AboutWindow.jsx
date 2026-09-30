import React from 'react';
import { X, User, Terminal, Compass, Award } from 'lucide-react';
import { portfolioData } from '../../data/portfolioData';

/**
 * AboutWindow Component
 * 
 * Powered by authoritative resume data for Mohammed Salim Usman Khan.
 */
export default function AboutWindow({ onClose }) {
  const { profile, certifications, codingProfiles } = portfolioData;

  return (
    <div className="portfolio-window about-window" role="region" aria-label="About Section">
      <div className="window-header">
        <div className="window-title-badge">
          <User size={16} className="badge-icon" />
          <span>ABOUT SALIM</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="window-close-btn"
          aria-label="Close About Window"
          title="Close window"
        >
          <X size={18} />
        </button>
      </div>

      <div className="about-content">
        <p className="about-lead">
          <strong>{profile.name}</strong> is a {profile.title} based in {profile.location}.
        </p>

        <p className="resume-summary-text">{profile.summary}</p>

        <div className="about-grid">
          <div className="about-card">
            <div className="about-card-icon"><Terminal size={18} /></div>
            <h4>Problem Solving & Practice</h4>
            <p>{profile.leetcodeProblemsSolved} on LeetCode.</p>
          </div>

          <div className="about-card">
            <div className="about-card-icon"><Award size={18} /></div>
            <h4>Verified Certifications</h4>
            <p>
              {certifications.map((c) => `${c.title} (${c.issuer})`).join(' • ')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
