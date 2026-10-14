/**
 * Automated Feature Tests for Jajal Medical Case Management
 * Section 7: Testing Requirements
 * 
 * Run with: npm test (or npx tsx tests/feature_tests.ts)
 */

import { SEED_USERS, INITIAL_CASES } from '../src/data/initialData.ts';

const BASE_URL = process.env.TEST_BASE_URL || 'http://127.0.0.1:3000';

interface TestResult {
  num: number;
  name: string;
  passed: boolean;
  expected: string;
  actual: string;
  notes: string;
}

const testResults: TestResult[] = [];

async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const url = `${BASE_URL}${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(options.headers || {}),
      },
    });
    const data = await res.json().catch(() => null);
    return { status: res.status, data };
  } catch (err: any) {
    return { status: 500, data: { error: err.message } };
  }
}

async function runSuite() {
  console.log('================================================================');
  console.log('   JAJAL MEDICAL CASE MANAGEMENT — AUTOMATED FEATURE TESTS       ');
  console.log(`   Target Server: ${BASE_URL}`);
  console.log('================================================================\n');

  let adminToken = '';
  let viewerToken = '';
  let engineerToken = '';
  let createdCaseId = 0;
  const testCaseNumber = `TEST-${Date.now().toString().slice(-5)}`;

  // TEST 1: Valid login succeeds
  {
    const res = await apiRequest('/api/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'admin@jajalmedical.com', password: 'Secret123!' }),
    });
    const passed = res.status === 200 && res.data?.success === true && !!res.data?.data?.token;
    if (passed) adminToken = res.data.data.token;
    testResults.push({
      num: 1,
      name: 'Valid login succeeds',
      passed,
      expected: 'HTTP 200 + Sanctum Bearer Token',
      actual: `HTTP ${res.status} (token: ${adminToken ? 'Received' : 'None'})`,
      notes: passed ? 'User logged in and received Bearer token.' : 'Login failed.',
    });
  }

  // TEST 2: Invalid login is rejected
  {
    const res = await apiRequest('/api/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'admin@jajalmedical.com', password: 'IncorrectPassword999' }),
    });
    const passed = res.status === 401 && res.data?.success === false;
    testResults.push({
      num: 2,
      name: 'Invalid login is rejected',
      passed,
      expected: 'HTTP 401 Unauthorized',
      actual: `HTTP ${res.status}`,
      notes: passed ? 'Rejected with 401 Unauthorized.' : 'Expected 401 rejection.',
    });
  }

  // TEST 3: A guest cannot open case pages or APIs (401)
  {
    const res = await apiRequest('/api/cases', {
      method: 'GET',
    });
    const passed = res.status === 401 && res.data?.success === false;
    testResults.push({
      num: 3,
      name: 'Guest cannot access cases (401)',
      passed,
      expected: 'HTTP 401 Unauthorized',
      actual: `HTTP ${res.status}`,
      notes: passed ? 'Middleware successfully barred guest request.' : 'Guest access allowed.',
    });
  }

  // TEST 4: Admin can create a case
  {
    const res = await apiRequest('/api/cases', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken || 'admin-test-token-sanctum-001'}` },
      body: JSON.stringify({
        case_number: testCaseNumber,
        patient_reference: 'PAT-UNIT-TEST',
        surgeon_name: 'Dr. Katherine Bell',
        implant_type: 'Titanium Mandibular Plate',
        status: 'Planning',
        priority: 'High',
        surgery_date: '2026-11-15',
        notes: 'Created via automated CLI feature test runner.',
      }),
    });
    const passed = res.status === 201 && res.data?.success === true && !!res.data?.data?.id;
    if (passed) createdCaseId = res.data.data.id;
    testResults.push({
      num: 4,
      name: 'Admin can create a case',
      passed,
      expected: 'HTTP 201 Created',
      actual: `HTTP ${res.status} (Case ID: ${createdCaseId || 'N/A'})`,
      notes: passed ? `Case #${createdCaseId} created successfully.` : 'Admin creation failed.',
    });
  }

  // TEST 5: Creating a case with a duplicate Case Number fails (422)
  {
    const res = await apiRequest('/api/cases', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken || 'admin-test-token-sanctum-001'}` },
      body: JSON.stringify({
        case_number: testCaseNumber, // Duplicate!
        patient_reference: 'PAT-DUP',
        surgeon_name: 'Dr. Other',
        implant_type: 'Knee Joint',
        status: 'Draft',
        priority: 'Medium',
      }),
    });
    const passed = res.status === 422 && res.data?.success === false && !!res.data?.errors?.case_number;
    testResults.push({
      num: 5,
      name: 'Creating case with duplicate Case Number fails (422)',
      passed,
      expected: 'HTTP 422 Unprocessable Content + errors.case_number',
      actual: `HTTP ${res.status} (errors: ${JSON.stringify(res.data?.errors || {})})`,
      notes: passed ? 'Uniqueness validation enforced correctly.' : 'Duplicate was not rejected with 422.',
    });
  }

  // Login as Viewer for TEST 6
  {
    const vRes = await apiRequest('/api/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'viewer@jajalmedical.com', password: 'Secret123!' }),
    });
    if (vRes.status === 200 && vRes.data?.data?.token) {
      viewerToken = vRes.data.data.token;
    }
  }

  // TEST 6: Viewer cannot delete a case (403)
  {
    const res = await apiRequest(`/api/cases/${createdCaseId || 1}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${viewerToken || 'viewer-test-token-sanctum-002'}` },
    });
    const passed = res.status === 403 && res.data?.success === false;
    testResults.push({
      num: 6,
      name: 'Viewer cannot delete a case (403)',
      passed,
      expected: 'HTTP 403 Forbidden',
      actual: `HTTP ${res.status}`,
      notes: passed ? 'CasePolicy blocked Viewer delete request with 403.' : 'Viewer delete was not blocked with 403.',
    });
  }

  // BONUS TEST 7: Engineer can edit cases but cannot delete (403)
  {
    const delRes = await apiRequest(`/api/cases/${createdCaseId || 1}`, {
      method: 'DELETE',
      headers: { Authorization: 'Bearer engineer-test-token-sanctum-003' },
    });
    const putRes = await apiRequest(`/api/cases/${createdCaseId || 1}`, {
      method: 'PUT',
      headers: { Authorization: 'Bearer engineer-test-token-sanctum-003' },
      body: JSON.stringify({
        case_number: testCaseNumber,
        patient_reference: 'PAT-UNIT-TEST-EDITED',
        surgeon_name: 'Dr. Katherine Bell',
        implant_type: 'Titanium Mandibular Plate',
        status: 'In Review',
        priority: 'High',
        surgery_date: '2026-11-15',
      }),
    });
    const passed = delRes.status === 403 && putRes.status === 200;
    testResults.push({
      num: 7,
      name: 'Bonus: Engineer role permission boundary',
      passed,
      expected: 'DELETE returns 403 / PUT returns 200',
      actual: `DELETE: ${delRes.status} / PUT: ${putRes.status}`,
      notes: passed ? 'Engineer edit allowed, delete blocked with 403.' : 'Engineer role boundary failed.',
    });
  }

  // Clean up test case using Admin token
  if (createdCaseId) {
    await apiRequest(`/api/cases/${createdCaseId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken || 'admin-test-token-sanctum-001'}` },
    });
  }

  // Display formatted results
  let allPassed = true;
  for (const r of testResults) {
    const statusIcon = r.passed ? '✓ PASSED' : '✗ FAILED';
    console.log(`[${statusIcon}] Test ${r.num}: ${r.name}`);
    console.log(`         Expected: ${r.expected}`);
    console.log(`         Actual:   ${r.actual}`);
    console.log(`         Notes:    ${r.notes}\n`);
    if (!r.passed) allPassed = false;
  }

  console.log('----------------------------------------------------------------');
  const passedCount = testResults.filter((r) => r.passed).length;
  console.log(`Summary: ${passedCount}/${testResults.length} tests passed.`);
  console.log('----------------------------------------------------------------\n');

  if (!allPassed) {
    process.exit(1);
  }
}

runSuite();
