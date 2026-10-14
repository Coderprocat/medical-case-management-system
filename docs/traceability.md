# Medical Device Software Traceability Matrix

**Project:** Jajal Medical Implant Case Management System  
**Standard Compliance:** IEC 62304 / ISO 13485 (Medical Device Software Lifecycle)  
**Date:** October 8, 2026  
**Document Ref:** DOC-TRACE-001  

---

### Traceability Overview

In medical device software engineering, every software requirement must have bidirectional traceability linking user/system requirements (input) to corresponding architectural implementation components (output) and automated verification tests.

| ID | Requirement (Input) | Implementation (Output) | Verification (Test) |
| :--- | :--- | :--- | :--- |
| **REQ-001** | Admin and authorized engineers shall be able to create new medical implant cases. | `POST /api/cases` in `server.ts` + `CaseFormModal.tsx` + `authorizeRole(['admin', 'engineer'])` policy. | **Feature Test 4:** Admin creates case returning HTTP `201 Created` with valid case ID and timestamp. |
| **REQ-002** | Case Number shall be unique across the entire medical registry. | Unique DB index on `cases.case_number` + Form Request validation rule rejecting duplicates with HTTP `422`. | **Feature Test 5:** Creating a case with an existing Case Number fails with HTTP `422 Unprocessable Content` and field-level error. |
| **REQ-003** | Only Admin role shall be permitted to delete cases from the system. | `DELETE /api/cases/:id` guarded by `authorizeRole(['admin'])` (Laravel Policy equivalent: `CasePolicy@delete`). | **Feature Test 6:** Viewer delete request is blocked at server level returning HTTP `403 Forbidden`. |
| **REQ-004** | All case data and clinical tracking APIs must be protected from unauthenticated access. | `authenticateToken` middleware validating Sanctum bearer tokens; redirection/blocking for guest requests. | **Feature Test 3:** Guest request without valid Bearer token returns HTTP `401 Unauthorized`. |
| **REQ-005** | On case modification, the Case Number uniqueness rule must ignore the record currently being edited. | Form Request validation rule: `Rule::unique('cases', 'case_number')->ignore($case->id)` in `PUT /api/cases/:id`. | **Feature Test 7:** Editing an existing case keeping its original case number succeeds with HTTP `200 OK`. |
| **REQ-006** | Medical staff shall receive contextual awareness of regional public holidays when scheduling surgeries. | `GET /api/holidays` calling Nager.Date API with a 3.5s connection timeout and graceful offline fallback. | **Integration Test:** Holiday calendar proxy returns upcoming public holidays or graceful fallback cache without blocking form intake. |
| **REQ-007** | Engineer role shall have permission to create and update cases, but must be barred from deleting records. | RBAC permission matrix in `server.ts` granting `['admin', 'engineer']` for POST/PUT and `['admin']` for DELETE. | **Feature Test 7:** Engineer token allows case update (`200 OK`) but returns `403 Forbidden` on case deletion. |
| **REQ-008** | Case list shall support 10-per-page pagination, multi-field search (Case #, Surgeon), and status/priority filtering. | Query builder filtering in `GET /api/cases` with `limit`, `page`, `search`, `status`, `priority`, `sort_by`. | **Component Test:** Case table verifies 10 records per page slice with active status badge filters. |

---

### Verification Summary
- **Total Requirements:** 8  
- **Automated Verification Coverage:** 100%  
- **Regression Execution:** Available via terminal (`npm test` / `tsx tests/feature_tests.ts`) and interactive web UI under the "Automated Tests" tab.
