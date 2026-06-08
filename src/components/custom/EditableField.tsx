"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, Pencil, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface EditableFieldProps {
   label: string;
   value: string;
   onSave: (value: string) => void;
   editable?: boolean;
   type?: "text" | "email" | "tel" | "date" | "number" | "textarea";
   options?: { value: string; label: string }[];
   placeholder?: string;
   className?: string;
}

export default function EditableField({
   label,
   value,
   onSave,
   editable = true,
   type = "text",
   options,
   placeholder,
   className,
}: EditableFieldProps) {
   const [editing, setEditing] = useState(false);
   const [draft, setDraft] = useState(value);
   const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(null);

   useEffect(() => {
      setDraft(value);
   }, [value]);

   useEffect(() => {
      if (editing && inputRef.current) {
         inputRef.current.focus();
      }
   }, [editing]);

   const handleSave = () => {
      if (draft.trim() !== value) {
         onSave(draft.trim());
      }
      setEditing(false);
   };

   const handleCancel = () => {
      setDraft(value);
      setEditing(false);
   };

   const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && type !== "textarea") handleSave();
      if (e.key === "Escape") handleCancel();
   };

   return (
      <div className={cn("group", className)}>
         <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            {label}
         </label>

         {editing ? (
            <motion.div
               initial={{ opacity: 0, y: -4 }}
               animate={{ opacity: 1, y: 0 }}
               className="flex items-center gap-1.5 mt-1"
            >
               {options ? (
                  <select
                     ref={inputRef as React.RefObject<HTMLSelectElement>}
                     value={draft}
                     onChange={(e) => setDraft(e.target.value)}
                     onKeyDown={handleKeyDown}
                     className="flex-1 px-2.5 py-1.5 text-sm bg-muted border border-primary/30 rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-foreground"
                  >
                     {options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                           {opt.label}
                        </option>
                     ))}
                  </select>
               ) : type === "textarea" ? (
                  <textarea
                     ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                     value={draft}
                     onChange={(e) => setDraft(e.target.value)}
                     onKeyDown={handleKeyDown}
                     rows={3}
                     placeholder={placeholder}
                     className="flex-1 px-2.5 py-1.5 text-sm bg-muted border border-primary/30 rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none text-foreground"
                  />
               ) : (
                  <input
                     ref={inputRef as React.RefObject<HTMLInputElement>}
                     type={type}
                     value={draft}
                     onChange={(e) => setDraft(e.target.value)}
                     onKeyDown={handleKeyDown}
                     placeholder={placeholder}
                     className="flex-1 px-2.5 py-1.5 text-sm bg-muted border border-primary/30 rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-foreground"
                  />
               )}
               <button
                  onClick={handleSave}
                  className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-colors"
               >
                  <Check size={14} />
               </button>
               <button
                  onClick={handleCancel}
                  className="p-1.5 rounded-lg bg-red-500/10 text-red-600 hover:bg-red-500/20 transition-colors"
               >
                  <X size={14} />
               </button>
            </motion.div>
         ) : (
            <div className="flex items-center gap-1.5 mt-1">
               <p className={cn("text-sm text-foreground", !value && "text-muted-foreground italic")}>
                  {value || placeholder || "—"}
               </p>
               {editable && (
                  <button
                     onClick={() => setEditing(true)}
                     className="p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-accent text-muted-foreground hover:text-foreground transition-all"
                  >
                     <Pencil size={12} />
                  </button>
               )}
            </div>
         )}
      </div>
   );
}
