import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { GraduationCap, CheckCircle2, ArrowLeft } from "lucide-react";
import { z } from "zod";
import { emailExists, submitRegistration } from "@/lib/registrations-store";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Student Registration — BWEST College" },
      { name: "description", content: "Apply for admission to BWEST College. Submit your registration for registrar approval." },
    ],
  }),
  component: RegisterPage,
});

const PROGRAMS = [
  "BS Computer Science",
  "BS Information Technology",
  "BS Business Administration",
  "BS Accountancy",
  "BS Education",
  "BS Nursing",
];

const schema = z.object({
  firstName: z.string().trim().min(1, "Required").max(60),
  lastName: z.string().trim().min(1, "Required").max(60),
  email: z.string().trim().email("Invalid email").max(120),
  password: z.string().min(6, "Min 6 characters").max(72),
  program: z.string().min(1, "Select a program"),
  yearLevel: z.string().min(1, "Select year level"),
  contactNumber: z.string().trim().min(7, "Invalid").max(20),
  address: z.string().trim().min(1, "Required").max(200),
});

function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", password: "",
    program: "", yearLevel: "1st Year", contactNumber: "", address: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((i) => { fieldErrors[i.path[0] as string] = i.message; });
      setErrors(fieldErrors);
      return;
    }
    if (emailExists(form.email)) {
      setErrors({ email: "This email is already registered" });
      return;
    }
    submitRegistration(parsed.data);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md rounded-2xl border bg-card p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-success/10 text-success">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <h1 className="font-heading text-xl font-bold text-foreground">Application Submitted</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Thank you, <span className="font-medium text-foreground">{form.firstName}</span>. Your registration is now pending review by the Registrar's Office.
            You'll be able to log in once your application is approved.
          </p>
          <Link to="/" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
            <ArrowLeft className="h-4 w-4" /> Back to Login
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
            <GraduationCap className="h-7 w-7" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Student Registration</h1>
          <p className="mt-1 text-sm text-muted-foreground">Apply for admission. Approval by the Registrar is required before login.</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border bg-card p-6 shadow-sm space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="First Name" error={errors.firstName}>
              <input className="input" value={form.firstName} onChange={(e) => set("firstName", e.target.value)} />
            </Field>
            <Field label="Last Name" error={errors.lastName}>
              <input className="input" value={form.lastName} onChange={(e) => set("lastName", e.target.value)} />
            </Field>
            <Field label="Email" error={errors.email}>
              <input type="email" className="input" value={form.email} onChange={(e) => set("email", e.target.value)} />
            </Field>
            <Field label="Password" error={errors.password}>
              <input type="password" className="input" value={form.password} onChange={(e) => set("password", e.target.value)} />
            </Field>
            <Field label="Program" error={errors.program}>
              <select className="input" value={form.program} onChange={(e) => set("program", e.target.value)}>
                <option value="">Select program...</option>
                {PROGRAMS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </Field>
            <Field label="Year Level" error={errors.yearLevel}>
              <select className="input" value={form.yearLevel} onChange={(e) => set("yearLevel", e.target.value)}>
                {["1st Year", "2nd Year", "3rd Year", "4th Year"].map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </Field>
            <Field label="Contact Number" error={errors.contactNumber}>
              <input className="input" value={form.contactNumber} onChange={(e) => set("contactNumber", e.target.value)} />
            </Field>
            <Field label="Address" error={errors.address}>
              <input className="input" value={form.address} onChange={(e) => set("address", e.target.value)} />
            </Field>
          </div>

          <div className="flex items-center justify-between pt-2">
            <Link to="/" className="text-xs text-muted-foreground hover:text-foreground">← Back to Login</Link>
            <button type="submit" className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90">
              Submit Application
            </button>
          </div>
        </form>
      </motion.div>
      <style>{`.input{width:100%;border:1px solid hsl(var(--border));background:transparent;border-radius:0.5rem;padding:0.5rem 0.75rem;font-size:0.875rem;color:hsl(var(--foreground));outline:none}.input:focus{border-color:hsl(var(--accent));box-shadow:0 0 0 2px hsl(var(--accent)/0.2)}`}</style>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      {children}
      {error && <p className="text-[11px] text-destructive">{error}</p>}
    </div>
  );
}
