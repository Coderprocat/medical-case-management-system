# Database Schema & Data Dictionary

**Project:** Jajal Medical Implant Case Management System  
**Database Engine:** MySQL 8.0 (InnoDB)  
**Date:** October 8, 2026  
**Document Ref:** DOC-DB-001  

---

## 1. Entity-Relationship (ER) Diagram

```text
+------------------------------------+
|               users                |
+------------------------------------+
| PK  id               BIGINT        |
|     name             VARCHAR(255)  |
| U   email            VARCHAR(255)  |
|     password         VARCHAR(255)  |
|     role             VARCHAR(32)   |  <--- 'admin' | 'viewer' | 'engineer'
|     created_at       TIMESTAMP     |
|     updated_at       TIMESTAMP     |
+------------------------------------+
                  |
                  | 1 (creator)
                  |
                  | N (implant cases)
                  v
+------------------------------------+
|               cases                |
+------------------------------------+
| PK  id               BIGINT        |
| U   case_number      VARCHAR(64)   |  <--- Unique index (e.g. CASE-0001)
|     patient_referenceVARCHAR(64)   |  <--- Dummy code (e.g. PAT-4821)
|     surgeon_name     VARCHAR(255)  |  <--- Required
|     implant_type     VARCHAR(255)  |  <--- Required
| IDX status           VARCHAR(32)   |  <--- Index on status
|     priority         VARCHAR(32)   |  <--- 'Low' | 'Medium' | 'High'
|     surgery_date     DATE (NULL)   |  <--- Optional valid date
| FK  created_by       BIGINT        |  <--- Foreign Key -> users(id)
|     notes            TEXT (NULL)   |  <--- Optional clinical notes
|     created_at       TIMESTAMP     |
|     updated_at       TIMESTAMP     |
+------------------------------------+

+------------------------------------+
|     personal_access_tokens         |
+------------------------------------+
| PK  id               BIGINT        |
|     tokenable_type   VARCHAR(255)  |
|     tokenable_id     BIGINT        |
|     name             VARCHAR(255)  |
| U   token            VARCHAR(64)   |  <--- Sanctum Bearer token hash
|     abilities        TEXT          |
|     last_used_at     TIMESTAMP     |
|     created_at       TIMESTAMP     |
|     updated_at       TIMESTAMP     |
+------------------------------------+
```

---

## 2. Table Specifications

### 2.1 Table: `users`
Stores authorized clinical staff and system operators with role-based access control.

| Column | Type | Nullable | Key | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `BIGINT UNSIGNED` | No | PK | Auto-incrementing primary key |
| `name` | `VARCHAR(255)` | No | | Full name of the user |
| `email` | `VARCHAR(255)` | No | UNIQUE | Corporate login email address |
| `password` | `VARCHAR(255)` | No | | Bcrypt password hash |
| `role` | `ENUM('admin', 'viewer', 'engineer')` | No | | User access tier |
| `created_at` | `TIMESTAMP` | Yes | | Account creation timestamp |
| `updated_at` | `TIMESTAMP` | Yes | | Account update timestamp |

### 2.2 Table: `cases`
Stores medical implant cases from draft intake through surgical completion.

| Column | Type | Nullable | Key | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `BIGINT UNSIGNED` | No | PK | Auto-incrementing primary key |
| `case_number` | `VARCHAR(64)` | No | UNIQUE | Case identifier (e.g. `CASE-0001`) |
| `patient_reference` | `VARCHAR(64)` | No | | Dummy anonymous patient ID (e.g. `PAT-4821`) |
| `surgeon_name` | `VARCHAR(255)` | No | | Primary operating surgeon name |
| `implant_type` | `VARCHAR(255)` | No | | Device specification (e.g. `Cranial Mesh`) |
| `status` | `ENUM('Draft', 'Planning', 'In Review', 'Approved', 'Completed', 'Cancelled')` | No | INDEX | Current status in lifecycle |
| `priority` | `ENUM('Low', 'Medium', 'High')` | No | | Case urgency triage classification |
| `surgery_date` | `DATE` | Yes | | Scheduled surgical operating room date |
| `created_by` | `BIGINT UNSIGNED` | No | FK | References `users(id)` ON DELETE RESTRICT |
| `notes` | `TEXT` | Yes | | Surgical notes and device specifications |
| `created_at` | `TIMESTAMP` | Yes | | Automatic record creation timestamp |
| `updated_at` | `TIMESTAMP` | Yes | | Automatic record modification timestamp |

---

## 3. Indexes & Constraints

1. **Unique Index on `cases.case_number`:**  
   `CREATE UNIQUE INDEX cases_case_number_unique ON cases (case_number);`  
   Guarantees that no duplicate implant case identifiers can ever be inserted into the system.

2. **Index on `cases.status`:**  
   `CREATE INDEX cases_status_index ON cases (status);`  
   Optimizes dashboard count aggregations (`Total`, `Planning`, `In Review`, `Approved`, `Completed`) and status filtering in case list views.

3. **Foreign Key Constraint:**  
   `ALTER TABLE cases ADD CONSTRAINT fk_cases_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT;`  
   Enforces relational integrity ensuring every case traces to an authenticated user.

---

## 4. Seeding Strategy
- **Users Seeded:**
  - 1 Admin: `admin@jajalmedical.com`
  - 1 Viewer: `viewer@jajalmedical.com`
  - 1 Engineer: `engineer@jajalmedical.com`
- **Cases Seeded:** 24 realistic dummy cases covering cranial, orthopedic (hip, knee, shoulder), spinal, and maxillofacial implant devices across all status and priority levels.
