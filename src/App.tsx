import React, { useState, useEffect, useCallback } from 'react';
import { 
  User, 
  MedicalCase, 
  PaginationMeta, 
  DashboardStats 
} from './types.ts';
import { ApiClient } from './services/api.ts';
import { Navbar } from './components/Navbar.tsx';
import { Dashboard } from './components/Dashboard.tsx';
import { CaseList } from './components/CaseList.tsx';
import { CaseFormModal } from './components/CaseFormModal.tsx';
import { CaseDetailModal } from './components/CaseDetailModal.tsx';
import { DeleteConfirmModal } from './components/DeleteConfirmModal.tsx';
import { TestRunnerModal } from './components/TestRunnerModal.tsx';
import { LoginView } from './components/LoginView.tsx';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(ApiClient.getCurrentUser());
  const [activeTab, setActiveTab] = useState<'dashboard' | 'cases' | 'tests'>('dashboard');

  // Cases state
  const [cases, setCases] = useState<MedicalCase[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    per_page: 10,
    last_page: 1,
    from: 0,
    to: 0,
  });
  const [isLoadingCases, setIsLoadingCases] = useState(false);

  // Search & Filters (Section 4.3 and Bonus)
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [sortBy, setSortBy] = useState('id');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // Dashboard Stats state
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    planning: 0,
    in_review: 0,
    approved: 0,
    completed: 0,
    draft: 0,
    cancelled: 0,
    high_priority: 0,
    medium_priority: 0,
    low_priority: 0,
  });

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formInitialCase, setFormInitialCase] = useState<MedicalCase | null>(null);
  const [selectedCaseDetail, setSelectedCaseDetail] = useState<MedicalCase | null>(null);
  const [caseToDelete, setCaseToDelete] = useState<MedicalCase | null>(null);

  // Toast notification state
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 3500);
  };

  // Fetch Cases with filters & pagination
  const fetchCases = useCallback(async (page: number = pagination.page) => {
    if (!currentUser) return;
    setIsLoadingCases(true);

    const res = await ApiClient.getCases({
      page,
      per_page: 10,
      search,
      status: statusFilter,
      priority: priorityFilter,
      sort_by: sortBy,
      sort_dir: sortDir,
    });

    setIsLoadingCases(false);
    if (res.success && res.data) {
      setCases(res.data.cases || []);
      if (res.data.pagination) {
        setPagination(res.data.pagination);
      }
    } else {
      showToast(res.message || 'Failed to load cases', 'error');
    }
  }, [currentUser, pagination.page, search, statusFilter, priorityFilter, sortBy, sortDir]);

  // Fetch Dashboard Stats
  const fetchStats = useCallback(async () => {
    if (!currentUser) return;
    const res = await ApiClient.getDashboardStats();
    if (res.success && res.data) {
      setStats(res.data);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      fetchCases(1);
      fetchStats();
    }
  }, [currentUser, search, statusFilter, priorityFilter, sortBy, sortDir]);

  // Handle Login
  const handleLogin = async (email: string, pass: string) => {
    const res = await ApiClient.login(email, pass);
    if (res.success && res.data?.user) {
      setCurrentUser(res.data.user);
      showToast(`Welcome back, ${res.data.user.name}!`);
      return { success: true };
    }
    return { success: false, message: res.message };
  };

  // Handle Logout
  const handleLogout = async () => {
    await ApiClient.logout();
    setCurrentUser(null);
    showToast('Logged out successfully.');
  };

  // Handle Switch User (for reviewing permissions)
  const handleSwitchUser = (newUser: User) => {
    setCurrentUser(newUser);
    showToast(`Switched active user to ${newUser.name} (${newUser.role.toUpperCase()})`);
    fetchCases(1);
    fetchStats();
  };

  // Handle Reset Database
  const handleResetDatabase = async () => {
    const res = await ApiClient.resetDatabase();
    if (res.success) {
      showToast('Database reset to original 24 seed cases.');
      fetchCases(1);
      fetchStats();
    } else {
      showToast(res.message || 'Reset failed', 'error');
    }
  };

  // Create or Update Case submission
  const handleFormSubmit = async (formData: Partial<MedicalCase>) => {
    if (formInitialCase) {
      // Update
      const res = await ApiClient.updateCase(formInitialCase.id, formData);
      if (res.success) {
        showToast(`Case ${res.data.case_number} updated successfully.`);
        fetchCases();
        fetchStats();
        return { success: true };
      }
      return { success: false, errors: res.errors, message: res.message };
    } else {
      // Create
      const res = await ApiClient.createCase(formData);
      if (res.success) {
        showToast(`Case ${res.data.case_number} created successfully.`);
        fetchCases(1);
        fetchStats();
        return { success: true };
      }
      return { success: false, errors: res.errors, message: res.message };
    }
  };

  // Delete Case confirmation
  const handleConfirmDelete = async (caseId: number) => {
    const res = await ApiClient.deleteCase(caseId);
    if (res.success) {
      showToast('Case deleted successfully.');
      fetchCases();
      fetchStats();
      return { success: true };
    }
    return { success: false, message: res.message };
  };

  // Quick status transition from Case Detail modal
  const handleQuickStatusChange = async (c: MedicalCase, newStatus: MedicalCase['status']) => {
    const res = await ApiClient.updateCase(c.id, {
      ...c,
      status: newStatus,
    });
    if (res.success && res.data) {
      showToast(`Case ${c.case_number} transitioned to ${newStatus}.`);
      setSelectedCaseDetail(res.data);
      fetchCases();
      fetchStats();
    } else {
      showToast(res.message || 'Status transition failed', 'error');
    }
  };

  // If user is not logged in, enforce Section 4.1: "All case pages must be hidden from users who are not logged in."
  if (!currentUser) {
    return <LoginView onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col font-sans text-zinc-900">
      {/* Toast Notification (Minimalist) */}
      {toast && (
        <div
          className={`fixed bottom-4 right-4 z-50 px-3.5 py-2.5 rounded-lg shadow-lg flex items-center space-x-2 text-xs font-medium animate-in slide-in-from-bottom-2 ${
            toast.type === 'success'
              ? 'bg-zinc-900 text-zinc-100 border border-zinc-800'
              : 'bg-rose-900 text-rose-100 border border-rose-800'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Main Navigation Bar */}
      <Navbar
        user={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        onSwitchUser={handleSwitchUser}
        onResetDatabase={handleResetDatabase}
      />

      {/* Main Workspace Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        {activeTab === 'dashboard' && (
          <Dashboard
            user={currentUser}
            stats={stats}
            recentCases={cases}
            onOpenCreateModal={() => {
              setFormInitialCase(null);
              setIsFormModalOpen(true);
            }}
            onSelectCase={(c) => setSelectedCaseDetail(c)}
            onNavigateToCases={(filterStatus) => {
              if (filterStatus && filterStatus !== 'All') {
                setStatusFilter(filterStatus);
              }
              setActiveTab('cases');
            }}
            onNavigateToTests={() => setActiveTab('tests')}
          />
        )}

        {activeTab === 'cases' && (
          <CaseList
            user={currentUser}
            cases={cases}
            pagination={pagination}
            search={search}
            setSearch={setSearch}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            priorityFilter={priorityFilter}
            setPriorityFilter={setPriorityFilter}
            sortBy={sortBy}
            setSortBy={setSortBy}
            sortDir={sortDir}
            setSortDir={setSortDir}
            onPageChange={(page) => fetchCases(page)}
            onViewCase={(c) => setSelectedCaseDetail(c)}
            onEditCase={(c) => {
              setFormInitialCase(c);
              setIsFormModalOpen(true);
            }}
            onDeleteCase={(c) => setCaseToDelete(c)}
            onCreateCase={() => {
              setFormInitialCase(null);
              setIsFormModalOpen(true);
            }}
            isLoading={isLoadingCases}
          />
        )}

        {activeTab === 'tests' && (
          <TestRunnerModal
            onRunComplete={() => {
              fetchCases();
              fetchStats();
            }}
          />
        )}
      </main>

      {/* Reusable Create / Edit Case Modal (Section 4.4) */}
      <CaseFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setFormInitialCase(null);
        }}
        onSubmit={handleFormSubmit}
        initialCase={formInitialCase}
      />

      {/* Case Details Modal (Section 4.5) */}
      <CaseDetailModal
        isOpen={Boolean(selectedCaseDetail)}
        onClose={() => setSelectedCaseDetail(null)}
        caseItem={selectedCaseDetail}
        currentUser={currentUser}
        onEdit={(c) => {
          setSelectedCaseDetail(null);
          setFormInitialCase(c);
          setIsFormModalOpen(true);
        }}
        onDelete={(c) => {
          setSelectedCaseDetail(null);
          setCaseToDelete(c);
        }}
        onQuickStatusChange={handleQuickStatusChange}
      />

      {/* Delete Confirmation Modal (Section 4.5 and Section 6 Role check) */}
      <DeleteConfirmModal
        isOpen={Boolean(caseToDelete)}
        onClose={() => setCaseToDelete(null)}
        caseItem={caseToDelete}
        currentUser={currentUser}
        onConfirmDelete={handleConfirmDelete}
      />
    </div>
  );
}
