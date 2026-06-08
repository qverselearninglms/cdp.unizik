"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, FileText, Trash2, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ApplicantDocument } from "@/types/school";

interface DocumentCardProps {
   document: ApplicantDocument;
   editable?: boolean;
   onRemove?: (id: string) => void;
   onReplace?: (id: string, file: File) => void;
}

export function DocumentCard({ document, editable = false, onRemove, onReplace }: DocumentCardProps) {
   const [preview, setPreview] = useState(false);

   return (
      <>
         <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="group relative bg-muted/50 border border-border rounded-xl p-3 flex items-center gap-3"
         >
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
               <FileText size={18} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
               <p className="text-sm font-medium text-foreground truncate">{document.name}</p>
               <p className="text-[11px] text-muted-foreground capitalize">{document.type}</p>
            </div>
            <div className="flex items-center gap-1">
               <button
                  onClick={() => setPreview(true)}
                  className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                  title="Preview"
               >
                  <Eye size={14} />
               </button>
               {editable && (
                  <>
                     <label className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors cursor-pointer" title="Replace">
                        <Upload size={14} />
                        <input
                           type="file"
                           className="hidden"
                           accept="image/*,.pdf"
                           onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) onReplace?.(document.id, file);
                           }}
                        />
                     </label>
                     <button
                        onClick={() => onRemove?.(document.id)}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-600 transition-colors"
                        title="Remove"
                     >
                        <Trash2 size={14} />
                     </button>
                  </>
               )}
            </div>
         </motion.div>

         {/* Image Preview Modal */}
         <AnimatePresence>
            {preview && (
               <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  <motion.div
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0 }}
                     onClick={() => setPreview(false)}
                     className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                  />
                  <motion.div
                     initial={{ opacity: 0, scale: 0.9 }}
                     animate={{ opacity: 1, scale: 1 }}
                     exit={{ opacity: 0, scale: 0.9 }}
                     className="relative max-w-2xl w-full bg-card rounded-2xl border border-border overflow-hidden shadow-2xl"
                  >
                     <div className="flex items-center justify-between p-4 border-b border-border">
                        <p className="font-semibold text-sm text-foreground">{document.name}</p>
                        <button
                           onClick={() => setPreview(false)}
                           className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                        >
                           <X size={16} />
                        </button>
                     </div>
                     <div className="p-4">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                           src={document.url}
                           alt={document.name}
                           className="w-full h-auto rounded-lg object-contain max-h-[60vh]"
                        />
                     </div>
                  </motion.div>
               </div>
            )}
         </AnimatePresence>
      </>
   );
}

interface DocumentListProps {
   documents: ApplicantDocument[];
   editable?: boolean;
   onRemove?: (id: string) => void;
   onReplace?: (id: string, file: File) => void;
   onAdd?: (file: File) => void;
}

export default function DocumentList({ documents, editable = false, onRemove, onReplace, onAdd }: DocumentListProps) {
   return (
      <div className="space-y-2">
         <AnimatePresence>
            {documents.map((doc) => (
               <DocumentCard
                  key={doc.id}
                  document={doc}
                  editable={editable}
                  onRemove={onRemove}
                  onReplace={onReplace}
               />
            ))}
         </AnimatePresence>

         {editable && (
            <label className={cn(
               "flex items-center justify-center gap-2 p-4 border-2 border-dashed border-border rounded-xl",
               "hover:border-primary/40 hover:bg-primary/5 transition-colors cursor-pointer"
            )}>
               <Upload size={16} className="text-muted-foreground" />
               <span className="text-sm text-muted-foreground">Upload Document</span>
               <input
                  type="file"
                  className="hidden"
                  accept="image/*,.pdf"
                  onChange={(e) => {
                     const file = e.target.files?.[0];
                     if (file) onAdd?.(file);
                  }}
               />
            </label>
         )}
      </div>
   );
}
