"use client";

import { useState, useRef, useEffect, useMemo, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { ChevronsUpDown, Check, Search } from "lucide-react";

export interface ComboboxOption {
   value: string | number;
   label: string;
   description?: string;
}

interface ComboboxProps {
   options: ComboboxOption[];
   value: string | number | null;
   onChange: (value: string | number) => void;
   placeholder?: string;
   searchPlaceholder?: string;
   emptyMessage?: string;
   /** Custom render for each option row. Falls back to label + description. */
   renderOption?: (option: ComboboxOption, isSelected: boolean) => ReactNode;
   /** Custom render for the selected display text. Falls back to label. */
   renderValue?: (option: ComboboxOption) => ReactNode;
   disabled?: boolean;
   className?: string;
}

export default function Combobox({
   options,
   value,
   onChange,
   placeholder = "Select…",
   searchPlaceholder = "Search…",
   emptyMessage = "No results found",
   renderOption,
   renderValue,
   disabled,
   className,
}: ComboboxProps) {
   const [open, setOpen] = useState(false);
   const [query, setQuery] = useState("");
   const containerRef = useRef<HTMLDivElement>(null);
   const inputRef = useRef<HTMLInputElement>(null);
   const dropdownRef = useRef<HTMLDivElement>(null);
   const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

   const selected = options.find((o) => o.value === value) ?? null;

   const filtered = useMemo(() => {
      if (!query.trim()) return options;
      const q = query.toLowerCase();
      return options.filter(
         (o) =>
            o.label.toLowerCase().includes(q) ||
            (o.description?.toLowerCase().includes(q) ?? false) ||
            String(o.value).toLowerCase().includes(q),
      );
   }, [options, query]);

   // Close on outside click
   useEffect(() => {
      const handler = (e: MouseEvent) => {
         if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
            setOpen(false);
         }
      };
      document.addEventListener("mousedown", handler);
      return () => document.removeEventListener("mousedown", handler);
   }, []);

   // Position dropdown absolutely in portal
   useEffect(() => {
      if (open && containerRef.current) {
         const rect = containerRef.current.getBoundingClientRect();
         setDropdownStyle({
            position: "absolute",
            top: rect.bottom + window.scrollY,
            left: rect.left + window.scrollX,
            width: rect.width,
            zIndex: 2000,
         });
      }
   }, [open]);

   return (
      <div ref={containerRef} className={`relative ${className ?? ""}`}>
         <button
            type="button"
            disabled={disabled}
            onClick={() => {
               setOpen((v) => !v);
               setTimeout(() => inputRef.current?.focus(), 0);
            }}
            className="w-full flex items-center justify-between px-3 py-2 text-sm bg-muted border border-transparent rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
         >
            <span className={selected ? "truncate" : "text-muted-foreground truncate"}>
               {selected ? (renderValue ? renderValue(selected) : selected.label) : placeholder}
            </span>
            <ChevronsUpDown size={14} className="shrink-0 ml-2 text-muted-foreground" />
         </button>

         {open && typeof window !== "undefined" && createPortal(
            <div
               ref={dropdownRef}
               style={dropdownStyle}
               className="rounded-xl border border-border bg-card shadow-lg overflow-hidden"
               onMouseDown={e => e.stopPropagation()}
            >
               <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
                  <Search size={14} className="text-muted-foreground shrink-0" />
                  <input
                     ref={inputRef}
                     className="w-full text-sm bg-transparent outline-none placeholder:text-muted-foreground text-foreground"
                     placeholder={searchPlaceholder}
                     value={query}
                     onChange={(e) => setQuery(e.target.value)}
                  />
               </div>
               <ul className="max-h-52 overflow-y-auto py-1">
                  {filtered.length === 0 ? (
                     <li className="px-3 py-4 text-center text-xs text-muted-foreground">{emptyMessage}</li>
                  ) : (
                     filtered.map((o) => {
                        const isSelected = value === o.value;
                        return (
                           <li key={o.value}>
                              <button
                                 type="button"
                                 onClick={() => {
                                    onChange(o.value);
                                    setOpen(false);
                                    setQuery("");
                                 }}
                                 className="w-full flex items-start gap-2 px-3 py-2 text-left hover:bg-accent transition-colors"
                              >
                                 <Check
                                    size={14}
                                    className={`shrink-0 mt-0.5 ${isSelected ? "text-primary" : "text-transparent"}`}
                                 />
                                 {renderOption ? (
                                    renderOption(o, isSelected)
                                 ) : (
                                    <div className="min-w-0">
                                       <p className="text-sm font-medium text-foreground truncate">{o.label}</p>
                                       {o.description && (
                                          <p className="text-xs text-muted-foreground">{o.description}</p>
                                       )}
                                    </div>
                                 )}
                              </button>
                           </li>
                        );
                     })
                  )}
               </ul>
            </div>,
            document.body
         )}
      </div>
   );
}
