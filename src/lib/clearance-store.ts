// Financial clearance workflow store. Tracks per-student account balances
// and issued clearance certificates. LocalStorage-backed for the demo.

export interface StudentAccount {
  id: string;
  name: string;
  program: string;
  assessed: number;
  paid: number;
  balance: number;
}

export interface ClearanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  program: string;
  amountCleared: number;
  referenceNumber: string;
  issuedAt: string; // ISO
  issuedBy: string;
  semester: string;
  status: "issued" | "revoked";
}

const KEY = "bwest:clearances";
const ACCOUNTS_KEY = "bwest:finance-accounts";
export const CLEARANCE_EVENT = "bwest:clearance-changed";

const DEFAULT_ACCOUNTS: StudentAccount[] = [
  { id: "2021-00145", name: "Juan Dela Cruz", program: "BSCS", assessed: 45000, paid: 45000, balance: 0 },
  { id: "2020-00892", name: "Maria Garcia", program: "BSIT", assessed: 42000, paid: 42000, balance: 0 },
  { id: "2022-00334", name: "Pedro Reyes", program: "BSA", assessed: 48000, paid: 15000, balance: 33000 },
  { id: "2021-00567", name: "Ana Santos", program: "BSEd", assessed: 38000, paid: 38000, balance: 0 },
  { id: "2023-00112", name: "Rico Mendoza", program: "BSCS", assessed: 45000, paid: 22500, balance: 22500 },
  { id: "2023-00245", name: "Lara Tan", program: "BSBA", assessed: 40000, paid: 0, balance: 40000 },
];

export function getAccounts(): StudentAccount[] {
  if (typeof window === "undefined") return DEFAULT_ACCOUNTS;
  const raw = localStorage.getItem(ACCOUNTS_KEY);
  if (!raw) return DEFAULT_ACCOUNTS;
  try {
    return JSON.parse(raw) as StudentAccount[];
  } catch {
    return DEFAULT_ACCOUNTS;
  }
}

export function markAccountPaid(studentId: string) {
  const accounts = getAccounts().map((a) =>
    a.id === studentId ? { ...a, paid: a.assessed, balance: 0 } : a
  );
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  window.dispatchEvent(new CustomEvent(CLEARANCE_EVENT));
}

export function getClearances(): ClearanceRecord[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as ClearanceRecord[];
  } catch {
    return [];
  }
}

function saveClearances(list: ClearanceRecord[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent(CLEARANCE_EVENT));
}

export function issueClearance(
  account: StudentAccount,
  opts: { issuedBy: string; semester: string }
): { ok: true; record: ClearanceRecord } | { ok: false; error: string } {
  if (account.balance > 0) {
    return { ok: false, error: "Cannot issue clearance — outstanding balance remaining." };
  }
  const existing = getClearances().find(
    (c) => c.studentId === account.id && c.semester === opts.semester && c.status === "issued"
  );
  if (existing) {
    return { ok: false, error: "Clearance already issued for this semester." };
  }
  const record: ClearanceRecord = {
    id: crypto.randomUUID(),
    studentId: account.id,
    studentName: account.name,
    program: account.program,
    amountCleared: account.paid,
    referenceNumber: `FC-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000 + 1000)}`,
    issuedAt: new Date().toISOString(),
    issuedBy: opts.issuedBy,
    semester: opts.semester,
    status: "issued",
  };
  saveClearances([record, ...getClearances()]);
  return { ok: true, record };
}

export function revokeClearance(id: string) {
  const list = getClearances().map((c) => (c.id === id ? { ...c, status: "revoked" as const } : c));
  saveClearances(list);
}
