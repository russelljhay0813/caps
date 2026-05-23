// LocalStorage-backed student registration store.
// Workflow: student submits register form -> pending -> registrar approves/rejects -> approved students can log in.

export type RegistrationStatus = "pending" | "approved" | "rejected";

export interface StudentRegistration {
  id: string;
  studentId: string; // generated on approval, e.g. "2026-00001"
  firstName: string;
  lastName: string;
  email: string;
  password: string; // demo only - plaintext in localStorage
  educationLevel: "JHS" | "SHS" | "College";
  program: string; // college program (empty for JHS/SHS)
  yearLevel: string; // college year level (empty for JHS/SHS)
  gradeLevel: string; // JHS/SHS grade (empty for College)
  strand: string; // SHS strand (empty otherwise)
  contactNumber: string;
  address: string;
  status: RegistrationStatus;
  submittedAt: string;
  reviewedAt?: string;
  reviewNote?: string;
}

const KEY = "bwest:registrations";
export const REGISTRATIONS_EVENT = "bwest:registrations-changed";

function read(): StudentRegistration[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as StudentRegistration[]) : [];
  } catch {
    return [];
  }
}

function write(list: StudentRegistration[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new Event(REGISTRATIONS_EVENT));
}

export function getRegistrations(): StudentRegistration[] {
  return read();
}

export function getPending(): StudentRegistration[] {
  return read().filter((r) => r.status === "pending");
}

export function findApprovedByEmail(email: string, password: string): StudentRegistration | null {
  const norm = email.trim().toLowerCase();
  return read().find((r) => r.email.toLowerCase() === norm && r.password === password && r.status === "approved") ?? null;
}

export function emailExists(email: string): boolean {
  const norm = email.trim().toLowerCase();
  return read().some((r) => r.email.toLowerCase() === norm);
}

export function submitRegistration(
  data: Omit<StudentRegistration, "id" | "studentId" | "status" | "submittedAt">,
): StudentRegistration {
  const list = read();
  const reg: StudentRegistration = {
    ...data,
    id: crypto.randomUUID(),
    studentId: "",
    status: "pending",
    submittedAt: new Date().toISOString(),
  };
  list.unshift(reg);
  write(list);
  return reg;
}

function nextStudentId(list: StudentRegistration[]): string {
  const year = new Date().getFullYear();
  const approved = list.filter((r) => r.studentId.startsWith(String(year)));
  const next = approved.length + 1;
  return `${year}-${String(next).padStart(5, "0")}`;
}

export function approveRegistration(id: string, note?: string) {
  const list = read();
  const reg = list.find((r) => r.id === id);
  if (!reg) return;
  reg.status = "approved";
  reg.studentId = nextStudentId(list);
  reg.reviewedAt = new Date().toISOString();
  reg.reviewNote = note;
  write(list);
}

export function rejectRegistration(id: string, note?: string) {
  const list = read();
  const reg = list.find((r) => r.id === id);
  if (!reg) return;
  reg.status = "rejected";
  reg.reviewedAt = new Date().toISOString();
  reg.reviewNote = note;
  write(list);
}
