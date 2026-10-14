import React, { useState, useEffect } from 'react';
import { CasePriority, CaseStatus, MedicalCase, PublicHoliday } from '../types.ts';
import { 
  X, 
  AlertCircle, 
  Sparkles, 
  Calendar, 
  Info, 
  RefreshCw, 
  CheckCircle2, 
  Stethoscope, 
  FileText
} from 'lucide-react';
import { ApiClient } from '../services/api.ts';

interface CaseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: Partial<MedicalCase>) => Promise<{
    success: boolean;
    errors?: Record<string, string[]>;
    message?: string;
  }>;
  initialCase?: MedicalCase | null;
}

const PROCEDURE_TEMPLATES = [
  {
    name: 'Cranial Reconstruction',
    surgeon: 'Dr. Sarah Chen',
    implant: 'Patient-Specific 3D Titanium Cranial Mesh (Frontal/Parietal)',
    status: 'Planning' as CaseStatus,
    priority: 'High' as CasePriority,
    notes: 'Bilateral craniectomy defect following trauma. CAD contoured to mirror contralateral skull curvature.',
  },
  {
    name: 'Knee Arthroplasty',
    surgeon: 'Dr. Marcus Holloway',
    implant: 'Custom CoCr Bicondylar Knee Femoral & Tibial Tray',
    status: 'In Review' as CaseStatus,
    priority: 'Medium' as CasePriority,
    notes: 'Severe valgus deformity (14°). Pre-operative CT anatomical alignment verified with custom resection guides.',
  },
  {
    name: 'Spinal Fusion Cage',
    surgeon: 'Dr. Eleanor Vance',
    implant: 'Porously Textured PEEK Interbody Fusion Cage (L4-L5)',
    status: 'Approved' as CaseStatus,
    priority: 'High' as CasePriority,
    notes: 'Grade II spondylolisthesis. 8° lordotic angle pre-packed with demineralized bone matrix (DBM).',
  },
  {
    name: 'Maxillofacial Plate',
    surgeon: 'Dr. Sarah Chen',
    implant: 'Micro-Vascular Mandibular Reconstruction Titanium Plate',
    status: 'Planning' as CaseStatus,
    priority: 'Medium' as CasePriority,
    notes: 'Segmental mandibular defect. Fibula free flap cutting guide integrated with implant design.',
  },
];

