import { useEffect, useState, useCallback } from "react";

export interface Subject {
  id: string;
  code: string;
  title: string;
  units: number;
  schedule: string;
  room: string;
  instructor: string;
  addedAt: number;
}

const STORAGE_KEY = "bwest:student-subjects";
const EVENT = "bwest:subjects-changed";

function read(): Subject[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Subject[]) : [];
  } catch {
    return [];
  }
}

function write(subjects: Subject[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(subjects));
  window.dispatchEvent(new CustomEvent(EVENT));
}

export function addSubject(subject: Omit<Subject, "id" | "addedAt">): Subject {
  const next: Subject = {
    ...subject,
    id: crypto.randomUUID(),
    addedAt: Date.now(),
  };
  write([...read(), next]);
  return next;
}

export function removeSubject(id: string) {
  write(read().filter((s) => s.id !== id));
}

export function updateSubject(
  id: string,
  patch: Partial<Omit<Subject, "id" | "addedAt">>,
) {
  write(read().map((s) => (s.id === id ? { ...s, ...patch } : s)));
}

export function useSubjects() {
  const [subjects, setSubjects] = useState<Subject[]>(() => read());

  const refresh = useCallback(() => setSubjects(read()), []);

  useEffect(() => {
    const onChange = () => refresh();
    window.addEventListener(EVENT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(EVENT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, [refresh]);

  return subjects;
}
