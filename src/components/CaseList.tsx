import React, { useState, useRef, useEffect } from 'react';
import { CasePriority, CaseStatus, MedicalCase, PaginationMeta, User } from '../types.ts';
import { 
  Search, 
  ArrowUpDown, 
  Eye, 
  Edit3, 
  Trash2, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  AlertCircle, 
  LayoutGrid, 
  Table as TableIcon,
  X,
  Filter,
  ArrowUp,
  ArrowDown,
  Stethoscope,
  Lock,
  RotateCcw
} from 'lucide-react';

interface CaseListProps {
  user: User;
  cases: MedicalCase[];
  pagination: PaginationMeta;
  search: string;
  setSearch: (s: string) => void;
  statusFilter: string;
  setStatusFilter: (s: string) => void;
  priorityFilter: string;
  setPriorityFilter: (p: string) => void;
  sortBy: string;
  setSortBy: (sb: string) => void;
  sortDir: 'asc' | 'desc';
  setSortDir: (sd: 'asc' | 'desc') => void;
  onPageChange: (page: number) => void;
  onViewCase: (c: MedicalCase) => void;
  onEditCase: (c: MedicalCase) => void;
  onDeleteCase: (c: MedicalCase) => void;
  onCreateCase: () => void;
  isLoading: boolean;
}

