"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
   BookOpen,
   CheckCircle2,
   FileText,
   GraduationCap,
   Loader2,
   Save,
   User,
} from "lucide-react";
import { toast } from "sonner";
import EditableField from "@/components/custom/EditableField";
import SectionCard from "@/components/custom/SectionCard";
import DocumentList from "@/components/custom/DocumentList";
import StatusBadge from "@/components/custom/StatusBadge";
import EmptyState from "@/components/custom/EmptyState";
import {
   applicationReviewKeys,
   applicationReviewMutationOptions,
   applicationReviewQueryOptions,
} from "@/services/applicationReviewApi";
import type {
   ApplicationReviewStatus,
   ApplicantAcademicRecord,
   ApplicantDocument,
   UpdateApplicationPayload,
} from "@/types/school";

const statusVariantMap: Record<ApplicationReviewStatus, "warning" | "info" | "success" | "destructive"> = {
   pending: "warning",
   under_review: "info",
   approved: "success",
   denied: "destructive",
};

const statusLabelMap: Record<ApplicationReviewStatus, string> = {
   pending: "Pending Review",
   under_review: "Under Review",
   approved: "Approved",
   denied: "Denied",
};

// Using a fixed applicant ID for the logged-in student (dummy)
const CURRENT_APPLICANT_ID = "applicant-1";

