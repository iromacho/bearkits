import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  createAccountWithEmailPassword,
  signInWithEmailPassword,
  signInWithGoogle,
  signOutOfFirebase,
  watchFirebaseAuth,
  type BearkitsFirebaseUser,
} from "@/integrations/firebase";

type AuthCtx = {
  user: BearkitsFirebaseUser | null;
  session: null;
  isAdmin: boolean;
  loading: boolean;
  signInWithGoogle: () => Promise<BearkitsFirebaseUser>;
  signInWithEmailPassword: (email: string, password: string) => Promise<BearkitsFirebaseUser>;
  createAccountWithEmailPassword: (
    name: string,
    email: string,
    password: string,
  ) => Promise<BearkitsFirebaseUser>;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

const adminEmails = [
  "osoatleti@gmail.com",
  ...(import.meta.env.VITE_FIREBASE_ADMIN_EMAILS ?? "").split(","),
]
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<BearkitsFirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let mounted = true;

    watchFirebaseAuth((firebaseUser) => {
      if (!mounted) return;
      setUser(firebaseUser);
      setLoading(false);
    })
      .then((unsub) => {
        if (mounted) unsubscribe = unsub;
        else unsub();
      })
      .catch((error) => {
        console.error("[Firebase] No se pudo iniciar Auth", error);
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
      unsubscribe?.();
    };
  }, []);

  const isAdmin = !!user?.email && adminEmails.includes(user.email.toLowerCase());

  const value = useMemo<AuthCtx>(
    () => ({
      user,
      session: null,
      isAdmin,
      loading,
      signInWithGoogle,
      signInWithEmailPassword,
      createAccountWithEmailPassword,
      signOut: signOutOfFirebase,
    }),
    [user, isAdmin, loading],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be used inside AuthProvider");
  return c;
}
