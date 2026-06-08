"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SectionCardProps {
   title: string;
   icon?: LucideIcon;
   badge?: ReactNode;
   children: ReactNode;
   className?: string;
   actions?: ReactNode;
}

export default function SectionCard({
   title,
   icon: Icon,
   badge,
   children,
   className,
   actions,
}: SectionCardProps) {
   return (
      <motion.div
         initial={{ opacity: 0, y: 12 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ duration: 0.3 }}
         className={cn(
            "bg-card border border-border rounded-2xl overflow-hidden",
            className
         )}
      >
         <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2.5">
               {Icon && (
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                     <Icon size={16} className="text-primary" />
                  </div>
               )}
               <h3 className="font-semibold text-foreground text-sm">{title}</h3>
               {badge}
            </div>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
         </div>
         <div className="p-5">{children}</div>
      </motion.div>
   );
}
