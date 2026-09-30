import React from 'react';
import { X, Mail, Phone, MapPin, Github, Linkedin, Code2 } from 'lucide-react';
import { portfolioData } from '../../data/portfolioData';

/**
 * ContactWindow Component
 * 
 * Powered by contact information from Mohammed Salim Usman Khan's resume.
 */
export default function ContactWindow({ onClose }) {
  const { profile } = portfolioData;

  return (
    <div className="portfolio-window contact-window" role="region" aria-label="Contact Section">
      <div className="window-header">
        <div className="window-title-badge">
          <Mail size={16} className="badge-icon" />
          <span>CONTACT INFORMATION</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="window-close-btn"
          aria-label="Close Contact Window"
          title="Close window"
        >
          <X size={18} />
        </button>
      </div>

      <div className="window-intro">
        <p>Official contact details from Salim's resume:</p>
      </div>

      <div className="contact-methods">
        <a href={`mailto:${profile.email}`} className="contact-card">
          <Mail size={20} className="contact-icon" />
          <div className="contact-details">
            <span className="contact-label">Email</span>
            <span className="contact-value">{profile.email}</span>
          </div>
        </a>

        <div className="contact-card non-interactive">
          <Phone size={20} className="contact-icon" />
          <div className="contact-details">
            <span className="contact-label">Phone</span>
            <span className="contact-value">{profile.phone}</span>
          </div>
        </div>

        <div className="contact-card non-interactive">
          <MapPin size={20} className="contact-icon" />
          <div className="contact-details">
            <span className="contact-label">Location</span>
            <span className="contact-value">{profile.location}</span>
          </div>
        </div>

        <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="contact-card">
          <Linkedin size={20} className="contact-icon" />
          <div className="contact-details">
            <span className="contact-label">LinkedIn</span>
            <span className="contact-value">{profile.linkedin.replace('https://', '')}</span>
          </div>
        </a>

        <a href={profile.github} target="_blank" rel="noopener noreferrer" className="contact-card">
          <Github size={20} className="contact-icon" />
          <div className="contact-details">
            <span className="contact-label">GitHub</span>
            <span className="contact-value">{profile.github.replace('https://', '')}</span>
          </div>
        </a>
      </div>
    </div>
  );
}
