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
  SUMMARY_TEXT: 'Frontend Developer and AI Automation Builder with hands-on startup experience in architecting responsive UI workflows and enterprise-scale AI integrations. Expert in bridge-building between business requirements and technical implementation, with a specialized focus on n8n automation and conversational AI agents. Entrepreneurial mindset proven through successful independent business operations; now applying systems thinking to scale voice AI solutions at ElevenLabs.',
  SECTION_COMPETENCIES: 'Core Competencies',
  COMPETENCIES: '<span class="competency-tag">Solutions Architecture & API Integration</span>' +
                '<span class="competency-tag">Voice AI & Conversational Agents</span>' +
                '<span class="competency-tag">Python & JavaScript Development</span>' +
                '<span class="competency-tag">n8n Workflow Automation</span>' +
                '<span class="competency-tag">Technical Sales & Customer Enablement</span>' +
                '<span class="competency-tag">Svelte & Tailwind CSS Architecture</span>' +
                '<span class="competency-tag">System Decomposition</span>' +
                '<span class="competency-tag">Customer Success Management</span>',
  SECTION_EXPERIENCE: 'Work Experience',
  EXPERIENCE: '<div class="job"><div class="job-header"><span class="job-company">Uncommon Design Services</span><span class="job-period">Jan 2023 – Jul 2024</span></div><div class="job-role">Frontend Developer — Solutions-focused UI Architecture</div><div class="job-location">Hyderabad, India</div><ul><li><strong>Technical Solutions Architecture:</strong> Integrated frontend screens with complex REST APIs, handling real-time data states, user interactions, and technical troubleshooting for startup workflows.</li><li><strong>Scalable Component Design:</strong> Developed reusable UI components using Svelte and Tailwind CSS, reducing repeated code and accelerating feature deployment by 30%.</li><li><strong>Full-Stack Collaboration:</strong> Partnered with stakeholders in a lean startup environment to translate business objectives into functional product architectures and customer journeys.</li><li><strong>End-to-End Testing & QA:</strong> Performed comprehensive testing of frontend flows and API-driven states to ensure release confidence and production stability.</li></ul></div>' +
              '<div class="job"><div class="job-header"><span class="job-company">Independent Business Operations</span><span class="job-period">COVID Period</span></div><div class="job-role">Operations Manager — Customer Success & Logistics</div><div class="job-location">Hyderabad, India</div><ul><li><strong>Customer Success Ownership:</strong> Directly managed end-to-end operations for a resale business, handling sourcing, coordination, and fulfillment with a focus on 100% customer satisfaction.</li><li><strong>Operational Problem Solving:</strong> Developed practical systems for inventory tracking and margin management, navigating supply chain volatility through analytical thinking and execution.</li><li><strong>Stakeholder Communication:</strong> Managed supplier relationships and customer expectations, building long-term trust through transparent communication and reliable delivery.</li></ul></div>',
  SECTION_PROJECTS: 'Strategic Projects',
  PROJECTS: '<div class="project"><div class="project-title">AI Agent Workflow Prototype<span class="project-badge">Conversational AI</span></div><div class="project-desc">Architected prototype AI agent workflows focused on breaking down complex user requests into structured tool actions and conversational outputs. Optimized for automation reliability.</div><div class="project-tech">Tech: AI Agents, Prompt Engineering, Workflow Design</div></div>' +
            '<div class="project"><div class="project-title">AI Workflow Automation (n8n)<span class="project-badge">Automation</span></div><div class="project-desc">Created multi-step automation pipelines connecting webhooks, triggers, and AI processing steps into repeatable business logic for lead handling and reporting.</div><div class="project-tech">Tech: n8n, Webhooks, API Integration</div></div>' +
            '<div class="project"><div class="project-title">Meal Subscription Platform<span class="project-badge">Product Architecture</span></div><div class="project-desc">Lead frontend developer for a subscription-based product, implementing scalable UI architecture and API-driven user flows.</div><div class="project-tech">Tech: Svelte, Tailwind CSS, REST APIs</div></div>',
  SECTION_EDUCATION: 'Education',
  EDUCATION: '<div class="edu-item"><div class="edu-header"><span class="edu-title">B.Tech in Mechanical Engineering</span><span class="edu-year">Graduated 2021</span></div><div class="edu-org">Holy Mary Group of Institutions</div></div>',
  SECTION_CERTIFICATIONS: 'Certifications',
  CERTIFICATIONS: '<div class="cert-item"><span class="cert-title">AI Automation and Workflow Building</span><span class="cert-org">Self-Learning / Mastermind</span><span class="cert-year">2024</span></div>' +
                  '<div class="cert-item"><span class="cert-title">n8n Workflow Automation</span><span class="cert-org">Self-Learning</span><span class="cert-year">2024</span></div>',
  SECTION_SKILLS: 'Skills & Tools',
  SKILLS: '<div class="skills-grid">' +
          '<div class="skill-item"><span class="skill-category">Frontend:</span> Svelte, Tailwind CSS, JavaScript, TypeScript (Basics)</div>' +
          '<div class="skill-item"><span class="skill-category">AI/Automation:</span> n8n, Prompt Engineering, AI Agent Design, Selenium</div>' +
          '<div class="skill-item"><span class="skill-category">Developer Tools:</span> Git, Cloudflare, REST APIs, Webhooks, VS Code</div>' +
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

fs.writeFileSync('/tmp/cv-arvind-elevenlabs-v2.html', html);
console.log('HTML written to /tmp/cv-arvind-elevenlabs-v2.html');
