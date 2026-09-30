import ProjectsWindow from './ProjectsWindow';
import ProjectDetailWindow from './ProjectDetailWindow';
import EducationWindow from './EducationWindow';
import SkillsWindow from './SkillsWindow';
import ExperienceWindow from './ExperienceWindow';
import AboutWindow from './AboutWindow';
import ContactWindow from './ContactWindow';
import ResumeWindow from './ResumeWindow';

/**
 * Window Registry
 * 
 * Maps normalized intent types to pre-built React components.
 */
export const windowRegistry = {
  PROJECTS: ProjectsWindow,
  PROJECT_DETAIL: ProjectDetailWindow,
  EDUCATION: EducationWindow,
  SKILLS: SkillsWindow,
  EXPERIENCE: ExperienceWindow,
  ABOUT: AboutWindow,
  CONTACT: ContactWindow,
  RESUME: ResumeWindow
};

export {
  ProjectsWindow,
  ProjectDetailWindow,
  EducationWindow,
  SkillsWindow,
  ExperienceWindow,
  AboutWindow,
  ContactWindow,
  ResumeWindow
};
