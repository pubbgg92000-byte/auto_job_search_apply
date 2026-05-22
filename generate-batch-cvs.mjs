import fs from 'fs';

const template = fs.readFileSync('templates/cv-template.html', 'utf8');
const roles = [
  {
    id: '007',
    company: 'Nico Digital',
    filename: 'cv-arvind-nico-digital.html',
    summary: 'Automation & AI Generalist with a focus on building high-impact AI workflows and growth-focused internal tools. Expert in n8n orchestration, prompt engineering, and rapid PoC prototyping. Entrepreneurial mindset with a track record of identifying manual bottlenecks and deploying intelligent systems to scale organic business growth.',
    competencies: ['AI Workflow Orchestration', 'n8n Logic Design', 'Rapid PoC Prototyping', 'Prompt Engineering', 'Growth Automation Systems', 'Svelte & Frontend Integration', 'Technical Problem Solving', 'Independent Research']
  },
  {
    id: '008',
    company: 'WebLineIndia',
    filename: 'cv-arvind-weblineindia.html',
    summary: 'Agentic AI Developer specializing in autonomous agent orchestration and multi-agent systems using n8n and Python. Expert in designing stateful reasoning logic, task decomposition prompts, and resilient API integrations. Builder-first approach to creating independent AI agents that plan, decide, and act for enterprise-scale automations.',
    competencies: ['Agentic AI Architecture', 'n8n & Python Orchestration', 'Multi-Agent Frameworks (LangChain)', 'Autonomous Logic Design', 'Task Decomposition & Reasoning', 'REST API & Webhook Design', 'Docker & Infrastructure', 'Production Debugging']
  },
  {
    id: '010',
    company: 'TexAu',
    filename: 'cv-arvind-texau.html',
    summary: 'Frontend Developer and UI Automation Specialist with a passion for building beautiful, user-centric interfaces for growth automation platforms. Expert in Svelte and Tailwind CSS (React-adjacent), with a deep understanding of creating scalable UI components for "non-techy" users. Combines frontend architectural skills with a builder mindset to ship performant automation tools.',
    competencies: ['Frontend UI Architecture', 'Automation-Focused UI Design', 'Svelte & Tailwind CSS Mastery', 'React & JavaScript Proficiency', 'Reusable Component Design', 'Responsive Web Systems', 'Desktop App Logic (Electron)', 'API-Driven Frontend States']
  }
];

roles.forEach(role => {
  const data = {
    LANG: 'en',
    PAGE_WIDTH: '210mm',
    NAME: 'Mangalarapu Arvind',
    PHONE: '9885124921',
    EMAIL: 'mangalarapuarvind@gmail.com',
    LINKEDIN_URL: 'https://linkedin.com/in/arvind-mangalarapu',
    LINKEDIN_DISPLAY: 'linkedin.com/in/arvind-mangalarapu',
    PORTFOLIO_URL: '',
    PORTFOLIO_DISPLAY: '',
    LOCATION: 'Hyderabad, India',
    SECTION_SUMMARY: 'Professional Summary',
    SUMMARY_TEXT: role.summary,
    SECTION_COMPETENCIES: 'Core Competencies',
    COMPETENCIES: role.competencies.map(c => `<span class="competency-tag">${c}</span>`).join(''),
    SECTION_EXPERIENCE: 'Work Experience',
    EXPERIENCE: '<div class="job"><div class="job-header"><span class="job-company">Uncommon Design Services</span><span class="job-period">Jan 2023 – Jul 2024</span></div><div class="job-role">AI Automation & Product Builder</div><div class="job-location">Hyderabad, India</div><ul><li><strong>Workflow Architecture:</strong> Designed and implemented automated data pipelines and logic flows, integrating REST APIs and handling complex JSON payloads for startup product environments.</li><li><strong>Custom Tool Building:</strong> Developed reusable technical solutions and internal tools to accelerate product delivery, bridging frontend interfaces with backend logic.</li><li><strong>Technical Debugging:</strong> Troubleshooting complex API-driven states and ensuring data consistency across multi-step automation flows.</li></ul></div>' +
                '<div class="job"><div class="job-header"><span class="job-company">Independent Business Operations</span><span class="job-period">COVID Period</span></div><div class="job-role">Workflow Manager — Customer Success</div><div class="job-location">Hyderabad, India</div><ul><li><strong>Process Automation:</strong> Designed and managed local business workflows for inventory and fulfillment, ensuring 100% customer satisfaction through reliable systems.</li><li><strong>Resource Coordination:</strong> Handled complex sourcing and supplier logistics, adapting in real-time to changing market supply/demand patterns.</li></ul></div>',
    SECTION_PROJECTS: 'Strategic Projects',
    PROJECTS: '<div class="project"><div class="project-title">AI Agent Workflow Prototype<span class="project-badge">Agentic Systems</span></div><div class="project-desc">Designed agentic workflows focused on task decomposition, breaking complex requests into structured tool actions and validated final outputs.</div><div class="project-tech">Tech: Prompt Engineering, Agent Orchestration, n8n</div></div>' +
              '<div class="project"><div class="project-title">AI Workflow Automation (n8n)<span class="project-badge">Logic Design</span></div><div class="project-desc">Architected multi-step automation pipelines using n8n to connect webhooks, AI prompts, and data outputs into repeatable business logic.</div><div class="project-tech">Tech: n8n, Webhooks, API Integration</div></div>',
    SECTION_EDUCATION: 'Education',
    EDUCATION: '<div class="edu-item"><div class="edu-header"><span class="edu-title">B.Tech in Mechanical Engineering</span><span class="edu-year">Graduated 2021</span></div><div class="edu-org">Holy Mary Group of Institutions</div></div>',
    SECTION_CERTIFICATIONS: 'Certifications',
    CERTIFICATIONS: '<div class="cert-item"><span class="cert-title">AI Automation and Workflow Building</span><span class="cert-org">n8n Expert Training</span><span class="cert-year">2024</span></div>',
    SECTION_SKILLS: 'Skills & Tools',
    SKILLS: '<div class="skills-grid">' +
            '<div class="skill-item"><span class="skill-category">Automation:</span> n8n, Webhooks, OpenAI/Claude API, Prompt Engineering, Agent Design</div>' +
            '<div class="skill-item"><span class="skill-category">Frontend:</span> Svelte, Tailwind CSS, JavaScript, React (Familiarity)</div>' +
            '<div class="skill-item"><span class="skill-category">Tools:</span> Git, REST APIs, JSON, VS Code, Selenium, Cloudflare</div>' +
            '</div>'
  };

  let html = template;
  for (const key in data) {
    html = html.split('{{' + key + '}}').join(data[key]);
  }

  if (!data.PHONE) {
    html = html.replace(/<span>{{PHONE}}<\/span>\s*<span class="separator">\|<\/span>/g, '');
  } else {
    html = html.replace(/{{PHONE}}/g, data.PHONE);
  }

  fs.writeFileSync('/tmp/' + role.filename, html);
  console.log('HTML written to /tmp/' + role.filename);
});
