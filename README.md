# CRM Frontend Application

A role-based CRM frontend application designed to manage leads, users, and business workflows efficiently.  
The application focuses on modular UI architecture, scalability, and a clean user experience across different user roles.

---

## Tech Stack
- React.js
- Tailwind CSS
- JavaScript (ES6+)
- REST API integration
- Component-driven architecture

---

## Key Features

- Designed and developed a role-based enterprise CRM platform that extends beyond traditional lead
  management by integrating student–trainer relationships, HR operations, sales workflows, and
  management monitoring into a unified system.

- Implemented multi-role access control supporting HR, Business Head, Operations Manager,
  Admission Managers, and Executives, enabling secure, department-specific access and seamless
  cross-team coordination.

- Built end-to-end lead and student lifecycle management, covering inquiry tracking, admissions
  workflows, student onboarding, and trainer assignment.

- Developed daily reporting dashboards for management oversight, providing real-time visibility into
  sales performance, operational progress, and overall team productivity.

- Automated task assignments, deadlines, and follow-up workflows, significantly reducing manual
  coordination and improving accountability across teams.


---

## User Roles & Access Levels

The CRM platform supports multiple roles to ensure secure, role-based access and smooth
coordination across business, operations, sales, and support teams.

### Management & Administration
- **General Manager (Admin)** – Full system access, configuration, user and role management,
  reporting, and operational oversight.
- **Business Head** – Strategic monitoring, performance dashboards, and sales analytics.
- **Center Manager** – Center-level operations, team coordination, and reporting.

### Operations & Admissions
- **Operations Manager** – Workflow monitoring, task allocation, and process optimization.
- **Admission Manager** – Admissions pipeline management, lead allocation, and team supervision.
- **Admission Executive** – Lead follow-ups, student conversion, and admissions processing.
- **Processing Executive** – Documentation handling, application processing, and verification.

### Sales & Business Development
- **Business Development Manager (BDM)** – Lead generation strategy, conversions, and revenue tracking.
- **FOE Cum TC** – Field operations, tele-calling, and on-ground lead engagement.

### Academic & Training
- **Trainer** – Student assignment, batch management, and training progress tracking.

### Marketing & Media
- **Media Team** – Campaign management, lead sources tracking, and promotional activities.

### HR & Finance
- **Human Resources (HR)** – Employee management, attendance, and internal HR workflows.
- **Accounts Manager** – Financial tracking, billing oversight, and account reconciliation.


---

## Screenshots

### Authentication
![Login Screen](screenshots/auth-login.png)

---

### Admin Panel
![Admin Dashboard](screenshots/admin-dashboard.png)
![User Management](screenshots/admin-users.png)
![Admin Leads Management](screenshots/admin-leads.png)

---

### Manager View
![Manager Dashboard](screenshots/manager-dashboard.png)
![Manager Assigned Leads](screenshots/manager-leads.png)

---

### Agent View
![Agent Leads](screenshots/agent-leads.png)
![Lead Details](screenshots/lead-details.png)

---

## Project Structure
- Modular and reusable components
- Centralized API service layer
- Role-based route protection
- Scalable folder structure for future features

---

## Setup Instructions

```bash
npm install
npm start