export const CaseList: React.FC<CaseListProps> = ({
  user,
  cases,
  pagination,
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  priorityFilter,
  setPriorityFilter,
  sortBy,
  setSortBy,
  sortDir,
  setSortDir,
  onPageChange,
  onViewCase,
  onEditCase,
  onDeleteCase,
  onCreateCase,
  isLoading,
}) => {
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const canCreateOrEdit = user.role === 'admin' || user.role === 'engineer';
  const canDelete = user.role === 'admin';

  // Keyboard shortcut '/' to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDir('asc');
    }
  };

  const statusQuickFilters = [
    { label: 'All Cases', value: 'All' },
    { label: 'Planning', value: 'Planning' },
    { label: 'In Review', value: 'In Review' },
    { label: 'Approved', value: 'Approved' },
    { label: 'Completed', value: 'Completed' },
    { label: 'Draft', value: 'Draft' },
    { label: 'Cancelled', value: 'Cancelled' },
  ];

  const renderStatusBadge = (status: CaseStatus) => {
    switch (status) {
      case 'Approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Approved</span>
          </span>
        );
      case 'In Review':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>In Review</span>
          </span>
        );
      case 'Planning':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
            <span>Planning</span>
          </span>
        );
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-teal-50 text-teal-700 border border-teal-200">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
            <span>Completed</span>
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <span>Cancelled</span>
          </span>
        );
      case 'Draft':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-zinc-100 text-zinc-700 border border-zinc-200">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
            <span>Draft</span>
          </span>
        );
    }
  };

  const renderPriorityBadge = (priority: CasePriority) => {
    switch (priority) {
      case 'High':
        return (
          <span className="inline-block px-2 py-0.5 rounded-md text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            High
          </span>
        );
      case 'Medium':
        return (
          <span className="inline-block px-2 py-0.5 rounded-md text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
            Medium
          </span>
        );
      case 'Low':
      default:
        return (
          <span className="inline-block px-2 py-0.5 rounded-md text-[11px] font-normal bg-zinc-100 text-zinc-600 border border-zinc-200">
            Low
          </span>
        );
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in">
      {/* Search, Filter & Actions Control Strip */}
      <div className="bg-white rounded-xl p-4 sm:p-5 border border-zinc-200/90 shadow-2xs space-y-4">
        {/* Top line: Title, Total Count & Primary Create Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-zinc-900 tracking-tight flex items-center gap-2">
              <span>Implant Case Directory</span>
              <span className="text-xs font-mono font-medium text-teal-700 bg-teal-50 border border-teal-200/80 px-2 py-0.5 rounded">
                {pagination.total} cases
              </span>
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Browse, filter, and track custom surgical implants across clinical stages.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Switcher */}
            <div className="flex items-center bg-zinc-100 p-0.5 rounded-lg border border-zinc-200">
              <button
                onClick={() => setViewMode('table')}
                title="Table view"
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'table' ? 'bg-white text-zinc-900 shadow-2xs' : 'text-zinc-500 hover:text-zinc-900'
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('cards')}
                title="Card grid view"
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'cards' ? 'bg-white text-zinc-900 shadow-2xs' : 'text-zinc-500 hover:text-zinc-900'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
            </div>

            {canCreateOrEdit && (
              <button
                onClick={onCreateCase}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-semibold text-xs transition-all shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Case</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
          {/* Search bar with instant clear and shortcut hint */}
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search by case number, surgeon, or patient code... (Press '/' to focus)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs rounded-lg border border-zinc-200 bg-zinc-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900 transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-2.5 text-zinc-400 hover:text-zinc-700"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Priority Filter */}
          <div className="sm:col-span-3">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 bg-zinc-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900 font-medium text-zinc-800"
            >
              <option value="All">All Priorities</option>
              <option value="High">High Urgency</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>
          </div>

          {/* Sort By selector */}
          <div className="sm:col-span-3 flex items-center gap-1.5">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 bg-zinc-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900 font-medium text-zinc-800"
            >
              <option value="id">Sort by ID</option>
              <option value="case_number">Sort by Case No</option>
              <option value="surgery_date">Sort by Surgery Date</option>
              <option value="surgeon_name">Sort by Surgeon</option>
            </select>

            <button
              onClick={() => setSortDir(sortDir === 'asc' ? 'desc' : 'asc')}
              title={`Sorting ${sortDir.toUpperCase()}`}
              className="p-2 rounded-lg border border-zinc-200 hover:bg-zinc-50 text-zinc-700 transition-colors shrink-0"
            >
              {sortDir === 'asc' ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Status Filter Segmented Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1 border-t border-zinc-100">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider shrink-0 mr-1 hidden sm:inline">
            Status:
          </span>
          {statusQuickFilters.map((tab) => {
            const isActive = statusFilter === tab.value;
            let activeColorClass = 'bg-slate-900 text-white shadow-2xs font-semibold';
            if (tab.value === 'Planning') activeColorClass = 'bg-sky-600 text-white shadow-2xs font-semibold';
            if (tab.value === 'In Review') activeColorClass = 'bg-amber-600 text-white shadow-2xs font-semibold';
            if (tab.value === 'Approved') activeColorClass = 'bg-emerald-600 text-white shadow-2xs font-semibold';
            if (tab.value === 'Completed') activeColorClass = 'bg-teal-600 text-white shadow-2xs font-semibold';
            if (tab.value === 'Cancelled') activeColorClass = 'bg-rose-600 text-white shadow-2xs font-semibold';

            return (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? activeColorClass
                    : 'bg-zinc-100 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/70'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content: Table or Cards View */}
      {isLoading ? (
        <div className="bg-white rounded-xl border border-zinc-200/90 p-12 text-center shadow-2xs">
          <div className="inline-block animate-spin w-6 h-6 border-2 border-zinc-900 border-t-transparent rounded-full mb-3" />
          <p className="text-xs text-zinc-500">Loading implant cases from database...</p>
        </div>
      ) : cases.length === 0 ? (
        <div className="bg-white rounded-xl border border-zinc-200/90 p-12 text-center shadow-2xs space-y-3">
          <AlertCircle className="w-8 h-8 text-zinc-400 mx-auto" />
          <div>
            <h3 className="text-sm font-semibold text-zinc-900">No cases found</h3>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
              No medical cases matched your active search query or status filter.
            </p>
          </div>
          {(search || statusFilter !== 'All' || priorityFilter !== 'All') && (
            <button
              onClick={() => {
                setSearch('');
                setStatusFilter('All');
                setPriorityFilter('All');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-100 hover:bg-zinc-200 text-zinc-800 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset all filters</span>
            </button>
          )}
        </div>
      ) : viewMode === 'table' ? (
        /* High-Density Clean Table */
        <div className="bg-white rounded-xl border border-zinc-200/90 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50/75 text-zinc-500 font-semibold text-[11px]">
                  <th 
                    onClick={() => handleSort('case_number')}
                    className="py-3 px-4 cursor-pointer hover:text-zinc-900 select-none whitespace-nowrap"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Case Number</span>
                      <ArrowUpDown className="w-3 h-3 text-zinc-400" />
                    </div>
                  </th>
                  <th className="py-3 px-4 font-semibold whitespace-nowrap">Patient Ref</th>
                  <th className="py-3 px-4 font-semibold">Implant Specification</th>
                  <th 
                    onClick={() => handleSort('surgeon_name')}
                    className="py-3 px-4 cursor-pointer hover:text-zinc-900 select-none whitespace-nowrap"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Surgeon</span>
                      <ArrowUpDown className="w-3 h-3 text-zinc-400" />
                    </div>
                  </th>
                  <th className="py-3 px-4 font-semibold whitespace-nowrap">Status</th>
                  <th className="py-3 px-4 font-semibold whitespace-nowrap">Priority</th>
                  <th 
                    onClick={() => handleSort('surgery_date')}
                    className="py-3 px-4 cursor-pointer hover:text-zinc-900 select-none whitespace-nowrap"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Surgery Date</span>
                      <ArrowUpDown className="w-3 h-3 text-zinc-400" />
                    </div>
                  </th>
                  <th className="py-3 px-4 font-semibold text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {cases.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-zinc-50/70 transition-colors group cursor-pointer"
                    onClick={() => onViewCase(c)}
                  >
                    <td className="py-3 px-4 font-mono font-bold text-zinc-900 whitespace-nowrap">
                      {c.case_number}
                    </td>
                    <td className="py-3 px-4 font-mono text-zinc-500 whitespace-nowrap">
                      {c.patient_reference}
                    </td>
                    <td className="py-3 px-4 text-zinc-800 font-medium max-w-[240px] truncate" title={c.implant_type}>
                      {c.implant_type}
                    </td>
                    <td className="py-3 px-4 text-zinc-600 whitespace-nowrap">
                      {c.surgeon_name}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {renderStatusBadge(c.status)}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {renderPriorityBadge(c.priority)}
                    </td>
                    <td className="py-3 px-4 font-mono text-zinc-500 whitespace-nowrap">
                      {c.surgery_date || <span className="text-zinc-300 italic">Not scheduled</span>}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onViewCase(c)}
                          className="p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-md transition-colors"
                          title="View case details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {canCreateOrEdit ? (
                          <button
                            onClick={() => onEditCase(c)}
                            className="p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-md transition-colors"
                            title="Edit case"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            disabled
                            className="p-1.5 text-zinc-300 cursor-not-allowed"
                            title="Viewer role cannot edit cases"
                          >
                            <Lock className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {canDelete ? (
                          <button
                            onClick={() => onDeleteCase(c)}
                            className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                            title="Delete case (Admin only)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Visual Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {cases.map((c) => (
            <div
              key={c.id}
              onClick={() => onViewCase(c)}
              className="bg-white rounded-xl border border-zinc-200/90 p-4 shadow-2xs hover:border-zinc-300 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-zinc-900">
                    {c.case_number}
                  </span>
                  <div>
                    {renderStatusBadge(c.status)}
                  </div>
                </div>

                <h4 className="text-xs font-semibold text-zinc-900 line-clamp-2 mb-1.5">
                  {c.implant_type}
                </h4>

                <div className="space-y-1.5 text-xs text-zinc-500">
                  <div className="flex items-center justify-between">
                    <span>Surgeon:</span>
                    <span className="font-medium text-zinc-800">{c.surgeon_name}</span>
                  </div>
                  <div className="flex items-center justify-between font-mono text-[11px]">
                    <span>Patient Code:</span>
                    <span>{c.patient_reference}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Priority:</span>
                    <div>{renderPriorityBadge(c.priority)}</div>
                  </div>
                  {c.surgery_date && (
                    <div className="flex items-center justify-between font-mono text-[11px]">
                      <span>Surgery Date:</span>
                      <span>{c.surgery_date}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-zinc-100 flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => onViewCase(c)}
                  className="text-xs text-zinc-700 hover:text-zinc-950 font-medium hover:underline"
                >
                  View Details →
                </button>

                <div className="flex items-center gap-1">
                  {canCreateOrEdit && (
                    <button
                      onClick={() => onEditCase(c)}
                      className="p-1 text-zinc-500 hover:text-zinc-900 rounded"
                      title="Edit"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {canDelete && (
                    <button
                      onClick={() => onDeleteCase(c)}
                      className="p-1 text-zinc-400 hover:text-rose-600 rounded"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Footer */}
      <div className="bg-white rounded-xl p-3.5 sm:p-4 border border-zinc-200/90 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-500">
        <div>
          Showing <span className="font-semibold text-zinc-900 font-mono">{pagination.from}</span> to{' '}
          <span className="font-semibold text-zinc-900 font-mono">{pagination.to}</span> of{' '}
          <span className="font-semibold text-zinc-900 font-mono">{pagination.total}</span> cases
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className="px-3 py-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 disabled:opacity-40 text-zinc-700 font-medium transition-colors flex items-center gap-1"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          <span className="px-2 font-mono text-zinc-700">
            Page {pagination.page} of {pagination.last_page}
          </span>

          <button
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.last_page}
            className="px-3 py-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 disabled:opacity-40 text-zinc-700 font-medium transition-colors flex items-center gap-1"
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
