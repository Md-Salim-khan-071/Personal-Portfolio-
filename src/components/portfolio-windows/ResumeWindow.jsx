import React from 'react';
import { X, FileText, Download, ExternalLink } from 'lucide-react';
import { portfolioData } from '../../data/portfolioData';

/**
 * ResumeWindow Component
 * 
 * Displays the exact provided resume PDF:
 * "Mohammed Salim Usman Khan - 1DT23IC018.pdf"
 * 
 * Actions:
 * - In-browser PDF preview via iframe
 * - Open Full Resume in new tab
 * - Download Resume PDF
 */
export default function ResumeWindow({ onClose }) {
  const { profile } = portfolioData;
  const resumeUrl = "/resume/Mohammed-Salim-Usman-Khan-Resume.pdf";

  return (
    <div className="portfolio-window resume-window" role="region" aria-label="Resume Section">
      {/* Header */}
      <div className="window-header">
        <div className="window-title-badge">
          <FileText size={16} className="badge-icon" />
          <span>RESUME</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="window-close-btn"
          aria-label="Close Resume Window"
          title="Close window"
        >
          <X size={18} />
        </button>
      </div>

      {/* Candidate Heading */}
      <div className="resume-applicant-header">
        <h3 className="resume-applicant-name">{profile.name}</h3>
        <p className="resume-applicant-meta">
          {profile.title} • Dayananda Sagar Academy of Technology and Management
        </p>
      </div>

      {/* Actual PDF Preview Frame */}
      <div className="resume-pdf-preview-box">
        <iframe
          src={`${resumeUrl}#toolbar=0&navpanes=0`}
          title={`${profile.name} - Resume PDF Preview`}
          className="resume-pdf-frame"
        />
      </div>

      {/* Action Buttons: Open Full Resume & Download Resume */}
      <div className="resume-actions-footer">
        <a
          href={resumeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="action-btn-live"
          title="Open exact resume PDF in a new tab"
        >
          <span>Open Full Resume</span>
          <ExternalLink size={15} />
        </a>

        <a
          href={resumeUrl}
          download="Mohammed-Salim-Usman-Khan-Resume.pdf"
          className="action-btn-github"
          title="Download exact resume PDF"
        >
          <Download size={15} />
          <span>Download Resume</span>
        </a>
      </div>
    </div>
  );
}
