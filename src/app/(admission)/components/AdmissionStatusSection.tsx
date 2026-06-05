"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadgeWidget } from "./StatusBadgeWidget";
import { useDevSimulate, useDeclineAdmission } from "../hooks/useAdmissionQueries";
import { Search, Clock, CheckCircle, XCircle, Loader2, RefreshCw, Ban, TimerOff, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { signOut } from "next-auth/react";
import type { StepSectionProps } from "../types/admission";

function useCountdown(expiryDate: string | null) {
   const calculateTimeLeft = useCallback(() => {
      if (!expiryDate) return null;
      const diff = new Date(expiryDate).getTime() - Date.now();
      if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
      return {
         days: Math.floor(diff / (1000 * 60 * 60 * 24)),
         hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
         minutes: Math.floor((diff / (1000 * 60)) % 60),
         seconds: Math.floor((diff / 1000) % 60),
         expired: false,
      };
   }, [expiryDate]);

   const [timeLeft, setTimeLeft] = useState(calculateTimeLeft);

   useEffect(() => {
      if (!expiryDate) return;
      const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
      return () => clearInterval(timer);
   }, [expiryDate, calculateTimeLeft]);

   return timeLeft;
}

export function AdmissionStatusSection({ student, onRefresh }: StepSectionProps) {
   const { simulateOffered, simulateDeclined, simulateExpired } = useDevSimulate();
   const declineAdmission = useDeclineAdmission();
   const [showDeclineConfirm, setShowDeclineConfirm] = useState(false);
   const isPending = student.admission_status === "pending";
   const isOffered = student.admission_status === "offered";
   const isRejected = student.admission_status === "rejected";
   const isDeclined = student.admission_status === "declined";
   const isExpired = student.admission_status === "expired";
   const countdown = useCountdown(isOffered ? student.offer_expiry_date : null);

   const handleDecline = async () => {
      try {
         await declineAdmission.mutateAsync();
         toast.success("Admission offer declined. Logging you out…");
      } catch {
         toast.error("Failed to decline admission. Please try again.");
      }
   };

   // Auto-logout when status becomes declined or expired
   useEffect(() => {
      if (isDeclined || isExpired) {
         const timer = setTimeout(() => {
            signOut({ callbackUrl: "/" });
         }, 2500);
         return () => clearTimeout(timer);
      }
   }, [isDeclined, isExpired]);

   return (
      <motion.div
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         exit={{ opacity: 0, y: -20 }}
         transition={{ duration: 0.5, ease: "easeOut" }}
      >
         <Card className="relative overflow-hidden border-border/50 shadow-lg">
            <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-primary/40 via-primary to-primary/40" />

            <CardHeader className="space-y-2">
               <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-primary/10 p-2.5 dark:bg-primary/20">
                     <Search className="size-5 text-primary" />
                  </div>
                  <div>
                     <CardTitle className="text-lg">Admission Status</CardTitle>
                     <CardDescription>
                        Step 3 — Your application is being reviewed by the admissions officer
                     </CardDescription>
                  </div>
               </div>
            </CardHeader>

            <CardContent className="space-y-5">
               {/* Status */}
               <div className="flex flex-wrap items-center gap-2">
                  <StatusBadgeWidget label="Application Submitted" status="success" />
                  <StatusBadgeWidget
                     label={
                        isPending
                           ? "Under Review"
                           : isOffered
                              ? "Admission Offered!"
                              : isRejected
                                 ? "Application Rejected"
                                 : isDeclined
                                    ? "Offer Declined"
                                    : isExpired
                                       ? "Offer Expired"
                                       : student.admission_status
                     }
                     status={
                        isPending
                           ? "pending"
                           : isOffered
                              ? "success"
                              : isRejected || isDeclined || isExpired
                                 ? "failed"
                                 : "info"
                     }
                  />
               </div>

               {/* Pending state */}
               {isPending && (
                  <motion.div
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     className="flex flex-col items-center gap-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-8 dark:bg-amber-500/10"
                  >
                     <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                     >
                        <Clock className="size-12 text-amber-500" />
                     </motion.div>
                     <div className="space-y-1 text-center">
                        <p className="text-sm font-semibold text-foreground">
                           Awaiting Review
                        </p>
                        <p className="max-w-sm text-xs text-muted-foreground">
                           Your application has been submitted and is currently being reviewed
                           by the admissions officer. You will receive an email notification
                           once a decision has been made.
                        </p>
                     </div>
                     <Button variant="outline" size="sm" onClick={onRefresh} className="gap-2">
                        <RefreshCw className="size-3.5" />
                        Check for Updates
                     </Button>
                  </motion.div>
               )}

               {/* Offered state */}
               {isOffered && (
                  <motion.div
                     initial={{ opacity: 0, scale: 0.95 }}
                     animate={{ opacity: 1, scale: 1 }}
                     className="flex flex-col items-center gap-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-8 dark:bg-emerald-500/10"
                  >
                     <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 10 }}
                     >
                        <CheckCircle className="size-12 text-emerald-500" />
                     </motion.div>
                     <div className="space-y-1 text-center">
                        <p className="text-lg font-bold text-foreground">
                           🎉 Congratulations!
                        </p>
                        <p className="max-w-sm text-sm text-muted-foreground">
                           You have been offered admission to{" "}
                           <span className="font-medium text-foreground">{student.department}</span>,
                           Faculty of {student.faculty}. Please accept or decline your offer below.
                        </p>
                     </div>

                     {/* Countdown timer */}
                     {countdown && !countdown.expired && (
                        <div className="flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2">
                           <Clock className="size-4 text-amber-600" />
                           <span className="text-xs font-medium text-amber-700 dark:text-amber-400">
                              Offer expires in:{" "}
                              <span className="font-mono font-bold">
                                 {countdown.days}d {countdown.hours}h {countdown.minutes}m {countdown.seconds}s
                              </span>
                           </span>
                        </div>
                     )}
                     {countdown?.expired && (
                        <div className="flex items-center gap-1.5 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2">
                           <TimerOff className="size-4 text-destructive" />
                           <span className="text-xs font-medium text-destructive">
                              This offer has expired. Please refresh to update status.
                           </span>
                        </div>
                     )}

                     {/* Accept / Decline buttons */}
                     <div className="flex items-center gap-3">
                        <Button
                           onClick={onRefresh}
                           className="gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
                           size="lg"
                        >
                           <CheckCircle className="size-4" />
                           Accept Offer
                        </Button>
                        <Button
                           variant="outline"
                           size="lg"
                           onClick={() => setShowDeclineConfirm(true)}
                           className="gap-2 border-destructive/50 text-destructive hover:bg-destructive/10"
                        >
                           <Ban className="size-4" />
                           Decline Offer
                        </Button>
                     </div>

                     {/* Decline confirmation */}
                     {showDeclineConfirm && (
                        <motion.div
                           initial={{ opacity: 0, y: -10 }}
                           animate={{ opacity: 1, y: 0 }}
                           className="w-full max-w-md rounded-xl border border-destructive/30 bg-destructive/5 p-4 dark:bg-destructive/10"
                        >
                           <div className="flex items-start gap-3">
                              <AlertTriangle className="mt-0.5 size-5 shrink-0 text-destructive" />
                              <div className="space-y-2">
                                 <p className="text-sm font-semibold text-destructive">
                                    Are you sure you want to decline?
                                 </p>
                                 <p className="text-xs text-muted-foreground">
                                    This action is irreversible. Your admission offer will be
                                    withdrawn, your spot will be freed for other applicants,
                                    and you will be logged out of the system.
                                 </p>
                                 <div className="flex gap-2 pt-1">
                                    <Button
                                       variant="destructive"
                                       size="sm"
                                       onClick={handleDecline}
                                       disabled={declineAdmission.isPending}
                                       className="gap-1.5"
                                    >
                                       {declineAdmission.isPending ? (
                                          <Loader2 className="size-3 animate-spin" />
                                       ) : (
                                          <Ban className="size-3" />
                                       )}
                                       Yes, Decline Offer
                                    </Button>
                                    <Button
                                       variant="outline"
                                       size="sm"
                                       onClick={() => setShowDeclineConfirm(false)}
                                    >
                                       Cancel
                                    </Button>
                                 </div>
                              </div>
                           </div>
                        </motion.div>
                     )}
                  </motion.div>
               )}

               {/* Declined state */}
               {isDeclined && (
                  <motion.div
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     className="flex flex-col items-center gap-4 rounded-xl border border-destructive/20 bg-destructive/5 p-8"
                  >
                     <Ban className="size-12 text-destructive" />
                     <div className="space-y-1 text-center">
                        <p className="text-sm font-semibold text-foreground">
                           Offer Declined
                        </p>
                        <p className="max-w-sm text-xs text-muted-foreground">
                           You have declined your admission offer. Your application has been
                           closed. You will be logged out automatically.
                        </p>
                     </div>
                     <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Loader2 className="size-3 animate-spin" />
                        Logging out…
                     </div>
                  </motion.div>
               )}

               {/* Expired state */}
               {isExpired && (
                  <motion.div
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     className="flex flex-col items-center gap-4 rounded-xl border border-amber-600/20 bg-amber-600/5 p-8 dark:bg-amber-600/10"
                  >
                     <TimerOff className="size-12 text-amber-600" />
                     <div className="space-y-1 text-center">
                        <p className="text-sm font-semibold text-foreground">
                           Admission Offer Expired
                        </p>
                        <p className="max-w-sm text-xs text-muted-foreground">
                           Your admission offer has expired because no response was received
                           before the deadline. The offer has been automatically revoked.
                           You will be logged out automatically.
                        </p>
                     </div>
                     <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Loader2 className="size-3 animate-spin" />
                        Logging out…
                     </div>
                  </motion.div>
               )}

               {/* Rejected state */}
               {isRejected && (
                  <motion.div
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     className="flex flex-col items-center gap-4 rounded-xl border border-destructive/20 bg-destructive/5 p-8"
                  >
                     <XCircle className="size-12 text-destructive" />
                     <div className="space-y-1 text-center">
                        <p className="text-sm font-semibold text-foreground">
                           Application Not Successful
                        </p>
                        <p className="max-w-sm text-xs text-muted-foreground">
                           Unfortunately, your application was not successful this time.
                           Please contact the admissions office for more information.
                        </p>
                     </div>
                  </motion.div>
               )}

               {/* Dev toolbar */}
               {process.env.NODE_ENV === "development" && isPending && (
                  <div className="rounded-lg border border-dashed border-amber-500/30 bg-amber-500/5 p-3">
                     <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-amber-600">
                        🛠 Dev Controls
                     </p>
                     <div className="flex flex-wrap gap-2">
                        <Button
                           variant="outline"
                           size="sm"
                           onClick={() => simulateOffered.mutate()}
                           disabled={simulateOffered.isPending}
                           className="gap-1.5 text-xs"
                        >
                           {simulateOffered.isPending ? (
                              <Loader2 className="size-3 animate-spin" />
                           ) : (
                              <CheckCircle className="size-3" />
                           )}
                           Simulate: Offer Admission
                        </Button>
                     </div>
                  </div>
               )}
               {process.env.NODE_ENV === "development" && isOffered && (
                  <div className="rounded-lg border border-dashed border-amber-500/30 bg-amber-500/5 p-3">
                     <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-amber-600">
                        🛠 Dev Controls
                     </p>
                     <div className="flex flex-wrap gap-2">
                        <Button
                           variant="outline"
                           size="sm"
                           onClick={() => simulateDeclined.mutate()}
                           disabled={simulateDeclined.isPending}
                           className="gap-1.5 text-xs"
                        >
                           {simulateDeclined.isPending ? (
                              <Loader2 className="size-3 animate-spin" />
                           ) : (
                              <Ban className="size-3" />
                           )}
                           Simulate: Decline Admission
                        </Button>
                        <Button
                           variant="outline"
                           size="sm"
                           onClick={() => simulateExpired.mutate()}
                           disabled={simulateExpired.isPending}
                           className="gap-1.5 text-xs"
                        >
                           {simulateExpired.isPending ? (
                              <Loader2 className="size-3 animate-spin" />
                           ) : (
                              <TimerOff className="size-3" />
                           )}
                           Simulate: Offer Expired
                        </Button>
                     </div>
                  </div>
               )}
            </CardContent>
         </Card>
      </motion.div>
   );
}
