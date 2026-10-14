import React from 'react';
import { DashboardStats, MedicalCase, User } from '../types.ts';
import { 
  Activity, 
  Clock, 
  FileCheck, 
  CheckCircle2, 
  Plus, 
  ChevronRight, 
  Calendar,
  AlertTriangle,
  Stethoscope,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  FileText
} from 'lucide-react';

interface DashboardProps {
  user: User;
  stats: DashboardStats;
  recentCases: MedicalCase[];
  onOpenCreateModal: () => void;
  onSelectCase: (c: MedicalCase) => void;
  onNavigateToCases: (filterStatus?: string) => void;
  onNavigateToTests: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  user,
  stats,
  recentCases,
  onOpenCreateModal,
  onSelectCase,
  onNavigateToCases,
  onNavigateToTests,
}) => {
  const canCreate = user.role === 'admin' || user.role === 'engineer';

  const stages = [
    { 
      label: 'Draft', 
      count: stats.draft, 
      desc: 'Initial intake & CT scan', 
      dot: 'bg-zinc-400',
      badgeClass: 'border-zinc-200/80 bg-zinc-50/70 hover:bg-zinc-100/70 text-zinc-900',
      numColor: 'text-zinc-800'
    },
    { 
      label: 'Planning', 
      count: stats.planning, 
      desc: '3D CAD design & sizing', 
      dot: 'bg-sky-500',
      badgeClass: 'border-sky-200/80 bg-sky-50/50 hover:bg-sky-100/60 text-sky-950',
      numColor: 'text-sky-700'
    },
    { 
      label: 'In Review', 
      count: stats.in_review, 
      desc: 'Surgeon clinical review', 
      dot: 'bg-amber-500',
      badgeClass: 'border-amber-200/80 bg-amber-50/50 hover:bg-amber-100/60 text-amber-950',
      numColor: 'text-amber-700'
    },
    { 
      label: 'Approved', 
      count: stats.approved, 
      desc: 'Sterilization & tray prep', 
      dot: 'bg-emerald-500',
      badgeClass: 'border-emerald-200/80 bg-emerald-50/50 hover:bg-emerald-100/60 text-emerald-950',
      numColor: 'text-emerald-700'
    },
    { 
      label: 'Completed', 
      count: stats.completed, 
      desc: 'Successfully implanted in OR', 
      dot: 'bg-teal-500',
      badgeClass: 'border-teal-200/80 bg-teal-50/50 hover:bg-teal-100/60 text-teal-950',
      numColor: 'text-teal-700'
    },
  ];

  // High urgency cases for immediate clinician triage
  const highPriorityCases = recentCases.filter((c) => c.priority === 'High').slice(0, 3);

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Refined Welcome & Overview Bar */}
      <div className="bg-white rounded-xl border border-zinc-200/90 p-5 sm:p-6 shadow-2xs relative overflow-hidden">
        {/* Subtle decorative color flare */}
        <div className="absolute top-0 right-0 w-80 h-32 bg-gradient-to-bl from-teal-100/40 via-cyan-50/20 to-transparent pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <span className="font-semibold text-teal-700 bg-teal-50 border border-teal-200/80 px-2 py-0.5 rounded uppercase tracking-wide text-[10px]">
                {user.role} role
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-medium text-zinc-800">{user.name}</span>
              <span aria-hidden="true">·</span>
              <span>Jajal Medical Implant Operations</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900">
              Implant Operations Overview
            </h1>
            <p className="text-xs text-zinc-500 max-w-2xl leading-relaxed">
              Real-time monitoring of custom patient-specific implants across surgical planning, CAD modeling, surgeon review, and operating room delivery.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 pt-2 lg:pt-0">
            {canCreate ? (
              <button
                onClick={onOpenCreateModal}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-semibold text-xs transition-all shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>New Case Intake</span>
              </button>
            ) : (
              <div className="text-xs text-zinc-500 bg-zinc-50 border border-zinc-200 px-3 py-1.5 rounded-lg font-medium">
                Viewer Role (Read-Only)
              </div>
            )}

            <button
              onClick={onNavigateToTests}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white hover:bg-emerald-50/50 border border-emerald-200/80 text-emerald-700 font-medium text-xs transition-colors shadow-2xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Run Automated Tests</span>
            </button>
          </div>
        </div>

        {/* Regulatory Pipeline Stages (Interactive filter shortcuts) */}
        <div className="mt-6 pt-5 border-t border-zinc-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              Surgical Implant Lifecycle Pipeline
            </span>
            <span className="text-[11px] text-zinc-400">Click any stage to filter directory</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {stages.map((stage) => (
              <button
                key={stage.label}
                onClick={() => onNavigateToCases(stage.label)}
                className={`text-left p-3.5 rounded-xl border transition-all group shadow-2xs ${stage.badgeClass}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold group-hover:underline">
                    {stage.label}
                  </span>
                  <span className={`w-2 h-2 rounded-full ${stage.dot}`} />
                </div>
                <div className={`text-xl font-bold font-mono tabular-nums ${stage.numColor}`}>
                  {stage.count}
                </div>
                <div className="text-[10px] text-zinc-500 truncate mt-0.5">
                  {stage.desc}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Two-Column Grid: Urgent Triage Alert & Key Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Urgent & Trauma Priority Panel (1 column) */}
        <div className="bg-white rounded-xl border border-zinc-200/90 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                  Urgent Priority Cases
                </h3>
              </div>
              <span className="text-xs font-mono font-semibold text-zinc-700 bg-zinc-100 px-2 py-0.5 rounded">
                {stats.high_priority} active
              </span>
            </div>
            <p className="text-xs text-zinc-500 mb-3">
              Trauma or expedited cases requiring expedited surgical planning or sterilization signoff.
            </p>

            <div className="space-y-2">
              {highPriorityCases.length > 0 ? (
                highPriorityCases.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => onSelectCase(c)}
                    className="p-3 rounded-lg border border-zinc-200/70 hover:border-zinc-300 hover:bg-zinc-50/60 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-zinc-900">
                        {c.case_number}
                      </span>
                      <span className="text-[10px] text-zinc-500 font-medium">
                        {c.status}
                      </span>
                    </div>
                    <div className="text-xs text-zinc-700 truncate font-medium mt-1">
                      {c.implant_type}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-zinc-400 mt-1">
                      <span>{c.surgeon_name}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono">{c.patient_reference}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-zinc-400 text-xs">
                  No urgent high-priority cases pending.
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-zinc-100">
            <button
              onClick={() => onNavigateToCases('All')}
              className="text-xs font-medium text-zinc-900 hover:underline flex items-center justify-between w-full"
            >
              <span>View all cases in directory</span>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
            </button>
          </div>
        </div>

        {/* Recent Cases Clinical Table (2 columns) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-zinc-200/90 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-zinc-700" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                  Recent Implant Cases
                </h3>
              </div>
              <button
                onClick={() => onNavigateToCases()}
                className="text-xs text-zinc-600 hover:text-zinc-900 font-medium hover:underline flex items-center gap-1"
              >
                <span>Full Directory ({stats.total})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-100 text-zinc-400 text-[11px] font-semibold">
                    <th className="pb-2 font-medium">Case No</th>
                    <th className="pb-2 font-medium">Implant Specification</th>
                    <th className="pb-2 font-medium">Surgeon</th>
                    <th className="pb-2 font-medium">Status</th>
                    <th className="pb-2 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {recentCases.slice(0, 5).map((c) => (
                    <tr
                      key={c.id}
                      onClick={() => onSelectCase(c)}
                      className="hover:bg-zinc-50/80 cursor-pointer transition-colors group"
                    >
                      <td className="py-2.5 font-mono font-semibold text-zinc-900 whitespace-nowrap">
                        {c.case_number}
                      </td>
                      <td className="py-2.5 text-zinc-700 truncate max-w-[200px]">
                        {c.implant_type}
                      </td>
                      <td className="py-2.5 text-zinc-500 whitespace-nowrap">
                        {c.surgeon_name}
                      </td>
                      <td className="py-2.5 whitespace-nowrap">
                        <span className="font-medium text-zinc-800">
                          {c.status}
                        </span>
                      </td>
                      <td className="py-2.5 text-right whitespace-nowrap">
                        <span className="text-[11px] text-zinc-500 group-hover:text-zinc-900 font-medium group-hover:underline">
                          View details →
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-500">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>IEC 62304 / ISO 13485 medical device compliant audit trail</span>
            </span>
            <span className="font-mono text-zinc-400">Total: {stats.total} cases</span>
          </div>
        </div>
      </div>
    </div>
  );
};