export const CaseFormModal: React.FC<CaseFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialCase,
}) => {
  const isEdit = Boolean(initialCase);

  const [caseNumber, setCaseNumber] = useState('');
  const [patientReference, setPatientReference] = useState('');
  const [surgeonName, setSurgeonName] = useState('');
  const [implantType, setImplantType] = useState('');
  const [status, setStatus] = useState<CaseStatus>('Planning');
  const [priority, setPriority] = useState<CasePriority>('Medium');
  const [surgeryDate, setSurgeryDate] = useState('');
  const [notes, setNotes] = useState('');

  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [holidays, setHolidays] = useState<PublicHoliday[]>([]);
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null);

  // Generate a random unique case number
  const generateNewCaseNumber = () => {
    const num = Math.floor(1000 + Math.random() * 9000);
    const newCase = `CASE-${num}`;
    setCaseNumber(newCase);
    if (fieldErrors.case_number) {
      setFieldErrors(prev => {
        const next = { ...prev };
        delete next.case_number;
        return next;
      });
    }
  };

  const generateNewPatientRef = () => {
    const num = Math.floor(1000 + Math.random() * 9000);
    setPatientReference(`PAT-${num}`);
    if (fieldErrors.patient_reference) {
      setFieldErrors(prev => {
        const next = { ...prev };
        delete next.patient_reference;
        return next;
      });
    }
  };

  // Initialize form state
  useEffect(() => {
    if (initialCase) {
      setCaseNumber(initialCase.case_number);
      setPatientReference(initialCase.patient_reference);
      setSurgeonName(initialCase.surgeon_name);
      setImplantType(initialCase.implant_type);
      setStatus(initialCase.status);
      setPriority(initialCase.priority);
      setSurgeryDate(initialCase.surgery_date || '');
      setNotes(initialCase.notes || '');
      setActiveTemplate(null);
    } else {
      generateNewCaseNumber();
      generateNewPatientRef();
      setSurgeonName('Dr. Sarah Chen');
      setImplantType('');
      setStatus('Planning');
      setPriority('Medium');
      // Default to 14 days in future for realistic surgery date
      const d = new Date();
      d.setDate(d.getDate() + 14);
      setSurgeryDate(d.toISOString().split('T')[0]);
      setNotes('');
      setActiveTemplate(null);
    }
    setFieldErrors({});
    setGeneralError(null);
  }, [initialCase, isOpen]);

  // Fetch holidays for the calendar assistant
  useEffect(() => {
    if (isOpen) {
      ApiClient.getHolidays().then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setHolidays(res.data);
        }
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const applyTemplate = (tmpl: typeof PROCEDURE_TEMPLATES[0]) => {
    setSurgeonName(tmpl.surgeon);
    setImplantType(tmpl.implant);
    setStatus(tmpl.status);
    setPriority(tmpl.priority);
    setNotes(tmpl.notes);
    setActiveTemplate(tmpl.name);
    // Clear relevant errors
    setFieldErrors(prev => {
      const next = { ...prev };
      delete next.surgeon_name;
      delete next.implant_type;
      delete next.status;
      delete next.priority;
      return next;
    });
    setGeneralError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setGeneralError(null);

    // Client-side pre-validation for instant feedback
    const errors: Record<string, string[]> = {};
    const trimmedCaseNum = caseNumber.trim();
    const trimmedPatientRef = patientReference.trim();
    const trimmedSurgeon = surgeonName.trim();
    const trimmedImplant = implantType.trim();

    if (!trimmedCaseNum) {
      errors.case_number = ['Case number is required. Format: CASE-XXXX'];
    }
    if (!trimmedPatientRef) {
      errors.patient_reference = ['Patient reference code is required (e.g. PAT-1024).'];
    }
    if (!trimmedSurgeon) {
      errors.surgeon_name = ['Surgeon name is required.'];
    }
    if (!trimmedImplant) {
      errors.implant_type = ['Implant specification is required.'];
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setGeneralError('Please fill in all required fields indicated below.');
      return;
    }

    setIsSubmitting(true);

    const payload: Partial<MedicalCase> = {
      case_number: trimmedCaseNum,
      patient_reference: trimmedPatientRef,
      surgeon_name: trimmedSurgeon,
      implant_type: trimmedImplant,
      status,
      priority,
      surgery_date: surgeryDate ? surgeryDate.trim() : null,
      notes: notes.trim(),
    };

    const res = await onSubmit(payload);
    setIsSubmitting(false);

    if (res.success) {
      onClose();
    } else {
      if (res.errors && Object.keys(res.errors).length > 0) {
        setFieldErrors(res.errors);
      }
      setGeneralError(res.message || 'Validation failed. Please verify the entered fields.');
    }
  };

  const matchedHoliday = holidays.find((h) => h.date === surgeryDate);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/40 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-xl shadow-xl border border-zinc-200 w-full max-w-xl max-h-[92dvh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between shrink-0 bg-zinc-50/50">
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-zinc-700" />
              <span>{isEdit ? `Edit Case: ${initialCase?.case_number}` : 'New Implant Case Intake'}</span>
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              {isEdit ? 'Update clinical specifications and surgical planning status.' : 'Register a new patient-specific implant tracking record.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded-md hover:bg-zinc-100 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* General alert banner if validation failed */}
          {generalError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start space-x-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <div className="space-y-1">
                <span className="font-medium text-rose-800">{generalError}</span>
                {Object.keys(fieldErrors).length > 0 && (
                  <p className="text-[11px] text-rose-600">
                    Fields needing attention: {Object.keys(fieldErrors).map(k => k.replace('_', ' ')).join(', ')}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* 1-Click Procedure Templates for easy testing */}
          {!isEdit && (
            <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-zinc-700 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Quick Clinical Templates:</span>
                </span>
                <span className="text-[10px] text-zinc-400">1-click autofill</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {PROCEDURE_TEMPLATES.map((tmpl) => {
                  const isSelected = activeTemplate === tmpl.name;
                  return (
                    <button
                      key={tmpl.name}
                      type="button"
                      onClick={() => applyTemplate(tmpl)}
                      className={`px-2 py-1.5 rounded-md text-[11px] font-medium border text-left truncate transition-colors ${
                        isSelected 
                          ? 'bg-zinc-900 text-white border-zinc-900' 
                          : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                      }`}
                    >
                      {tmpl.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Row 1: Case Number & Patient Reference */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-zinc-800 flex items-center gap-1">
                  <span>Case Number</span>
                  <span className="text-rose-500">*</span>
                </label>
                {!isEdit && (
                  <button
                    type="button"
                    onClick={generateNewCaseNumber}
                    className="text-[11px] text-zinc-500 hover:text-zinc-900 flex items-center gap-1"
                    title="Generate unique random case number"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Auto ID</span>
                  </button>
                )}
              </div>
              <input
                type="text"
                placeholder="CASE-1001"
                value={caseNumber}
                onChange={(e) => {
                  setCaseNumber(e.target.value);
                  if (fieldErrors.case_number) {
                    setFieldErrors(prev => ({ ...prev, case_number: undefined as any }));
                  }
                }}
                className={`w-full px-3 py-2 text-xs font-mono rounded-lg border ${
                  fieldErrors.case_number 
                    ? 'border-rose-400 bg-rose-50/20 text-rose-900 focus:ring-rose-500' 
                    : 'border-zinc-200 bg-white focus:ring-zinc-900'
                } focus:outline-none focus:ring-1`}
              />
              {fieldErrors.case_number ? (
                <p className="mt-1 text-[11px] text-rose-600 font-medium">
                  {fieldErrors.case_number[0]}
                </p>
              ) : (
                <p className="mt-1 text-[10px] text-zinc-400">Must be unique (e.g. CASE-0001)</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-zinc-800 flex items-center gap-1">
                  <span>Patient Reference</span>
                  <span className="text-rose-500">*</span>
                </label>
                {!isEdit && (
                  <button
                    type="button"
                    onClick={generateNewPatientRef}
                    className="text-[11px] text-zinc-500 hover:text-zinc-900 flex items-center gap-1"
                    title="Generate random de-identified patient code"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Auto Code</span>
                  </button>
                )}
              </div>
              <input
                type="text"
                placeholder="PAT-4821"
                value={patientReference}
                onChange={(e) => {
                  setPatientReference(e.target.value);
                  if (fieldErrors.patient_reference) {
                    setFieldErrors(prev => ({ ...prev, patient_reference: undefined as any }));
                  }
                }}
                className={`w-full px-3 py-2 text-xs font-mono rounded-lg border ${
                  fieldErrors.patient_reference 
                    ? 'border-rose-400 bg-rose-50/20 text-rose-900 focus:ring-rose-500' 
                    : 'border-zinc-200 bg-white focus:ring-zinc-900'
                } focus:outline-none focus:ring-1`}
              />
              {fieldErrors.patient_reference ? (
                <p className="mt-1 text-[11px] text-rose-600 font-medium">
                  {fieldErrors.patient_reference[0]}
                </p>
              ) : (
                <p className="mt-1 text-[10px] text-zinc-400">De-identified dummy code (e.g. PAT-2041)</p>
              )}
            </div>
          </div>

          {/* Row 2: Surgeon Name & Implant Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-medium text-zinc-800 mb-1">
                Surgeon Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Dr. Sarah Chen"
                value={surgeonName}
                onChange={(e) => {
                  setSurgeonName(e.target.value);
                  if (fieldErrors.surgeon_name) {
                    setFieldErrors(prev => ({ ...prev, surgeon_name: undefined as any }));
                  }
                }}
                className={`w-full px-3 py-2 text-xs rounded-lg border ${
                  fieldErrors.surgeon_name 
                    ? 'border-rose-400 bg-rose-50/20 text-rose-900 focus:ring-rose-500' 
                    : 'border-zinc-200 bg-white focus:ring-zinc-900'
                } focus:outline-none focus:ring-1`}
              />
              {fieldErrors.surgeon_name && (
                <p className="mt-1 text-[11px] text-rose-600 font-medium">{fieldErrors.surgeon_name[0]}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-800 mb-1">
                Implant Specification <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Titanium Cranial Plate"
                value={implantType}
                onChange={(e) => {
                  setImplantType(e.target.value);
                  if (fieldErrors.implant_type) {
                    setFieldErrors(prev => ({ ...prev, implant_type: undefined as any }));
                  }
                }}
                className={`w-full px-3 py-2 text-xs rounded-lg border ${
                  fieldErrors.implant_type 
                    ? 'border-rose-400 bg-rose-50/20 text-rose-900 focus:ring-rose-500' 
                    : 'border-zinc-200 bg-white focus:ring-zinc-900'
                } focus:outline-none focus:ring-1`}
              />
              {fieldErrors.implant_type && (
                <p className="mt-1 text-[11px] text-rose-600 font-medium">{fieldErrors.implant_type[0]}</p>
              )}
            </div>
          </div>

          {/* Row 3: Status & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-medium text-zinc-800 mb-1">
                Lifecycle Status <span className="text-rose-500">*</span>
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as CaseStatus)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-900 bg-white font-medium"
              >
                <option value="Draft">Draft — Initial intake</option>
                <option value="Planning">Planning — CAD modeling & sizing</option>
                <option value="In Review">In Review — Surgeon clinical signoff</option>
                <option value="Approved">Approved — Ready for manufacturing</option>
                <option value="Completed">Completed — OR surgery finished</option>
                <option value="Cancelled">Cancelled — Non-operative case</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-800 mb-1">
                Clinical Urgency / Priority <span className="text-rose-500">*</span>
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as CasePriority)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-900 bg-white font-medium"
              >
                <option value="High">High Priority — Urgent OR / Trauma</option>
                <option value="Medium">Medium Priority — Scheduled elective</option>
                <option value="Low">Low Priority — Routine revision / follow-up</option>
              </select>
            </div>
          </div>

          {/* Row 4: Surgery Date & Public Holiday Check */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-zinc-800 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                <span>Scheduled Surgery Date</span>
                <span className="text-[10px] text-zinc-400 font-normal">(Optional)</span>
              </label>
              <span className="text-[10px] text-zinc-400">
                Nager.Date holiday verified
              </span>
            </div>

            <input
              type="date"
              value={surgeryDate}
              onChange={(e) => setSurgeryDate(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-900 bg-white"
            />

            {matchedHoliday && (
              <div className="mt-1.5 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-[11px]">
                    Public Holiday Notice: {matchedHoliday.name} ({matchedHoliday.localName})
                  </p>
                  <p className="text-[10px] text-amber-700 mt-0.5">
                    Operating rooms and sterilization facilities may have holiday staffing on this date.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Row 5: Notes */}
          <div>
            <label className="block text-xs font-medium text-zinc-800 mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-zinc-400" />
              <span>Surgical & Engineering Notes</span>
              <span className="text-[10px] text-zinc-400 font-normal">(Optional)</span>
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Screw trajectory specifications, biomaterial constraints, CT scan slice thickness..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-900 bg-white leading-relaxed"
            />
          </div>

          {/* Form Actions */}
          <div className="pt-3 border-t border-zinc-100 flex items-center justify-between shrink-0">
            <span className="text-[10px] text-zinc-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Inputs validated against medical device schema</span>
            </span>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-3 py-1.5 text-xs text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 text-white text-xs font-medium rounded-lg transition-colors shadow-xs flex items-center gap-1.5"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>{isEdit ? 'Update Case' : 'Register Case'}</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
