-- ============================================================================
-- Fildza Portfolio — seed data (sourced directly from the resume)
-- Run after schema.sql. Safe to re-run: clears and re-inserts these tables.
-- ============================================================================

truncate table public.experience, public.education, public.projects,
  public.skills, public.skill_categories, public.certificates restart identity cascade;

-- experience
insert into public.experience (role, company, location, start_date, end_date, is_current, bullets, sort_order) values
('Building Automation (BAS) Technician', 'Pavilion Sdn. Bhd.', 'Malaysia', '2023-05-01', '2024-06-01', false,
  array[
    'Monitored the HVAC system and its network of temperature sensors, controllers, and monitoring panels across a multi-tenant commercial site, diagnosing faults to minimise downtime.',
    'Investigated system alerts and connectivity issues, documenting root causes and resolutions to support faster troubleshooting.',
    'Produced system diagnostic and incident reports used by the facilities team to track recurring issues.'
  ], 1),
('IT Support & Helpdesk', 'Qorva Technology Sdn. Bhd.', 'Malaysia', '2022-01-01', '2023-01-01', false,
  array[
    'Logged, tracked, and resolved first-line hardware, software, and connectivity tickets using Zendesk, maintaining consistent system uptime.',
    'Configured and maintained the Sun Life app (CIMB bank''s insurance application) for internal users, handling setup, updates, and troubleshooting.',
    'Ran preventive maintenance checks across end-user devices to reduce recurring fault tickets.',
    'Diagnosed basic network connectivity issues (LAN/WAN, TCP/IP) to maintain stable operations.'
  ], 2),
('Technical Field Support', 'Antah Schindler Sdn. Bhd.', 'Malaysia', '2017-08-01', '2018-08-01', false,
  array[
    'Installed and upgraded elevator system software, controllers, and diagnostic tools across multiple sites.',
    'Analysed monitoring logs and performance data to detect irregularities before they caused system failure.',
    'Carried out routine inspections to maintain operational stability and safety compliance standards.'
  ], 3);

-- education
insert into public.education (institution, credential, field, start_date, end_date, score, sort_order) values
('Universiti Tun Abdul Razak (UNIRAZAK)', 'Bachelor of Information Technology (Computer Forensics), Hons', 'Long-Distance Learning', '2024-01-01', null, 'CGPA: 3.79', 1),
('Sijil Akademi Binaan Malaysia (ACMV)', 'Level 1–3', null, '2014-01-01', '2016-01-01', null, 2);

-- projects
insert into public.projects (title, slug, description, long_description, tech_stack, repo_url, is_pinned, is_featured, source, github_repo_name, sort_order) values
('BocorCheck — OSINT-Based Personal Data Exposure Monitoring & Risk Analysis System', 'bocorcheck',
  'Checks personal data exposure using OSINT techniques and the Have I Been Pwned (HIBP) API, translating raw breach data into a plain-language, tiered (Low/Medium/High/Critical) risk score.',
  'Final Year Project at UNIRAZAK (Bachelor of IT – Computer Forensics). Built the backend with Python (Flask) and MySQL, integrated a local LLM (Ollama) to generate personalised, privacy-preserving mitigation guidance without sending user data to third-party AI services, and delivered real-time breach alerts via Telegram. Applied Agile SDLC across the design, development, and testing lifecycle, including structured user acceptance testing.',
  array['Python', 'Flask', 'MySQL', 'Ollama', 'OSINT', 'HIBP API', 'Telegram Bot API'],
  'https://github.com/Fildxza/BocorCheck-OSINT', true, true, 'manual', 'BocorCheck-OSINT', 1),
('EMV Smart Card Security Analysis', 'emv-smart-card-security-analysis',
  'Details coming soon — this repository is currently private.',
  null, array[]::text[],
  'https://github.com/Fildxza/EMV-Smart-Card-Security-Analysis', true, true, 'manual', 'EMV-Smart-Card-Security-Analysis', 2);

-- skill_categories + skills
with cat as (
  insert into public.skill_categories (name, sort_order) values
    ('IT Support & Infrastructure', 1),
    ('Networking', 2),
    ('Security & Forensics', 3),
    ('Development', 4)
  returning id, name
)
insert into public.skills (category_id, name, proficiency, sort_order)
select id, skill.name, skill.proficiency, skill.sort_order
from cat
join lateral (
  values
    ('IT Support & Infrastructure', 'Hardware & Software Troubleshooting', 90, 1),
    ('IT Support & Infrastructure', 'Helpdesk Ticketing (Zendesk)', 85, 2),
    ('IT Support & Infrastructure', 'Virtualization', 75, 3),
    ('IT Support & Infrastructure', 'Preventive Maintenance', 85, 4),
    ('Networking', 'LAN/WAN Diagnostics', 80, 1),
    ('Networking', 'TCP/IP', 78, 2),
    ('Networking', 'Building Automation Systems (BAS)', 85, 3),
    ('Security & Forensics', 'CompTIA Security+', 80, 1),
    ('Security & Forensics', 'OSINT', 78, 2),
    ('Security & Forensics', 'Have I Been Pwned API', 75, 3),
    ('Security & Forensics', 'Computer Forensics Fundamentals', 72, 4),
    ('Development', 'Python', 75, 1),
    ('Development', 'Flask', 70, 2),
    ('Development', 'MySQL', 70, 3),
    ('Development', 'Ollama / Local LLMs', 65, 4),
    ('Development', 'Agile SDLC', 75, 5)
) as skill(category, name, proficiency, sort_order) on skill.category = cat.name;

-- certificates
insert into public.certificates (title, issuer, sort_order) values
('CompTIA Security+', 'CompTIA', 1);
