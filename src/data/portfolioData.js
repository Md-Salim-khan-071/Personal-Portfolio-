/**
 * Central Portfolio Data Structure
 * Source of Truth: Mohammed Salim Usman Khan - 1DT23IC018.pdf (Latest Resume)
 * 
 * Strict Accuracy: No invented, exaggerated, or assumed information.
 */

export const portfolioData = {
  profile: {
    name: "Mohammed Salim Usman Khan",
    title: "Computer Science Engineering Student",
    phone: "+91 7022917534",
    email: "Salimukhan071@gmail.com",
    location: "Bengaluru, Karnataka, India",
    linkedin: "https://linkedin.com/in/salimo071",
    github: "https://github.com/Md-Salim-khan-071",
    leetcode: "https://leetcode.com/u/Mohammed_Salim_khan/",
    leetcodeProblemsSolved: "Solved 30+ problems focused on Data Structures & Algorithms",
    resumeUrl: "/resume/Mohammed-Salim-Usman-Khan-Resume.pdf",
    summary:
      "Computer Science Engineering student with a strong foundation in Python, JavaScript, SQL, and web development. Passionate about software engineering, backend development, problem solving, and building practical software applications. Currently strengthening Data Structures & Algorithms, backend development fundamentals, and AI application development through personal projects."
  },

  education: [
    {
      qualification: "B.E. in Computer Science (IoT, Cyber Security and Blockchain)",
      institution: "Dayananda Sagar Academy of Technology and Management",
      year: "Expected Graduation: 2027",
      score: "8.45 CGPA"
    },
    {
      qualification: "Class XII",
      institution: "MES PU College, Sirsi",
      year: "2023",
      score: "89.83%"
    },
    {
      qualification: "Class X",
      institution: "Don Bosco High School, Sirsi",
      year: "2021",
      score: "94.56%"
    }
  ],

  skills: {
    "Programming Languages": ["Python", "JavaScript", "TypeScript", "SQL"],
    "Databases": ["MySQL", "PostgreSQL", "SQLite"],
    "Web Technologies": ["HTML5", "CSS3", "React.js", "REST APIs"],
    "Frameworks": ["FastAPI", "Node.js", "Express.js"],
    "Tools & Platforms": ["Git", "GitHub", "VS Code", "Postman"],
    "Core CS": ["Data Structures & Algorithms", "DBMS"]
  },

  projects: [
    {
      id: "mini-erp-crm",
      slug: "mini-erp",
      name: "Mini ERP CRM",
      subtitle: "Full-Stack Web Application",
      technologies: ["React", "TypeScript", "Node.js", "Express", "PostgreSQL", "Prisma", "JWT"],
      bullets: [
        "Developed a role-based ERP/CRM system for managing customers, products, inventory, and delivery challans.",
        "Implemented JWT authentication and role-based access control (RBAC) for Admin, Sales, Warehouse, and Accounts users.",
        "Built REST APIs with Prisma transactions for stock movements and challan confirmation, with API documentation using Postman."
      ],
      liveUrl: "https://mini-erp-mauve.vercel.app/",
      githubUrl: "https://github.com/Md-Salim-khan-071/Mini-ERP"
    },
    {
      id: "focusflow",
      slug: "focusflow",
      name: "FocusFlow",
      subtitle: "Full-Stack Personal Productivity Platform",
      technologies: [
        "HTML",
        "CSS",
        "JavaScript",
        "Python",
        "FastAPI",
        "SQLAlchemy",
        "PostgreSQL",
        "Supabase",
        "Vercel",
        "Render"
      ],
      bullets: [
        "Developed a responsive productivity platform with task management, Pomodoro timer, productivity heatmap, progress tracking, task history, and quick notes.",
        "Built a FastAPI REST backend with SQLAlchemy and PostgreSQL, implementing CRUD APIs for cloud-backed task persistence through Supabase.",
        "Deployed the frontend on Vercel and backend on Render, enabling persistent task data across browser sessions and establishing the foundation for future authentication and cross-device synchronization."
      ],
      liveUrl: "https://focus-flow-liart-gamma.vercel.app/",
      githubUrl: "https://github.com/Md-Salim-khan-071/FocusFlow"
    },
    {
      id: "wishcraft",
      slug: "wishcraft",
      name: "WishCraft",
      subtitle: "Birthday Page Generator",
      technologies: ["React", "Vite", "Supabase", "Vercel"],
      bullets: [
        "Built a responsive web application that generates personalized birthday webpages with custom messages, images, themes, and background music.",
        "Integrated Supabase for persistent birthday-card data and image storage, with dynamic shareable birthday URLs.",
        "Deployed the application on Vercel and implemented SPA routing for reliable access to shared pages."
      ],
      liveUrl: "https://wish-craft-lemon.vercel.app/",
      githubUrl: "https://github.com/Md-Salim-khan-071/WishCraft"
    }
  ],

  certifications: [
    {
      title: "Complete Python + DSA Bootcamp",
      issuer: "Udemy",
      date: "April 2026"
    },
    {
      title: "The Complete Python Bootcamp From Zero to Hero",
      issuer: "Udemy",
      date: "July"
    }
  ],

  codingProfiles: [
    {
      platform: "LeetCode",
      details: "Solved 30+ problems focused on Data Structures & Algorithms",
      url: "https://leetcode.com/u/Mohammed_Salim_khan/"
    },
    {
      platform: "GitHub",
      details: "github.com/Md-Salim-khan-071",
      url: "https://github.com/Md-Salim-khan-071"
    }
  ]
};
