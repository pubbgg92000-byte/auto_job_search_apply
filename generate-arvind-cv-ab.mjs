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
  SUMMARY_TEXT: 'AI Automation Engineer and n8n expert specialized in deploying production-grade AI agents and JSON-heavy workflow orchestration. Expert in bridging low-code speed (n8n) with custom code flexibility (TypeScript/Node.js). Entrepreneurial mindset with a focus on building "zero-to-one" automation tools that solve complex business bottlenecks. Proven track record of architecting stateful workflows, task decomposition prompts, and resilient API integrations.',
  SECTION_COMPETENCIES: 'Core Competencies',
  COMPETENCIES: '<span class="competency-tag">n8n Workflow Orchestration</span>' +
                '<span class="competency-tag">Agentic System Design</span>' +
                '<span class="competency-tag">TypeScript & Node.js Development</span>' +
                '<span class="competency-tag">LLM API Integration (OpenAI/Claude)</span>' +
                '<span class="competency-tag">Prompt Engineering & Task Decomposition</span>' +
                '<span class="competency-tag">JSON Data Pipeline Architecture</span>' +
                '<span class="competency-tag">State Management & Error Handling</span>' +
                '<span class="competency-tag">Technical Solution Discovery</span>',
  SECTION_EXPERIENCE: 'Work Experience',
  EXPERIENCE: '<div class="job"><div class="job-header"><span class="job-company">Uncommon Design Services</span><span class="job-period">Jan 2023 – Jul 2024</span></div><div class="job-role">AI Automation & Product Builder</div><div class="job-location">Hyderabad, India</div><ul><li><strong>Workflow Architecture:</strong> Designed and implemented automated data pipelines and logic flows, integrating REST APIs and handling complex JSON payloads for startup product environments.</li><li><strong>Custom Tool Building:</strong> Developed reusable technical solutions and internal tools to accelerate product delivery, bridging frontend interfaces with backend logic.</li><li><strong>Technical Debugging:</strong> Performed deep-dive troubleshooting of API-driven states and workflow logic to ensure production reliability and data integrity.</li><li><strong>Agile Execution:</strong> Operated in a lean, fast-paced environment, rapidly iterating on technical solutions from discovery to deployment.</li></ul></div>' +
              '<div class="job"><div class="job-header"><span class="job-company">Independent Business Operations</span><span class="job-period">COVID Period</span></div><div class="job-role">Operations & Workflow Manager</div><div class="job-location">Hyderabad, India</div><ul><li><strong>Process Optimization:</strong> Architected and managed end-to-end operational workflows for a resale business, focusing on inventory movement, supply chain logic, and fulfillment accuracy.</li><li><strong>Analytical Decision Making:</strong> Evaluated market patterns and operational bottlenecks to build practical, resilient systems for business continuity.</li><li><strong>Execution Discipline:</strong> Owned the complete execution cycle, from sourcing to final delivery, ensuring 100% customer satisfaction through process reliability.</li></ul></div>',
  SECTION_PROJECTS: 'Production-Grade Projects',
  PROJECTS: '<div class="project"><div class="project-title">AI Workflow Automation (n8n)<span class="project-badge">Production Logic</span></div><div class="project-desc">Architected multi-step automation pipelines using n8n to connect webhooks, LLMs, and output actions into repeatable business systems. Focused on stateful logic and resilient integration.</div><div class="project-tech">Tech: n8n, Webhooks, LLM APIs, JSON Logic</div></div>' +
            '<div class="project"><div class="project-title">AI Agent Workflow Prototype<span class="project-badge">Agentic Systems</span></div><div class="project-desc">Designed agentic workflows focused on task decomposition, breaking complex user requests into structured tool actions and validated outputs.</div><div class="project-tech">Tech: Prompt Engineering, Agent Orchestration, Workflow Design</div></div>' +
            '<div class="project"><div class="project-title">Svelte-Based Product Architecture<span class="project-badge">System Interface</span></div><div class="project-desc">Built scalable UI systems for a subscription-based platform, focusing on performant API-driven user journeys and modular architecture.</div><div class="project-tech">Tech: Svelte, Tailwind CSS, REST APIs</div></div>',
  SECTION_EDUCATION: 'Education',
  EDUCATION: '<div class="edu-item"><div class="edu-header"><span class="edu-title">B.Tech in Mechanical Engineering</span><span class="edu-year">Graduated 2021</span></div><div class="edu-org">Holy Mary Group of Institutions</div></div>',
  SECTION_CERTIFICATIONS: 'Certifications',
  CERTIFICATIONS: '<div class="cert-item"><span class="cert-title">AI Automation and Workflow Building</span><span class="cert-org">n8n Expert Training</span><span class="cert-year">2024</span></div>' +
                  '<div class="cert-item"><span class="cert-title">Generative AI Mastermind</span><span class="cert-org">Outskill</span><span class="cert-year">2024</span></div>',
  SECTION_SKILLS: 'Skills & Tools',
  SKILLS: '<div class="skills-grid">' +
          '<div class="skill-item"><span class="skill-category">Automation:</span> n8n, Webhooks, API Orchestration, Prompt Engineering, Agent Design</div>' +
          '<div class="skill-item"><span class="skill-category">Languages/Tools:</span> TypeScript, JavaScript, Node.js (Logic), Git, Selenium</div>' +
          '<div class="skill-item"><span class="skill-category">Cloud/Web:</span> Cloudflare, REST APIs, JSON, Svelte, Tailwind CSS</div>' +
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

fs.writeFileSync('/tmp/cv-arvind-automation-builders.html', html);
console.log('HTML written to /tmp/cv-arvind-automation-builders.html');
