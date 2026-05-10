// One-click demo data seeder. Populates localStorage so every dashboard
// (Student, Faculty, Registrar, Finance, Admin) shows realistic data
// without requiring a backend.

const KEYS = {
  subjects: "bwest:student-subjects",
  payments: "bwest:paymongo-payments",
  attendance: "bwest:faculty-attendance",
  seeded: "bwest:demo-seeded",
} as const;

const SUBJECTS_EVENT = "bwest:subjects-changed";

export function seedDemoData() {
  const now = Date.now();

  // --- Subjects (drives Enrollment, Schedule, Grades, Faculty Classes) ---
  const subjects = [
    { id: crypto.randomUUID(), code: "CS 101", title: "Introduction to Computing", units: 3, schedule: "MWF 8:00-9:00 AM", room: "Room 201", instructor: "Dr. Maria Santos", addedAt: now },
    { id: crypto.randomUUID(), code: "CS 211", title: "Data Structures & Algorithms", units: 3, schedule: "TTh 9:30-11:00 AM", room: "Room 305", instructor: "Prof. Jose Rizal", addedAt: now + 1 },
    { id: crypto.randomUUID(), code: "MATH 121", title: "Discrete Mathematics", units: 3, schedule: "MWF 10:00-11:00 AM", room: "Room 102", instructor: "Dr. Elena Cruz", addedAt: now + 2 },
    { id: crypto.randomUUID(), code: "ENG 101", title: "Technical Writing", units: 3, schedule: "TTh 1:00-2:30 PM", room: "Room 410", instructor: "Prof. Anna Lim", addedAt: now + 3 },
    { id: crypto.randomUUID(), code: "PE 102", title: "Physical Fitness", units: 2, schedule: "F 2:00-4:00 PM", room: "Gymnasium", instructor: "Coach Mike Reyes", addedAt: now + 4 },
  ];
  localStorage.setItem(KEYS.subjects, JSON.stringify(subjects));

  // --- Payment history (drives Student Finances + Finance dashboards) ---
  const payments = [
    { id: "pay_1", amount: 15000, checkoutUrl: "#", referenceNumber: "BW-2026-0001", status: "paid", description: "Tuition Down Payment", createdAt: new Date(now - 1000 * 60 * 60 * 24 * 30).toISOString() },
    { id: "pay_2", amount: 10000, checkoutUrl: "#", referenceNumber: "BW-2026-0002", status: "paid", description: "Mid-semester Payment", createdAt: new Date(now - 1000 * 60 * 60 * 24 * 14).toISOString() },
    { id: "pay_3", amount: 5000, checkoutUrl: "#", referenceNumber: "BW-2026-0003", status: "paid", description: "Miscellaneous Fees", createdAt: new Date(now - 1000 * 60 * 60 * 24 * 7).toISOString() },
    { id: "pay_4", amount: 7500, checkoutUrl: "#", referenceNumber: "BW-2026-0004", status: "pending", description: "Laboratory Fee", createdAt: new Date(now - 1000 * 60 * 60 * 24 * 2).toISOString() },
    { id: "pay_5", amount: 3000, checkoutUrl: "#", referenceNumber: "BW-2026-0005", status: "paid", description: "Library Fee", createdAt: new Date(now - 1000 * 60 * 60 * 6).toISOString() },
  ];
  localStorage.setItem(KEYS.payments, JSON.stringify(payments));

  // --- Faculty attendance records keyed by subjectId -> dateISO -> students ---
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(now - 86400000).toISOString().split("T")[0];
  const students = [
    { id: "s1", name: "Juan Dela Cruz" },
    { id: "s2", name: "Maria Garcia" },
    { id: "s3", name: "Pedro Reyes" },
    { id: "s4", name: "Ana Santos" },
    { id: "s5", name: "Carlos Rivera" },
  ];
  const statuses: Array<"present" | "late" | "absent"> = ["present", "present", "late", "present", "absent"];
  const statuses2: Array<"present" | "late" | "absent"> = ["present", "present", "present", "late", "present"];
  const attendance: Record<string, Record<string, typeof students[number] extends infer S ? (S & { status: string })[] : never>> = {};
  subjects.slice(0, 2).forEach((subj, idx) => {
    attendance[subj.id] = {
      [today]: students.map((s, i) => ({ ...s, status: (idx === 0 ? statuses : statuses2)[i] })) as never,
      [yesterday]: students.map((s) => ({ ...s, status: "present" })) as never,
    };
  });
  localStorage.setItem(KEYS.attendance, JSON.stringify(attendance));

  localStorage.setItem(KEYS.seeded, new Date().toISOString());

  // Notify subject store listeners so live UIs refresh.
  window.dispatchEvent(new CustomEvent(SUBJECTS_EVENT));
  window.dispatchEvent(new StorageEvent("storage"));
}

export function clearDemoData() {
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
  window.dispatchEvent(new CustomEvent(SUBJECTS_EVENT));
  window.dispatchEvent(new StorageEvent("storage"));
}

export function isDemoSeeded(): boolean {
  return !!localStorage.getItem(KEYS.seeded);
}

export function getSeededAt(): string | null {
  return localStorage.getItem(KEYS.seeded);
}
