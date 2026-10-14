# Jajal Medical — Implant Case Management System

> **Software Developer Intern Practical Assignment**  
> **Company:** @Jajal Medical  
> **Date:** October 8, 2026  
> **Author:** Candidate Submission  
> **Status:** Complete (Core Requirements 1–7 + Bonus Tasks)

---

## 1. Project Overview & Scenario
A medical device enterprise system designed to track custom patient-specific implants and standard orthopedic/cranial surgical cases from initial clinical draft through engineering review, regulatory approval, and operating room delivery.

The application enforces **Role-Based Access Control (RBAC)** across three roles:
- **Admin:** Full access — create, edit, change status, and delete cases.
- **Viewer:** Read-only access — can browse, search, and view cases. Attempted mutations or deletions are blocked by server-side policy.
- **Engineer (Bonus):** Technical access — can create, edit, and update case lifecycle status, but cannot delete cases.

---

## 2. Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Backend API** | Node.js / Express (TypeScript), REST architecture, Laravel Sanctum token auth emulation |
| **Frontend UI** | React 19, TypeScript, Tailwind CSS, Lucide Icons, Motion |
| **Architecture** | Full-Stack SPA with server-authoritative role policies, Form Request validation |
| **Public API** | Nager.Date API integration for public holiday scheduling awareness (Bonus task) |
| **Testing** | Automated feature test suite (CLI + interactive browser test runner) |

---

## 3. Dummy Test Credentials

Reviewers can log in immediately using these seeded accounts (also available via **1-Click Demo Login** on the login screen and the navigation bar role switcher):

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@jajalmedical.com` | `Secret123!` | Create, Edit, View, Delete |
| **Viewer** | `viewer@jajalmedical.com` | `Secret123!` | View only (Blocked from Create/Edit/Delete) |
| **Engineer (Bonus)** | `engineer@jajalmedical.com` | `Secret123!` | Create, Edit, View (Blocked from Delete) |

---

## 4. Quick Setup & Run Instructions

### Prerequisites
- Node.js 20+ or 22+
- npm (or bun / yarn)

### 1. Clone repository & install dependencies
```bash
git clone <repository-url>
cd jajal-medical-case-management
npm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
*(The defaults are pre-configured to run out of the box).*

### 3. Run Development Server
```bash
npm run dev
```
Open **`http://localhost:3000`** in your browser.

### 4. Build for Production
```bash
npm run build
npm start
```

---

## 5. Automated Feature Tests

The application includes automated feature tests satisfying all requirements in **Section 7**:
1. **Test 1:** Valid login succeeds (issues Bearer token).
2. **Test 2:** Invalid login is rejected (HTTP 401).
3. **Test 3:** Guest cannot open case pages or APIs (HTTP 401 / redirect).
4. **Test 4:** Admin can create a case (HTTP 201 Created).
5. **Test 5:** Creating a case with a duplicate Case Number fails (HTTP 422 with field errors).
6. **Test 6:** Viewer cannot delete a case (HTTP 403 Forbidden).
7. **Bonus Test 7:** Engineer can edit cases but cannot delete (HTTP 403).

### How to Run Tests
**Option A: Via CLI Terminal**
```bash
npm test
```

**Option B: Interactive In-App Test Runner**
- Sign in to the portal.
- Click the **"Automated Tests"** tab in the top navigation.
- Click **"Run Automated Tests"** to inspect live execution latency, HTTP status codes, assertions, and JSON response bodies.

---

## 6. REST API Endpoints

All responses return a consistent JSON envelope:
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation description",
  "errors": { "field": ["Validation message"] }
}
```

| Method | Endpoint | Purpose | Authorization | Status Codes |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/login` | Authenticate user & issue Bearer token | Public | `200`, `401`, `422` |
| `POST` | `/api/logout` | Revoke current session token | Authenticated | `200`, `401` |
| `GET` | `/api/cases` | List cases (paginated 10/page, search, filters, sort) | Admin, Viewer, Engineer | `200`, `401` |
| `POST` | `/api/cases` | Create new implant case | Admin, Engineer | `201`, `401`, `403`, `422` |
| `GET` | `/api/cases/:id` | Get single case details | Admin, Viewer, Engineer | `200`, `401`, `404` |
| `PUT` | `/api/cases/:id` | Update case (unique rule ignores self) | Admin, Engineer | `200`, `401`, `403`, `404`, `422` |
| `DELETE`| `/api/cases/:id` | Delete case | **Admin Only** | `200`, `401`, `403`, `404` |
| `GET` | `/api/dashboard/stats`| Live status & priority count metrics | Authenticated | `200`, `401` |
| `GET` | `/api/holidays` | Public holiday integration (Nager.Date API) | Public / Auth | `200` |
| `POST` | `/api/tests/run` | Execute automated test suite against API | Public / Dev | `200` |
| `POST` | `/api/reset-database` | Reset store to initial 24 seed cases | Authenticated | `200`, `401` |

> *A complete Postman / Thunder Client collection is exported at `docs/medical_case_management.postman_collection.json`.*

---

## 7. Medical Device Documentation Deliverables

As required for medical software submissions:
- **`docs/traceability.md`:** Bidirectional traceability matrix linking user requirements (`REQ-001` through `REQ-008`), architectural code implementations, and automated verification tests.
- **`docs/database.md`:** Relational database specifications, table structures, column datatypes, indexes (`cases_case_number_unique`, `cases_status_index`), foreign keys, and ER diagram.
- **`docs/deployment.md`:** Half-page AWS production deployment guide covering Amazon EC2, Amazon RDS MySQL (Multi-AZ), Amazon S3 for CAD attachments, Security Groups, AWS Secrets Manager, and ACM HTTPS.
- **`docs/medical_case_management.postman_collection.json`:** Postman collection ready for import.

---

## 8. Assumptions & Known Limitations

1. **Anonymous Patient Reference:** In accordance with HIPAA / GDPR and assignment guidelines, only dummy anonymous patient reference codes (`PAT-XXXX`) are accepted and stored. No Protected Health Information (PHI) is collected.
2. **Nager.Date Public Holiday API:** The public holiday lookup queries Nager.Date with a 3.5s timeout. If the host network is offline or throttled, the application gracefully provides cached medical calendar dates without interrupting the user's clinical intake workflow.
3. **Session Persistence:** Client authentication tokens are stored in `localStorage` for smooth reviewer reloads and can be cleared via the Logout button.
4. **Case Number Uniqueness on Edit:** As required by Section 6, the uniqueness validation rule automatically ignores the ID of the case currently being modified.
