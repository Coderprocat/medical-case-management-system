import React, { useState } from 'react';
import { MedicalCase, User } from '../types.ts';
import { 
  X, 
  Edit3, 
  Trash2, 
  Calendar, 
  User as UserIcon, 
  Clock, 
  ArrowRight,
  Copy,
  Check,
  Stethoscope,
  Layers,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  FileText
} from 'lucide-react';

interface CaseDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseItem: MedicalCase | null;
  currentUser: User;
  onEdit: (c: MedicalCase) => void;
  onDelete: (c: MedicalCase) => void;
  onQuickStatusChange?: (c: MedicalCase, newStatus: MedicalCase['status']) => void;
}

export const CaseDetailModal: React.FC<CaseDetailModalProps> = ({
  isOpen,
  onClose,
  caseItem,
  currentUser,
  onEdit,
  onDelete,
  onQuickStatusChange,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen || !caseItem) return null;

  const canEdit = currentUser.role === 'admin' || currentUser.role === 'engineer';
  const canDelete = currentUser.role === 'admin';

  const stages: MedicalCase['status'][] = ['Draft', 'Planning', 'In Review', 'Approved', 'Completed'];
  const currentStageIndex = stages.indexOf(caseItem.status);
  const nextStage = currentStageIndex >= 0 && currentStageIndex < stages.length - 1 ? stages[currentStageIndex + 1] : null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const getStatusDot = (status: MedicalCase['status']) => {
    switch (status) {
      case 'Approved':
        return 'bg-emerald-500';
      case 'In Review':
        return 'bg-amber-500';
      case 'Planning':
        return 'bg-sky-500';
      case 'Completed':
        return 'bg-zinc-900';
      case 'Cancelled':
        return 'bg-rose-500';
      case 'Draft':
      default:
        return 'bg-zinc-400';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/40 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-xl shadow-xl border border-zinc-200 w-full max-w-xl max-h-[92dvh] flex flex-col overflow-hidden">
        {/* Header with Case Moniker and Actions */}
        <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between shrink-0 bg-zinc-50/50">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 bg-zinc-100 border border-zinc-200 px-2 py-0.5 rounded">
              <span className="font-mono text-xs font-bold text-zinc-900">
                {caseItem.case_number}
              </span>
              <button
                onClick={() => handleCopy(caseItem.case_number, 'case_num')}
                className="text-zinc-400 hover:text-zinc-700 p-0.5 rounded"
                title="Copy Case Number"
              >
                {copiedKey === 'case_num' ? (
                  <Check className="w-3 h-3 text-emerald-600" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </button>
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              <span className={`w-2 h-2 rounded-full ${getStatusDot(caseItem.status)}`} />
              <span className="font-medium text-zinc-800">{caseItem.status}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {canEdit && (
              <button
                onClick={() => {
                  onClose();
                  onEdit(caseItem);
                }}
                className="px-2.5 py-1.5 text-xs text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 border border-zinc-200 rounded-lg transition-colors flex items-center gap-1 font-medium"
                title="Edit case"
              >
                <Edit3 className="w-3.5 h-3.5 text-zinc-500" />
                <span>Edit</span>
              </button>
            )}

            {canDelete && (
              <button
                onClick={() => {
                  onClose();
                  onDelete(caseItem);
                }}
                className="px-2.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors flex items-center gap-1 font-medium"
                title="Delete case (Admin only)"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                <span>Delete</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded-lg hover:bg-zinc-100 transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Stepper with 1-Click Fast Stage Advance */}
          <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase font-semibold text-zinc-400 tracking-wider">
                Lifecycle Progression
              </span>
              {nextStage && canEdit && onQuickStatusChange && (
                <button
                  onClick={() => onQuickStatusChange(caseItem, nextStage)}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-white bg-zinc-900 hover:bg-zinc-800 px-2.5 py-1 rounded-md transition-colors shadow-2xs"
                >
                  <span>Advance to {nextStage}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-5 gap-1.5 text-center">
              {stages.map((stage, idx) => {
                const isPassed = currentStageIndex >= idx;
                const isCurrent = currentStageIndex === idx;
                return (
                  <div
                    key={stage}
                    className={`py-2 px-1 rounded-lg border text-[11px] font-medium transition-colors ${
                      isCurrent
                        ? 'bg-zinc-900 text-white border-zinc-900 font-semibold shadow-2xs'
                        : isPassed
                        ? 'bg-white text-zinc-700 border-zinc-200'
                        : 'bg-zinc-100 text-zinc-400 border-transparent'
                    }`}
                  >
                    {stage}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Clinical Case Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="p-3 rounded-lg border border-zinc-100 bg-white">
              <span className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider block mb-1">
                Patient Reference (Dummy Code)
              </span>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-zinc-900">
                  {caseItem.patient_reference}
                </span>
                <button
                  onClick={() => handleCopy(caseItem.patient_reference, 'pat_ref')}
                  className="text-zinc-400 hover:text-zinc-700"
                  title="Copy patient code"
                >
                  {copiedKey === 'pat_ref' ? (
                    <Check className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>
            </div>

            <div className="p-3 rounded-lg border border-zinc-100 bg-white">
              <span className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider block mb-1">
                Operating Surgeon
              </span>
              <span className="font-medium text-xs text-zinc-900 block">
                {caseItem.surgeon_name}
              </span>
            </div>

            <div className="p-3 rounded-lg border border-zinc-100 bg-white sm:col-span-2">
              <span className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider block mb-1">
                Implant Specification & Design Type
              </span>
              <span className="font-semibold text-xs text-zinc-900 block">
                {caseItem.implant_type}
              </span>
            </div>

            <div className="p-3 rounded-lg border border-zinc-100 bg-white">
              <span className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider block mb-1">
                Clinical Urgency
              </span>
              <span className="font-medium text-xs text-zinc-900 block">
                {caseItem.priority} Priority
              </span>
            </div>

            <div className="p-3 rounded-lg border border-zinc-100 bg-white">
              <span className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider block mb-1">
                Scheduled Surgery Date
              </span>
              <span className="font-mono text-xs text-zinc-900 block">
                {caseItem.surgery_date || 'Not scheduled'}
              </span>
            </div>
          </div>

          {/* Clinical Notes Card */}
          <div className="p-3.5 rounded-xl border border-zinc-200 bg-white">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1 mb-1.5">
              <FileText className="w-3 h-3 text-zinc-400" />
              <span>Surgical & Engineering Notes</span>
            </span>
            <p className="text-zinc-700 leading-relaxed text-xs">
              {caseItem.notes || 'No surgical or engineering notes logged for this case.'}
            </p>
          </div>

          {/* Audit Trail and Creator Information */}
          <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-zinc-500">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
              <span>Case ID: #{caseItem.id}</span>
              <span aria-hidden="true">·</span>
              <span>Logged by {caseItem.created_by_name || 'System Admin'}</span>
            </div>
            <div className="font-mono text-[10px] text-zinc-400">
              Created: {new Date(caseItem.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-zinc-100 flex items-center justify-between bg-zinc-50/50 shrink-0">
          <span className="text-[10px] text-zinc-400">
            ISO 13485:2016 Device History Record (DHR)
          </span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