export default function MyApplicationPage() {
   const queryClient = useQueryClient();
   const [lastSaved, setLastSaved] = useState<string | null>(null);

   const { data: application, isLoading } = useQuery(
      applicationReviewQueryOptions.byApplicant(CURRENT_APPLICANT_ID)
   );

   const updateMutation = useMutation({
      ...applicationReviewMutationOptions.update(),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: applicationReviewKeys.byApplicant(CURRENT_APPLICANT_ID) });
         setLastSaved(new Date().toLocaleTimeString());
         toast.success("Changes saved");
      },
      onError: () => toast.error("Failed to save changes"),
   });

   const handleFieldSave = (section: keyof UpdateApplicationPayload, key: string, value: string) => {
      if (!application) return;
      const payload: UpdateApplicationPayload = {};

      if (section === "personal_info") {
         payload.personal_info = { [key]: value } as UpdateApplicationPayload["personal_info"];
      } else if (section === "program_choice") {
         payload.program_choice = { [key]: key === "jamb_score" ? Number(value) : value } as UpdateApplicationPayload["program_choice"];
      }

      updateMutation.mutate({ id: application.id, payload });
   };

   const handleAcademicRecordSave = (index: number, key: keyof ApplicantAcademicRecord, value: string) => {
      if (!application) return;
      const updated = [...application.academic_records];
      updated[index] = { ...updated[index], [key]: value };
      updateMutation.mutate({ id: application.id, payload: { academic_records: updated } });
   };

   const handleDocumentRemove = (docId: string) => {
      if (!application) return;
      const updated = application.documents.filter((d) => d.id !== docId);
      updateMutation.mutate({ id: application.id, payload: { documents: updated } });
   };

   const handleDocumentReplace = (docId: string, file: File) => {
      if (!application) return;
      const updated = application.documents.map((d) =>
         d.id === docId ? { ...d, url: URL.createObjectURL(file), name: file.name, uploaded_at: new Date().toISOString() } : d
      );
      updateMutation.mutate({ id: application.id, payload: { documents: updated } });
      toast.success("Document replaced");
   };

   const handleDocumentAdd = (file: File) => {
      if (!application) return;
      const newDoc: ApplicantDocument = {
         id: `doc-${Date.now()}`,
         name: file.name,
         type: "other",
         url: URL.createObjectURL(file),
         uploaded_at: new Date().toISOString(),
      };
      updateMutation.mutate({ id: application.id, payload: { documents: [...application.documents, newDoc] } });
      toast.success("Document uploaded");
   };

   if (isLoading) {
      return (
         <div className="flex items-center justify-center py-24">
            <Loader2 size={24} className="animate-spin text-muted-foreground" />
         </div>
      );
   }

   if (!application) {
      return (
         <EmptyState
            icon={FileText}
            title="No Application Found"
            description="You haven't submitted an admission application yet."
         />
      );
   }

   const isEditable = application.status === "pending" || application.status === "under_review";
   const { personal_info, academic_records, program_choice, documents } = application;

   return (
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
         <div className="space-y-6 max-w-4xl">
            {/* Header */}
            <motion.div
               initial={{ opacity: 0, y: -12 }}
               animate={{ opacity: 1, y: 0 }}
               className="flex items-start justify-between gap-4 flex-wrap"
            >
               <div>
                  <div className="flex items-center gap-2.5">
                     <h1 className="text-xl font-bold text-foreground">My Application</h1>
                     <StatusBadge
                        label={statusLabelMap[application.status]}
                        variant={statusVariantMap[application.status]}
                        dot
                     />
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">
                     Session: {application.session} &middot; Submitted{" "}
                     {new Date(application.submitted_at).toLocaleDateString("en-NG", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                     })}
                  </p>
               </div>

               {updateMutation.isPending && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                     <Loader2 size={14} className="animate-spin" />
                     Saving...
                  </div>
               )}
               {lastSaved && !updateMutation.isPending && (
                  <div className="flex items-center gap-1.5 text-sm text-emerald-600">
                     <Save size={14} />
                     Saved at {lastSaved}
                  </div>
               )}
            </motion.div>

            {/* Info banner */}
            {isEditable && (
               <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 flex items-start gap-3"
               >
                  <CheckCircle2 size={18} className="text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                  <div>
                     <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                        You can edit your application
                     </p>
                     <p className="text-sm text-blue-600/80 dark:text-blue-400/80 mt-0.5">
                        Click on any field to correct typos or replace uploaded documents. Changes are saved automatically.
                     </p>
                  </div>
               </motion.div>
            )}

            {/* Denial reason */}
            <AnimatePresence>
               {application.status === "denied" && application.denial_reason && (
                  <motion.div
                     initial={{ opacity: 0, height: 0 }}
                     animate={{ opacity: 1, height: "auto" }}
                     exit={{ opacity: 0, height: 0 }}
                     className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4"
                  >
                     <p className="text-sm font-semibold text-red-700 dark:text-red-400 mb-1">
                        Application Denied
                     </p>
                     <p className="text-sm text-red-600 dark:text-red-300">{application.denial_reason}</p>
                  </motion.div>
               )}
            </AnimatePresence>

            {/* Approved banner */}
            <AnimatePresence>
               {application.status === "approved" && (
                  <motion.div
                     initial={{ opacity: 0, height: 0 }}
                     animate={{ opacity: 1, height: "auto" }}
                     exit={{ opacity: 0, height: 0 }}
                     className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-start gap-3"
                  >
                     <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                     <div>
                        <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                           Congratulations! Your application has been approved.
                        </p>
                        <p className="text-sm text-emerald-600/80 dark:text-emerald-400/80 mt-0.5">
                           Please proceed to the admissions portal to complete your enrollment.
                        </p>
                     </div>
                  </motion.div>
               )}
            </AnimatePresence>

            {/* Personal Information */}
            <SectionCard title="Personal Information" icon={User}>
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                  <div className="sm:col-span-2 lg:col-span-3 flex items-center gap-4 mb-2">
                     {/* eslint-disable-next-line @next/next/no-img-element */}
                     <img
                        src={personal_info.passport_url}
                        alt="Passport"
                        className="w-20 h-20 rounded-xl object-cover border border-border"
                     />
                     <div>
                        <p className="font-semibold text-foreground text-lg">
                           {personal_info.last_name}, {personal_info.first_name} {personal_info.middle_name}
                        </p>
                        <p className="text-sm text-muted-foreground">{personal_info.email}</p>
                     </div>
                  </div>
                  <EditableField label="First Name" value={personal_info.first_name} editable={isEditable} onSave={(v) => handleFieldSave("personal_info", "first_name", v)} />
                  <EditableField label="Last Name" value={personal_info.last_name} editable={isEditable} onSave={(v) => handleFieldSave("personal_info", "last_name", v)} />
                  <EditableField label="Middle Name" value={personal_info.middle_name} editable={isEditable} onSave={(v) => handleFieldSave("personal_info", "middle_name", v)} />
                  <EditableField label="Date of Birth" value={personal_info.date_of_birth} type="date" editable={isEditable} onSave={(v) => handleFieldSave("personal_info", "date_of_birth", v)} />
                  <EditableField
                     label="Gender"
                     value={personal_info.gender}
                     editable={isEditable}
                     options={[
                        { value: "male", label: "Male" },
                        { value: "female", label: "Female" },
                        { value: "other", label: "Other" },
                     ]}
                     onSave={(v) => handleFieldSave("personal_info", "gender", v)}
                  />
                  <EditableField label="Nationality" value={personal_info.nationality} editable={isEditable} onSave={(v) => handleFieldSave("personal_info", "nationality", v)} />
                  <EditableField label="State of Origin" value={personal_info.state_of_origin} editable={isEditable} onSave={(v) => handleFieldSave("personal_info", "state_of_origin", v)} />
                  <EditableField label="LGA" value={personal_info.lga} editable={isEditable} onSave={(v) => handleFieldSave("personal_info", "lga", v)} />
                  <EditableField label="Phone" value={personal_info.phone} type="tel" editable={isEditable} onSave={(v) => handleFieldSave("personal_info", "phone", v)} />
                  <EditableField label="Email" value={personal_info.email} type="email" editable={isEditable} onSave={(v) => handleFieldSave("personal_info", "email", v)} />
                  <EditableField label="Address" value={personal_info.address} type="textarea" editable={isEditable} onSave={(v) => handleFieldSave("personal_info", "address", v)} className="sm:col-span-2 lg:col-span-3" />
               </div>
            </SectionCard>

            {/* Program Choice */}
            <SectionCard title="Program Choice" icon={GraduationCap}>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                  <EditableField label="First Choice" value={program_choice.first_choice_program_name} editable={isEditable} onSave={(v) => handleFieldSave("program_choice", "first_choice_program_name", v)} />
                  <EditableField label="Second Choice" value={program_choice.second_choice_program_name} editable={isEditable} onSave={(v) => handleFieldSave("program_choice", "second_choice_program_name", v)} />
                  <EditableField
                     label="Entry Mode"
                     value={program_choice.entry_mode}
                     editable={isEditable}
                     options={[
                        { value: "utme", label: "UTME" },
                        { value: "direct_entry", label: "Direct Entry" },
                        { value: "transfer", label: "Transfer" },
                     ]}
                     onSave={(v) => handleFieldSave("program_choice", "entry_mode", v)}
                  />
                  <EditableField label="JAMB Reg No." value={program_choice.jamb_reg_no} editable={isEditable} onSave={(v) => handleFieldSave("program_choice", "jamb_reg_no", v)} />
                  <EditableField label="JAMB Score" value={String(program_choice.jamb_score)} type="number" editable={isEditable} onSave={(v) => handleFieldSave("program_choice", "jamb_score", v)} />
               </div>
            </SectionCard>

            {/* Academic Records */}
            <SectionCard title="Academic Records" icon={BookOpen}>
               <div className="space-y-6">
                  {academic_records.map((record, idx) => (
                     <div key={idx} className="space-y-4">
                        {idx > 0 && <hr className="border-border" />}
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                           Record {idx + 1}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                           <EditableField label="Institution" value={record.institution} editable={isEditable} onSave={(v) => handleAcademicRecordSave(idx, "institution", v)} />
                           <EditableField label="Qualification" value={record.qualification} editable={isEditable} onSave={(v) => handleAcademicRecordSave(idx, "qualification", v)} />
                           <EditableField label="Year Obtained" value={record.year_obtained} editable={isEditable} onSave={(v) => handleAcademicRecordSave(idx, "year_obtained", v)} />
                           <EditableField label="Grade" value={record.grade} editable={isEditable} onSave={(v) => handleAcademicRecordSave(idx, "grade", v)} />
                        </div>
                        {record.certificate_url && (
                           <div className="mt-2">
                              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Certificate</p>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                 src={record.certificate_url}
                                 alt={`${record.qualification} Certificate`}
                                 className="w-full max-w-sm h-auto rounded-xl border border-border object-cover"
                              />
                           </div>
                        )}
                     </div>
                  ))}
               </div>
            </SectionCard>

            {/* Documents */}
            <SectionCard title="Uploaded Documents" icon={FileText}>
               <DocumentList
                  documents={documents}
                  editable={isEditable}
                  onRemove={handleDocumentRemove}
                  onReplace={handleDocumentReplace}
                  onAdd={handleDocumentAdd}
               />
            </SectionCard>
         </div>
      </div>
   );
}
