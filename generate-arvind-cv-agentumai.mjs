import fs from 'fs';

const template = fs.readFileSync('templates/cv-template.html', 'utf8');
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
  SUMMARY_TEXT: 'Junior AI Automation Developer and n8n specialist with ~2 years of startup and entrepreneurial experience. Expert in architecting stateful n8n workflows, designing task-decomposition agents, and integrating LLMs via REST APIs and webhooks. Combines frontend development skills (Svelte/Tailwind) with a builder-first mindset to deploy production-ready automation systems that solve real business bottlenecks.',
  SECTION_COMPETENCIES: 'Core Competencies',
  COMPETENCIES: '<span class="competency-tag">n8n Workflow Mastery</span>' +
                '<span class="competency-tag">AI Agent Orchestration</span>' +
                '<span class="competency-tag">REST API & Webhook Integration</span>' +
                '<span class="competency-tag">Prompt Engineering & LLM Logic</span>' +
                '<span class="competency-tag">JSON Data Processing</span>' +
                '<span class="competency-tag">Lead Gen & Data Scraping Automations</span>' +
                '<span class="competency-tag">Svelte & Frontend UI Design</span>' +
                '<span class="competency-tag">Operational Problem Solving</span>',
  SECTION_EXPERIENCE: 'Work Experience',
  EXPERIENCE: '<div class="job"><div class="job-header"><span class="job-company">Uncommon Design Services</span><span class="job-period">Jan 2023 – Jul 2024</span></div><div class="job-role">AI Automation & Product Builder</div><div class="job-location">Hyderabad, India</div><ul><li><strong>n8n Logic Design:</strong> Developed and tested automated workflow components, integrating frontend interfaces with backend API logic for startup product cycles.</li><li><strong>Technical Debugging:</strong> Troubleshooting complex API-driven states and ensuring data consistency across multi-step automation flows.</li><li><strong>Svelte UI Architecture:</strong> Built responsive, component-based interfaces focused on streamlining user interactions with automated workflows.</li></ul></div>' +
              '<div class="job"><div class="job-header"><span class="job-company">Independent Business Operations</span><span class="job-period">COVID Period</span></div><div class="job-role">Workflow Manager — Customer Success</div><div class="job-location">Hyderabad, India</div><ul><li><strong>Process Automation:</strong> Designed and managed local business workflows for inventory and fulfillment, ensuring 100% customer satisfaction through reliable systems.</li><li><strong>Resource Coordination:</strong> Handled complex sourcing and supplier logistics, adapting in real-time to changing market supply/demand patterns.</li></ul></div>',
  SECTION_PROJECTS: 'Relevant Automation Projects',
  PROJECTS: '<div class="project"><div class="project-title">AI Workflow Automation (n8n)<span class="project-badge">Production Ready</span></div><div class="project-desc">Architected multi-step automation pipelines using n8n to connect webhooks, AI prompts, and data outputs into repeatable business logic for research and lead handling.</div><div class="project-tech">Tech: n8n, Webhooks, LLM APIs, JSON Logic</div></div>' +
            '<div class="project"><div class="project-title">AI Agent Workflow Prototype<span class="project-badge">Agentic AI</span></div><div class="project-desc">Designed agentic workflows focused on task decomposition, breaking complex requests into structured tool actions and validated final outputs.</div><div class="project-tech">Tech: Prompt Engineering, AI Agent Design, n8n</div></div>',
  SECTION_EDUCATION: 'Education',
  EDUCATION: '<div class="edu-item"><div class="edu-header"><span class="edu-title">B.Tech in Mechanical Engineering</span><span class="edu-year">Graduated 2021</span></div><div class="edu-org">Holy Mary Group of Institutions</div></div>',
  SECTION_CERTIFICATIONS: 'Certifications',
  CERTIFICATIONS: '<div class="cert-item"><span class="cert-title">n8n Workflow Automation Specialist</span><span class="cert-org">Self-Learning</span><span class="cert-year">2024</span></div>' +
                  '<div class="cert-item"><span class="cert-title">Generative AI Mastermind</span><span class="cert-org">Outskill</span><span class="cert-year">2024</span></div>',
  SECTION_SKILLS: 'Skills & Tools',
  SKILLS: '<div class="skills-grid">' +
          '<div class="skill-item"><span class="skill-category">AI/Automation:</span> n8n, Webhooks, OpenAI/Claude API, Prompt Engineering, Agent Design</div>' +
          '<div class="skill-item"><span class="skill-category">Frontend:</span> Svelte, Tailwind CSS, JavaScript, TypeScript (Basics)</div>' +
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

fs.writeFileSync('/tmp/cv-arvind-agentumai.html', html);
console.log('HTML written to /tmp/cv-arvind-agentumai.html');
