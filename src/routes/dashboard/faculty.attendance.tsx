import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { UserCheck, CheckCircle2, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSubjects } from "@/lib/subjects-store";

export const Route = createFileRoute("/dashboard/faculty/attendance")({
  component: FacultyAttendance,
});

interface StudentRecord {
  id: string;
  name: string;
  status: "present" | "absent" | "late" | "unmarked";
}

const STORAGE_KEY = "bwest:faculty-attendance";

function getStoredAttendance(): Record<string, Record<string, StudentRecord[]>> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveAttendance(data: Record<string, Record<string, StudentRecord[]>>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

const SAMPLE_STUDENTS: Omit<StudentRecord, "status">[] = [
  { id: "s1", name: "Juan Dela Cruz" },
  { id: "s2", name: "Maria Santos" },
  { id: "s3", name: "Pedro Reyes" },
  { id: "s4", name: "Ana Garcia" },
  { id: "s5", name: "Carlos Rivera" },
];

function FacultyAttendance() {
  const subjects = useSubjects();
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const today = new Date().toISOString().slice(0, 10);

  const [allAttendance, setAllAttendance] = useState(() => getStoredAttendance());

  const students = useMemo(() => {
    if (!selectedSubject) return [];
    const existing = allAttendance[selectedSubject]?.[today];
    if (existing) return existing;
    return SAMPLE_STUDENTS.map((s) => ({ ...s, status: "unmarked" as const }));
  }, [selectedSubject, today, allAttendance]);

  const markStudent = (studentId: string, status: "present" | "absent" | "late") => {
    if (!selectedSubject) return;
    const updated = students.map((s) => (s.id === studentId ? { ...s, status } : s));
    const next = {
      ...allAttendance,
      [selectedSubject]: {
        ...allAttendance[selectedSubject],
        [today]: updated,
      },
    };
    setAllAttendance(next);
    saveAttendance(next);
  };

  const counts = useMemo(() => {
    const p = students.filter((s) => s.status === "present").length;
    const a = students.filter((s) => s.status === "absent").length;
    const l = students.filter((s) => s.status === "late").length;
    return { present: p, absent: a, late: l, total: students.length };
  }, [students]);

  const selected = subjects.find((s) => s.id === selectedSubject);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-xl font-bold text-foreground">Attendance</h1>
        <p className="text-sm text-muted-foreground">
          Mark student attendance for today — {new Date().toLocaleDateString("en-PH", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
        </p>
      </div>

      {/* Subject selector */}
      <div className="flex flex-wrap gap-2">
        {subjects.length === 0 ? (
          <p className="text-sm text-muted-foreground">No subjects yet. Add subjects in Classes first.</p>
        ) : (
          subjects.map((s) => (
            <Button
              key={s.id}
              variant={selectedSubject === s.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedSubject(s.id)}
            >
              {s.code}
            </Button>
          ))
        )}
      </div>

      {selected && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-accent" />
              <h2 className="font-heading text-sm font-semibold text-card-foreground">
                {selected.code} — {selected.title}
              </h2>
            </div>

            {/* Summary */}
            <div className="mb-4 flex gap-4 text-xs">
              <span className="flex items-center gap-1 text-green-600">
                <CheckCircle2 className="h-3 w-3" /> Present: {counts.present}
              </span>
              <span className="flex items-center gap-1 text-red-500">
                <XCircle className="h-3 w-3" /> Absent: {counts.absent}
              </span>
              <span className="flex items-center gap-1 text-yellow-500">
                <Clock className="h-3 w-3" /> Late: {counts.late}
              </span>
              <span className="text-muted-foreground">Total: {counts.total}</span>
            </div>

            {/* Student list */}
            <div className="space-y-2">
              {students.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/20 text-xs font-bold text-accent">
                      {student.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <span className="text-sm font-medium text-foreground">{student.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant={student.status === "present" ? "default" : "outline"}
                      className={student.status === "present" ? "bg-green-600 hover:bg-green-700 text-white" : ""}
                      onClick={() => markStudent(student.id, "present")}
                    >
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      Present
                    </Button>
                    <Button
                      size="sm"
                      variant={student.status === "late" ? "default" : "outline"}
                      className={student.status === "late" ? "bg-yellow-500 hover:bg-yellow-600 text-white" : ""}
                      onClick={() => markStudent(student.id, "late")}
                    >
                      <Clock className="mr-1 h-3 w-3" />
                      Late
                    </Button>
                    <Button
                      size="sm"
                      variant={student.status === "absent" ? "default" : "outline"}
                      className={student.status === "absent" ? "bg-red-500 hover:bg-red-600 text-white" : ""}
                      onClick={() => markStudent(student.id, "absent")}
                    >
                      <XCircle className="mr-1 h-3 w-3" />
                      Absent
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
