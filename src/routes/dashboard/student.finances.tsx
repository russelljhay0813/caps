import { createFileRoute } from "@tanstack/react-router";
import { useState, useCallback, useEffect, useMemo } from "react";
import { useServerFn } from "@tanstack/react-start";
import { motion, AnimatePresence } from "framer-motion";
import {
  DollarSign,
  CreditCard,
  Receipt,
  ExternalLink,
  RefreshCw,
  CheckCircle,
  Clock,
  AlertCircle,
  Wallet,
  ArrowRight,
  Download,
  X,
  History,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/StatCard";
import { createPaymentLink, getPaymentStatus } from "@/lib/paymongo.functions";
import { useSubjects } from "@/lib/subjects-store";

export const Route = createFileRoute("/dashboard/student/finances")({
  component: StudentFinances,
});

const TUITION_PER_UNIT = 1500;
const MISC_FEE = 5000;

interface PaymentRecord {
  id: string;
  amount: number;
  checkoutUrl: string;
  referenceNumber: string;
  status: string;
  description: string;
  createdAt: string;
}

const PRESET_AMOUNTS = [1000, 5000, 10000, 15000];

const STORAGE_KEY = "bwest:paymongo-payments";

function StudentFinances() {
  const [depositAmount, setDepositAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payments, setPayments] = useState<PaymentRecord[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as PaymentRecord[]) : [];
    } catch {
      return [];
    }
  });
  const [selectedReceipt, setSelectedReceipt] = useState<PaymentRecord | null>(null);
  const [checkingStatus, setCheckingStatus] = useState<string | null>(null);
  const [historyFilter, setHistoryFilter] = useState<"all" | "paid" | "unpaid">("all");
  const [historySearch, setHistorySearch] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payments));
    } catch {
      /* ignore */
    }
  }, [payments]);

  const filteredHistory = useMemo(() => {
    const q = historySearch.trim().toLowerCase();
    return payments
      .filter((p) => (historyFilter === "all" ? true : p.status === historyFilter))
      .filter((p) =>
        q
          ? p.referenceNumber.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q) ||
            p.amount.toString().includes(q)
          : true
      )
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }, [payments, historyFilter, historySearch]);

  const subjects = useSubjects();
  const totalUnits = subjects.reduce((sum, s) => sum + s.units, 0);
  const tuition = totalUnits * TUITION_PER_UNIT;
  const totalAssessment = tuition + (subjects.length > 0 ? MISC_FEE : 0);
  const totalPaid = payments
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + p.amount, 0);
  const balance = Math.max(0, totalAssessment - totalPaid);
  const paidPct = totalAssessment > 0 ? Math.round((totalPaid / totalAssessment) * 100) : 0;
  const ewallet = Math.max(0, totalPaid - totalAssessment);

  const createPaymentLinkFn = useServerFn(createPaymentLink);
  const getPaymentStatusFn = useServerFn(getPaymentStatus);

  const handleDeposit = useCallback(async () => {
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount < 100) {
      setError("Minimum deposit is ₱100");
      return;
    }
    if (amount > 500000) {
      setError("Maximum deposit is ₱500,000");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const result = await createPaymentLinkFn({
        data: {
          amount,
          description: `BWEST College Tuition Deposit`,
          studentId: "2021-00145",
          studentName: "Juan Dela Cruz",
        },
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      const newPayment: PaymentRecord = {
        id: result.paymentLink.id,
        amount: result.paymentLink.amount,
        checkoutUrl: result.paymentLink.checkoutUrl,
        referenceNumber: result.paymentLink.referenceNumber,
        status: result.paymentLink.status,
        description: "Tuition Deposit",
        createdAt: new Date().toISOString(),
      };

      setPayments((prev) => [newPayment, ...prev]);
      setDepositAmount("");

      // Open checkout in new tab
      window.open(result.paymentLink.checkoutUrl, "_blank");
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  }, [depositAmount, createPaymentLinkFn]);

  const handleCheckStatus = useCallback(
    async (payment: PaymentRecord) => {
      setCheckingStatus(payment.id);
      try {
        const result = await getPaymentStatusFn({
          data: { linkId: payment.id },
        });

        if (result.success) {
          setPayments((prev) =>
            prev.map((p) =>
              p.id === payment.id ? { ...p, status: result.payment.status } : p
            )
          );
        }
      } catch (err) {
        console.error("Status check failed:", err);
      } finally {
        setCheckingStatus(null);
      }
    },
    [getPaymentStatusFn]
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return { icon: CheckCircle, label: "Paid", className: "bg-success/10 text-success" };
      case "unpaid":
        return { icon: Clock, label: "Pending", className: "bg-warning/10 text-warning" };
      default:
        return { icon: AlertCircle, label: status, className: "bg-muted text-muted-foreground" };
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-xl font-bold text-foreground">
          Finances & Payments
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage your tuition payments and view financial records
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: "Total Assessment",
            value: `₱${totalAssessment.toLocaleString("en-PH")}`,
            subtitle: `${subjects.length} subjects · ${totalUnits} units`,
            icon: DollarSign,
          },
          {
            title: "Total Paid",
            value: `₱${totalPaid.toLocaleString("en-PH")}`,
            subtitle: totalAssessment > 0 ? `${paidPct}% of total` : "No assessment yet",
            icon: CheckCircle,
          },
          {
            title: "Remaining Balance",
            value: `₱${balance.toLocaleString("en-PH")}`,
            subtitle: balance > 0 ? "Settle before semester ends" : "Fully settled",
            icon: CreditCard,
          },
          {
            title: "E-Wallet Balance",
            value: `₱${ewallet.toLocaleString("en-PH")}`,
            subtitle: "Advance deposits",
            icon: Wallet,
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <StatCard {...stat} />
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Deposit Section */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-xl border bg-card p-5 shadow-sm"
          >
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 text-accent">
                <Wallet className="h-4 w-4" />
              </div>
              <h2 className="font-heading text-sm font-semibold text-card-foreground">
                Make a Deposit
              </h2>
            </div>

            <p className="mb-4 text-xs text-muted-foreground">
              Pay via PayMongo — supports GCash, Maya, cards, and online banking.
            </p>

            {/* Quick amounts */}
            <div className="mb-3 grid grid-cols-2 gap-2">
              {PRESET_AMOUNTS.map((amt) => (
                <button
                  key={amt}
                  onClick={() => {
                    setDepositAmount(amt.toString());
                    setError(null);
                  }}
                  className={`rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                    depositAmount === amt.toString()
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-border bg-background text-foreground hover:border-accent/50"
                  }`}
                >
                  ₱{amt.toLocaleString()}
                </button>
              ))}
            </div>

            {/* Custom amount */}
            <div className="mb-3">
              <label className="mb-1 block text-[11px] font-medium text-muted-foreground">
                Or enter custom amount (₱)
              </label>
              <input
                type="number"
                min="100"
                max="500000"
                placeholder="0.00"
                value={depositAmount}
                onChange={(e) => {
                  setDepositAmount(e.target.value);
                  setError(null);
                }}
                className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>

            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-3 text-xs text-destructive"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <Button
              onClick={handleDeposit}
              disabled={isProcessing || !depositAmount}
              className="w-full gap-2"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Proceed to Payment
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>

            <p className="mt-3 text-center text-[10px] text-muted-foreground">
              Powered by PayMongo (Sandbox Mode)
            </p>
          </motion.div>

          {/* Fee Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-4 rounded-xl border bg-card p-5 shadow-sm"
          >
            <h2 className="font-heading text-sm font-semibold text-card-foreground">
              Fee Breakdown
            </h2>
            <div className="mt-3 space-y-2">
              {[
                { label: "Tuition Fee", amount: "₱35,000", paid: true },
                { label: "Miscellaneous Fee", amount: "₱5,000", paid: true },
                { label: "Laboratory Fee", amount: "₱8,000", paid: false },
                { label: "Registration Fee", amount: "₱550", paid: true },
              ].map((fee) => (
                <div
                  key={fee.label}
                  className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2"
                >
                  <span className="text-xs text-foreground">{fee.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-foreground">
                      {fee.amount}
                    </span>
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[9px] font-medium ${
                        fee.paid
                          ? "bg-success/10 text-success"
                          : "bg-warning/10 text-warning"
                      }`}
                    >
                      {fee.paid ? "Paid" : "Unpaid"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Transaction History */}
        <div className="lg:col-span-3">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="rounded-xl border bg-card p-5 shadow-sm"
          >
            <h2 className="font-heading text-sm font-semibold text-card-foreground">
              Transaction History
            </h2>

            {payments.length === 0 ? (
              <div className="mt-8 flex flex-col items-center justify-center py-8 text-center">
                <Receipt className="mb-3 h-10 w-10 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">
                  No transactions yet
                </p>
                <p className="text-xs text-muted-foreground/70">
                  Make a deposit to see your transaction history
                </p>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {payments.map((payment) => {
                  const badge = getStatusBadge(payment.status);
                  const StatusIcon = badge.icon;
                  return (
                    <motion.div
                      key={payment.id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="rounded-lg border bg-background p-4"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-foreground">
                              ₱{payment.amount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                            </span>
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${badge.className}`}
                            >
                              <StatusIcon className="h-3 w-3" />
                              {badge.label}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Ref: {payment.referenceNumber}
                          </p>
                          <p className="text-[10px] text-muted-foreground/70">
                            {new Date(payment.createdAt).toLocaleString("en-PH")}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleCheckStatus(payment)}
                            disabled={checkingStatus === payment.id}
                            title="Refresh status"
                          >
                            <RefreshCw
                              className={`h-3.5 w-3.5 ${checkingStatus === payment.id ? "animate-spin" : ""}`}
                            />
                          </Button>
                          {payment.status === "unpaid" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() =>
                                window.open(payment.checkoutUrl, "_blank")
                              }
                              title="Open checkout"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setSelectedReceipt(payment)}
                            title="View receipt"
                          >
                            <Receipt className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Payment History — full PayMongo log */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="rounded-xl border bg-card p-5 shadow-sm"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 text-accent">
              <History className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-heading text-sm font-semibold text-card-foreground">
                Payment History
              </h2>
              <p className="text-[11px] text-muted-foreground">
                Complete record of PayMongo transactions
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                placeholder="Search ref or amount"
                className="w-48 rounded-lg border bg-background py-1.5 pl-7 pr-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none"
              />
            </div>
            <div className="flex rounded-lg border bg-background p-0.5">
              {(["all", "paid", "unpaid"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setHistoryFilter(f)}
                  className={`rounded-md px-3 py-1 text-[11px] font-medium capitalize transition-colors ${
                    historyFilter === f
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {filteredHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <History className="mb-3 h-10 w-10 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">
              {payments.length === 0
                ? "No payment history yet"
                : "No payments match your filters"}
            </p>
            <p className="text-xs text-muted-foreground/70">
              {payments.length === 0
                ? "Your PayMongo transactions will appear here"
                : "Try a different search or status filter"}
            </p>
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left">
              <thead>
                <tr className="border-b text-[10px] uppercase tracking-wider text-muted-foreground">
                  <th className="px-3 py-2 font-medium">Date</th>
                  <th className="px-3 py-2 font-medium">Reference</th>
                  <th className="px-3 py-2 font-medium">Description</th>
                  <th className="px-3 py-2 text-right font-medium">Amount</th>
                  <th className="px-3 py-2 text-center font-medium">Status</th>
                  <th className="px-3 py-2 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map((payment) => {
                  const badge = getStatusBadge(payment.status);
                  const StatusIcon = badge.icon;
                  const date = new Date(payment.createdAt);
                  return (
                    <tr
                      key={payment.id}
                      className="border-b border-border/50 text-xs transition-colors hover:bg-muted/40"
                    >
                      <td className="px-3 py-3">
                        <div className="font-medium text-foreground">
                          {date.toLocaleDateString("en-PH", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {date.toLocaleTimeString("en-PH", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </td>
                      <td className="px-3 py-3 font-mono text-[11px] text-muted-foreground">
                        {payment.referenceNumber}
                      </td>
                      <td className="px-3 py-3 text-foreground">
                        {payment.description}
                      </td>
                      <td className="px-3 py-3 text-right font-medium text-foreground">
                        ₱
                        {payment.amount.toLocaleString("en-PH", {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${badge.className}`}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleCheckStatus(payment)}
                            disabled={checkingStatus === payment.id}
                            title="Refresh status"
                          >
                            <RefreshCw
                              className={`h-3 w-3 ${checkingStatus === payment.id ? "animate-spin" : ""}`}
                            />
                          </Button>
                          {payment.status === "unpaid" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() =>
                                window.open(payment.checkoutUrl, "_blank")
                              }
                              title="Open checkout"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => setSelectedReceipt(payment)}
                            title="View receipt"
                          >
                            <Receipt className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="text-[11px]">
                  <td colSpan={3} className="px-3 pt-3 text-muted-foreground">
                    Showing {filteredHistory.length} of {payments.length} transactions
                  </td>
                  <td className="px-3 pt-3 text-right font-semibold text-foreground">
                    ₱
                    {filteredHistory
                      .reduce((sum, p) => sum + p.amount, 0)
                      .toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                  </td>
                  <td colSpan={2} className="px-3 pt-3 text-right text-muted-foreground">
                    Total
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </motion.div>

      {/* Receipt Modal */}
      <AnimatePresence>
        {selectedReceipt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4"
            onClick={() => setSelectedReceipt(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl bg-card p-6 shadow-xl"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-heading text-base font-bold text-card-foreground">
                  Payment Receipt
                </h3>
                <button
                  onClick={() => setSelectedReceipt(null)}
                  className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-5 rounded-xl border bg-background p-5">
                <div className="mb-4 text-center">
                  <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent">
                    <Receipt className="h-6 w-6" />
                  </div>
                  <p className="font-heading text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    BWEST College
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Official Payment Receipt
                  </p>
                </div>

                <div className="space-y-3 border-t pt-3">
                  {[
                    { label: "Reference No.", value: selectedReceipt.referenceNumber },
                    { label: "Amount", value: `₱${selectedReceipt.amount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}` },
                    { label: "Status", value: selectedReceipt.status === "paid" ? "Paid" : "Pending" },
                    { label: "Description", value: selectedReceipt.description },
                    { label: "Student", value: "Juan Dela Cruz" },
                    { label: "Student ID", value: "2021-00145" },
                    { label: "Date", value: new Date(selectedReceipt.createdAt).toLocaleString("en-PH") },
                  ].map((row) => (
                    <div
                      key={row.label}
                      className="flex items-center justify-between text-xs"
                    >
                      <span className="text-muted-foreground">{row.label}</span>
                      <span className="font-medium text-foreground">
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 border-t pt-3 text-center text-[9px] text-muted-foreground/60">
                  This is a system-generated receipt from BWEST College AFMS.
                  <br />
                  PayMongo Sandbox — For testing purposes only.
                </div>
              </div>

              <Button
                onClick={() => window.print()}
                variant="outline"
                className="mt-4 w-full gap-2"
              >
                <Download className="h-4 w-4" />
                Print / Save Receipt
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
