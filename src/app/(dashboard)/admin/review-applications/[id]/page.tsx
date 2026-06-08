"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
   ArrowLeft,
   BookOpen,
   CheckCircle2,
   FileText,
   GraduationCap,
   Loader2,
   User,
   XCircle,
} from "lucide-react";
import { toast } from "sonner";
import EditableField from "@/components/custom/EditableField";
import SectionCard from "@/components/custom/SectionCard";
import DocumentList from "@/components/custom/DocumentList";
import StatusBadge from "@/components/custom/StatusBadge";
import Modal from "@/components/custom/Modal";
import {
   applicationReviewKeys,
   applicationReviewMutationOptions,
   applicationReviewQueryOptions,
} from "@/services/applicationReviewApi";
import type {
   // AdmissionApplication,
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
   pending: "Pending",
   under_review: "Under Review",
   approved: "Approved",
   denied: "Denied",
};

export default function ApplicationDetailPage() {
   const { id } = useParams<{ id: string }>();
   const router = useRouter();
   const queryClient = useQueryClient();

   const [denyModalOpen, setDenyModalOpen] = useState(false);
   const [denyReason, setDenyReason] = useState("");
   const [confirmApproveOpen, setConfirmApproveOpen] = useState(false);

   const { data: application, isLoading } = useQuery(
      applicationReviewQueryOptions.detail(id)
   );

   const updateMutation = useMutation({
      ...applicationReviewMutationOptions.update(),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: applicationReviewKeys.detail(id) });
         queryClient.invalidateQueries({ queryKey: applicationReviewKeys.all });
         toast.success("Application updated");
      },
      onError: () => toast.error("Failed to update application"),
   });

   const reviewMutation = useMutation({
      ...applicationReviewMutationOptions.review(),
      onSuccess: (res) => {
         queryClient.invalidateQueries({ queryKey: applicationReviewKeys.detail(id) });
         queryClient.invalidateQueries({ queryKey: applicationReviewKeys.all });
         toast.success(res.message ?? "Decision submitted");
         setDenyModalOpen(false);
         setConfirmApproveOpen(false);
      },
      onError: () => toast.error("Failed to submit decision"),
   });

   const handleFieldSave = (section: keyof UpdateApplicationPayload, key: string, value: string) => {
      if (!application) return;
      const payload: UpdateApplicationPayload = {};

      if (section === "personal_info") {
         payload.personal_info = { [key]: value } as UpdateApplicationPayload["personal_info"];
      } else if (section === "program_choice") {
         payload.program_choice = { [key]: key === "jamb_score" ? Number(value) : value } as UpdateApplicationPayload["program_choice"];
      }

      updateMutation.mutate({ id, payload });
   };

   const handleAcademicRecordSave = (index: number, key: keyof ApplicantAcademicRecord, value: string) => {
      if (!application) return;
      const updated = [...application.academic_records];
      updated[index] = { ...updated[index], [key]: value };
      updateMutation.mutate({ id, payload: { academic_records: updated } });
   };

   const handleDocumentRemove = (docId: string) => {
      if (!application) return;
      const updated = application.documents.filter((d) => d.id !== docId);
      updateMutation.mutate({ id, payload: { documents: updated } });
   };

   const handleDocumentReplace = (docId: string, _file: File) => {
      if (!application) return;
      // In a real app, upload the file first, then update the URL
      const updated = application.documents.map((d) =>
         d.id === docId ? { ...d, url: URL.createObjectURL(_file), name: _file.name, uploaded_at: new Date().toISOString() } : d
      );
      updateMutation.mutate({ id, payload: { documents: updated } });
      toast.success("Document replaced");
   };

   const handleDocumentAdd = (_file: File) => {
      if (!application) return;
      const newDoc: ApplicantDocument = {
         id: `doc-${Date.now()}`,
         name: _file.name,
         type: "other",
         url: URL.createObjectURL(_file),
         uploaded_at: new Date().toISOString(),
      };
      updateMutation.mutate({ id, payload: { documents: [...application.documents, newDoc] } });
      toast.success("Document added");
   };

   const handleApprove = () => {
      reviewMutation.mutate({ id, payload: { status: "approved" } });
   };

   const handleDeny = () => {
      if (!denyReason.trim()) {
         toast.error("Please provide a reason for denial");
         return;
      }
      reviewMutation.mutate({ id, payload: { status: "denied", denial_reason: denyReason } });
   };

   const isEditable = application?.status === "pending" || application?.status === "under_review";
   const canReview = application?.status === "pending" || application?.status === "under_review";

   if (isLoading) {
      return (
         <div className="flex items-center justify-center py-24">
            <Loader2 size={24} className="animate-spin text-muted-foreground" />
         </div>
      );
   }

   if (!application) {
      return (
         <div className="text-center py-24">
            <p className="text-muted-foreground">Application not found</p>
            <button
               onClick={() => router.back()}
               className="mt-4 text-sm text-primary hover:underline"
            >
               Go back
            </button>
         </div>
      );
   }

   const { personal_info, academic_records, program_choice, documents } = application;

   return (
      <div className="w-full px-4 py-8 sm:px-6 lg:px-8">
         <div className="space-y-6">
            {/* Header */}
            <motion.div
               initial={{ opacity: 0, y: -12 }}
               animate={{ opacity: 1, y: 0 }}
               className="flex items-start justify-between gap-4 flex-wrap"
            >
               <div className="flex items-center gap-3">
                  <button
                     onClick={() => router.back()}
                     className="p-2 rounded-xl hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                  >
                     <ArrowLeft size={18} />
                  </button>
                  <div>
                     <div className="flex items-center gap-2.5">
                        <h1 className="text-xl font-bold text-foreground">
                           {personal_info.last_name}, {personal_info.first_name} {personal_info.middle_name}
                        </h1>
                        <StatusBadge
                           label={statusLabelMap[application.status]}
                           variant={statusVariantMap[application.status]}
                           dot
                        />
                     </div>
                     <p className="text-sm text-muted-foreground mt-0.5">
                        Application ID: {application.id} &middot; Session: {application.session}
                     </p>
                  </div>
               </div>

               {canReview && (
                  <div className="flex items-center gap-2">
                     <button
                        onClick={() => setConfirmApproveOpen(true)}
                        disabled={reviewMutation.isPending}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                     >
                        <CheckCircle2 size={16} />
                        Approve
                     </button>
                     <button
                        onClick={() => setDenyModalOpen(true)}
                        disabled={reviewMutation.isPending}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
                     >
                        <XCircle size={16} />
                        Deny
                     </button>
                  </div>
               )}
            </motion.div>

            {/* Denial reason banner */}
            <AnimatePresence>
               {application.status === "denied" && application.denial_reason && (
                  <motion.div
                     initial={{ opacity: 0, height: 0 }}
                     animate={{ opacity: 1, height: "auto" }}
                     exit={{ opacity: 0, height: 0 }}
                     className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4"
                  >
                     <p className="text-sm font-semibold text-red-700 dark:text-red-400 mb-1">Denial Reason</p>
                     <p className="text-sm text-red-600 dark:text-red-300">{application.denial_reason}</p>
                     <p className="text-[11px] text-red-500/70 mt-2">
                        Reviewed by {application.reviewed_by} on{" "}
                        {application.reviewed_at && new Date(application.reviewed_at).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })}
                     </p>
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

            {/* Approval Confirmation */}
            <Modal
               open={confirmApproveOpen}
               onClose={() => setConfirmApproveOpen(false)}
               title="Approve Application"
               subtitle={`Grant admission to ${personal_info.first_name} ${personal_info.last_name}?`}
               size="sm"
               footer={
                  <>
                     <button
                        onClick={() => setConfirmApproveOpen(false)}
                        className="px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:bg-accent transition-colors"
                     >
                        Cancel
                     </button>
                     <button
                        onClick={handleApprove}
                        disabled={reviewMutation.isPending}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                     >
                        {reviewMutation.isPending && <Loader2 size={14} className="animate-spin" />}
                        Confirm Approval
                     </button>
                  </>
               }
            >
               <p className="text-sm text-muted-foreground">
                  This will change the application status to <strong>Approved</strong> and notify the applicant.
                  This action can be reviewed later but should be done carefully.
               </p>
            </Modal>

            {/* Deny Modal */}
            <Modal
               open={denyModalOpen}
               onClose={() => setDenyModalOpen(false)}
               title="Deny Application"
               subtitle={`Deny admission for ${personal_info.first_name} ${personal_info.last_name}?`}
               size="md"
               footer={
                  <>
                     <button
                        onClick={() => setDenyModalOpen(false)}
                        className="px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:bg-accent transition-colors"
                     >
                        Cancel
                     </button>
                     <button
                        onClick={handleDeny}
                        disabled={reviewMutation.isPending || !denyReason.trim()}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
                     >
                        {reviewMutation.isPending && <Loader2 size={14} className="animate-spin" />}
                        Confirm Denial
                     </button>
                  </>
               }
            >
               <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                     Please provide a clear reason for denying this application. The applicant will be notified.
                  </p>
                  <textarea
                     value={denyReason}
                     onChange={(e) => setDenyReason(e.target.value)}
                     rows={4}
                     placeholder="e.g. JAMB score below cut-off, missing required documents…"
                     className="w-full px-3 py-2.5 text-sm bg-muted border border-border rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none text-foreground placeholder:text-muted-foreground"
                  />
               </div>
            </Modal>
         </div>
      </div>
   );
}
