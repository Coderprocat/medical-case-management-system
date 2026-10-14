import React, { useState } from 'react';
import { MedicalCase, User } from '../types.ts';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseItem: MedicalCase | null;
  currentUser: User;
  onConfirmDelete: (caseId: number) => Promise<{ success: boolean; message?: string }>;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  caseItem,
  currentUser,
  onConfirmDelete,
}) => {
  if (!isOpen || !caseItem) return null;

  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleConfirm = async () => {
    setIsDeleting(true);
    setErrorMessage(null);
    const res = await onConfirmDelete(caseItem.id);
    setIsDeleting(false);

    if (res.success) {
      onClose();
    } else {
      setErrorMessage(res.message || 'Failed to delete case.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-xl shadow-xl border border-zinc-200 w-full max-w-sm overflow-hidden">
        <div className="p-5">
          <div className="flex items-center space-x-2.5 mb-3">
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-900">Delete Case</h3>
              <p className="text-[11px] text-zinc-400">Irreversible action.</p>
            </div>
          </div>

          <p className="text-xs text-zinc-600 mb-3">
            Are you sure you want to delete case <strong className="font-mono text-zinc-900">{caseItem.case_number}</strong>?
          </p>

          <div className="p-2.5 bg-zinc-50 rounded-lg border border-zinc-100 text-[11px] text-zinc-500 mb-4 space-y-0.5">
            <div>Implant: <span className="text-zinc-800">{caseItem.implant_type}</span></div>
            <div>Surgeon: <span className="text-zinc-800">{caseItem.surgeon_name}</span></div>
          </div>

          {errorMessage && (
            <div className="p-2 rounded bg-rose-50 border border-rose-200 text-rose-700 text-xs mb-3">
              {errorMessage}
            </div>
          )}

          <div className="flex items-center justify-end space-x-2">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="px-3 py-1.5 text-xs text-zinc-500 hover:text-zinc-800 transition-colors"
            >
              Cancel
            </button>

            <button
              onClick={handleConfirm}
              disabled={isDeleting}
              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white text-xs font-medium rounded-lg transition-colors flex items-center space-x-1"
            >
              <Trash2 className="w-3 h-3" />
              <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
