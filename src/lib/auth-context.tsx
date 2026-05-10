import { createContext, useContext, useState, type ReactNode } from "react";

export type UserRole = "student" | "faculty" | "finance" | "admin" | "registrar";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  login: (role: UserRole) => void;
  loginAs: (user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const DEMO_USERS: Record<UserRole, User> = {
  student: { id: "1", name: "Juan Dela Cruz", email: "juan@bwest.edu.ph", role: "student" },
  faculty: { id: "2", name: "Dr. Maria Santos", email: "maria@bwest.edu.ph", role: "faculty" },
  finance: { id: "3", name: "Ana Reyes", email: "ana@bwest.edu.ph", role: "finance" },
  admin: { id: "4", name: "Admin User", email: "admin@bwest.edu.ph", role: "admin" },
  registrar: { id: "5", name: "Rosa Mendoza", email: "rosa@bwest.edu.ph", role: "registrar" },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (role: UserRole) => {
    setUser(DEMO_USERS[role]);
  };

  const loginAs = (u: User) => {
    setUser(u);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, loginAs, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
