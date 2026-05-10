import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { BookOpen, Sparkles } from "lucide-react";
import { useSubjects } from "@/lib/subjects-store";

export const Route = createFileRoute("/dashboard/student/enrollment")({
  component: StudentEnrollment,
});

function StudentEnrollment() {
  const subjects = useSubjects();
  const totalUnits = subjects.reduce((sum, s) => sum + s.units, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-xl font-bold text-foreground">Enrollment</h1>
        <p className="text-sm text-muted-foreground">
          Subjects assigned to you by your instructors for this semester.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">Subjects Enrolled</p>
          <p className="mt-1 font-heading text-2xl font-bold text-foreground">{subjects.length}</p>
        </div>
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">Total Units</p>
          <p className="mt-1 font-heading text-2xl font-bold text-foreground">{totalUnits}</p>
        </div>
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">Status</p>
          <p className="mt-1 font-heading text-2xl font-bold text-success">Active</p>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-accent" />
          <h2 className="font-heading text-sm font-semibold text-card-foreground">My Subjects</h2>
        </div>

        {subjects.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-lg bg-muted/50 px-4 py-10 text-center">
            <Sparkles className="h-6 w-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No subjects yet. Once your faculty adds a subject, it will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {subjects.map((s) => (
              <motion.div
                key={s.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between gap-4 rounded-lg bg-muted/50 px-4 py-3"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-heading text-sm font-bold text-foreground">{s.code}</span>
                    <span className="text-sm text-foreground">{s.title}</span>
                  </div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {s.schedule} · {s.room} · Instructor: {s.instructor}
                  </div>
                </div>
                <span className="rounded-full bg-accent/10 px-2.5 py-1 text-xs font-semibold text-accent">
                  {s.units} units
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
