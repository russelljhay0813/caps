import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { BookOpen, Plus, Trash2, Send, Pencil, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import {
  addSubject,
  removeSubject,
  updateSubject,
  useSubjects,
  type Subject,
} from "@/lib/subjects-store";

export const Route = createFileRoute("/dashboard/faculty/classes")({
  component: FacultyClasses,
});

interface EditDraft {
  code: string;
  title: string;
  units: string;
  schedule: string;
  room: string;
}

function FacultyClasses() {
  const { user } = useAuth();
  const subjects = useSubjects();

  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [units, setUnits] = useState("3");
  const [schedule, setSchedule] = useState("");
  const [room, setRoom] = useState("");

  const [editing, setEditing] = useState<Subject | null>(null);
  const [draft, setDraft] = useState<EditDraft | null>(null);
  const [confirmEditOpen, setConfirmEditOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Subject | null>(null);

  const reset = () => {
    setCode("");
    setTitle("");
    setUnits("3");
    setSchedule("");
    setRoom("");
  };

  const handleAdd = (e: FormEvent) => {
    e.preventDefault();
    if (!code || !title) {
      toast.error("Subject code and title are required");
      return;
    }
    const added = addSubject({
      code: code.toUpperCase().trim(),
      title: title.trim(),
      units: Number(units) || 3,
      schedule: schedule.trim() || "TBA",
      room: room.trim() || "TBA",
      instructor: user?.name ?? "Faculty",
    });
    toast.success(`${added.code} pushed to student dashboard`, {
      description: `${added.title} • ${added.units} units`,
      icon: <Send className="h-4 w-4" />,
    });
    reset();
  };

  const openEdit = (s: Subject) => {
    setEditing(s);
    setDraft({
      code: s.code,
      title: s.title,
      units: String(s.units),
      schedule: s.schedule,
      room: s.room,
    });
  };

  const closeEdit = () => {
    setEditing(null);
    setDraft(null);
    setConfirmEditOpen(false);
  };

  const requestSave = () => {
    if (!draft) return;
    if (!draft.code.trim() || !draft.title.trim()) {
      toast.error("Subject code and title are required");
      return;
    }
    setConfirmEditOpen(true);
  };

  const confirmSave = () => {
    if (!editing || !draft) return;
    updateSubject(editing.id, {
      code: draft.code.toUpperCase().trim(),
      title: draft.title.trim(),
      units: Number(draft.units) || 3,
      schedule: draft.schedule.trim() || "TBA",
      room: draft.room.trim() || "TBA",
    });
    toast.success(`${draft.code.toUpperCase()} updated on student dashboard`, {
      icon: <Check className="h-4 w-4" />,
    });
    closeEdit();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-xl font-bold text-foreground">Class Management</h1>
        <p className="text-sm text-muted-foreground">
          Add a subject and it will appear instantly in the student's enrollment view.
        </p>
      </div>

      <motion.form
        onSubmit={handleAdd}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border bg-card p-5 shadow-sm"
      >
        <div className="mb-4 flex items-center gap-2">
          <Plus className="h-4 w-4 text-accent" />
          <h2 className="font-heading text-sm font-semibold text-card-foreground">
            Add Subject
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="code">Subject Code</Label>
            <Input id="code" placeholder="CS 201" value={code} onChange={(e) => setCode(e.target.value)} />
          </div>
          <div className="space-y-1.5 lg:col-span-2">
            <Label htmlFor="title">Subject Title</Label>
            <Input id="title" placeholder="Data Structures" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="units">Units</Label>
            <Input id="units" type="number" min="1" max="6" value={units} onChange={(e) => setUnits(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="schedule">Schedule</Label>
            <Input id="schedule" placeholder="MWF 8:00–9:00 AM" value={schedule} onChange={(e) => setSchedule(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="room">Room</Label>
            <Input id="room" placeholder="Room 301" value={room} onChange={(e) => setRoom(e.target.value)} />
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <Button type="submit" className="gap-2">
            <Send className="h-4 w-4" />
            Push to Student Dashboard
          </Button>
        </div>
      </motion.form>

      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-accent" />
            <h2 className="font-heading text-sm font-semibold text-card-foreground">
              Subjects Assigned to Students ({subjects.length})
            </h2>
          </div>
        </div>

        {subjects.length === 0 ? (
          <p className="rounded-lg bg-muted/50 px-4 py-8 text-center text-sm text-muted-foreground">
            No subjects added yet. Add one above to push it to the student dashboard.
          </p>
        ) : (
          <div className="space-y-2">
            {subjects.map((s) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between gap-4 rounded-lg bg-muted/50 px-4 py-3"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-heading text-sm font-bold text-foreground">{s.code}</span>
                    <span className="text-sm text-foreground">{s.title}</span>
                  </div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {s.units} units · {s.schedule} · {s.room} · {s.instructor}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEdit(s)}
                    aria-label={`Edit ${s.code}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteTarget(s)}
                    aria-label={`Remove ${s.code}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Edit dialog */}
      <Dialog open={!!editing} onOpenChange={(open) => !open && closeEdit()}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Subject</DialogTitle>
            <DialogDescription>
              Changes will be reflected on the student's enrollment view after confirmation.
            </DialogDescription>
          </DialogHeader>

          {draft && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="edit-code">Subject Code</Label>
                <Input
                  id="edit-code"
                  value={draft.code}
                  onChange={(e) => setDraft({ ...draft, code: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-units">Units</Label>
                <Input
                  id="edit-units"
                  type="number"
                  min="1"
                  max="6"
                  value={draft.units}
                  onChange={(e) => setDraft({ ...draft, units: e.target.value })}
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="edit-title">Subject Title</Label>
                <Input
                  id="edit-title"
                  value={draft.title}
                  onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-schedule">Schedule</Label>
                <Input
                  id="edit-schedule"
                  value={draft.schedule}
                  onChange={(e) => setDraft({ ...draft, schedule: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-room">Room</Label>
                <Input
                  id="edit-room"
                  value={draft.room}
                  onChange={(e) => setDraft({ ...draft, room: e.target.value })}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={closeEdit}>
              Cancel
            </Button>
            <Button onClick={requestSave} className="gap-2">
              <Check className="h-4 w-4" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm save */}
      <AlertDialog open={confirmEditOpen} onOpenChange={setConfirmEditOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm changes?</AlertDialogTitle>
            <AlertDialogDescription>
              {draft && editing && (
                <>
                  Update <strong>{editing.code}</strong> to{" "}
                  <strong>{draft.code.toUpperCase()} — {draft.title}</strong> ({draft.units} units,{" "}
                  {draft.schedule || "TBA"}, {draft.room || "TBA"})? This will sync immediately to
                  the student dashboard.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSave}>Confirm Update</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirm delete */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove subject?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget && (
                <>
                  This will remove <strong>{deleteTarget.code} — {deleteTarget.title}</strong> from
                  the student's enrollment.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteTarget) {
                  removeSubject(deleteTarget.id);
                  toast.success(`${deleteTarget.code} removed from student dashboard`);
                  setDeleteTarget(null);
                }
              }}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
