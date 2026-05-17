import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  signInWithGoogle,
  signOutOfFirebase,
  watchFirebaseAuth,
  type BearkitsFirebaseUser,
} from "@/integrations/firebase";
import { supabase } from "@/integrations/supabase/client";

type AuthProviderName = "firebase" | "supabase";

export type BearkitsUser = BearkitsFirebaseUser & {
  provider: AuthProviderName;
};

type AuthCtx = {
  user: BearkitsUser | null;
  session: null;
  isAdmin: boolean;
  loading: boolean;
  signInWithGoogle: () => Promise<BearkitsUser>;
  sendEmailVerificationCode: (email: string) => Promise<void>;
  verifyEmailCode: (email: string, code: string) => Promise<BearkitsUser>;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

const adminEmails = (import.meta.env.VITE_FIREBASE_ADMIN_EMAILS ?? "osoatleti@gmail.com")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

const withProvider = (user: BearkitsFirebaseUser, provider: AuthProviderName): BearkitsUser => ({
  ...user,
  provider,
});

const mapSupabaseUser = (user: {
  id: string;
  email?: string | null;
  user_metadata?: { full_name?: string; name?: string; avatar_url?: string } | null;
}): BearkitsUser => ({
  id: user.id,
  uid: user.id,
  email: user.email ?? null,
  displayName: user.user_metadata?.full_name ?? user.user_metadata?.name ?? null,
  photoURL: user.user_metadata?.avatar_url ?? null,
  provider: "supabase",
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<BearkitsUser | null>(null);
  const [emailUser, setEmailUser] = useState<BearkitsUser | null>(null);
  const [firebaseLoading, setFirebaseLoading] = useState(true);
  const [supabaseLoading, setSupabaseLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let mounted = true;

    watchFirebaseAuth((user) => {
      if (!mounted) return;
      setFirebaseUser(user ? withProvider(user, "firebase") : null);
      setFirebaseLoading(false);
    })
      .then((unsub) => {
        if (mounted) unsubscribe = unsub;
        else unsub();
      })
      .catch((error) => {
        console.error("[Firebase] No se pudo iniciar Auth", error);
        if (mounted) setFirebaseLoading(false);
      });

    return () => {
      mounted = false;
      unsubscribe?.();
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!mounted) return;
        setEmailUser(data.session?.user ? mapSupabaseUser(data.session.user) : null);
        setSupabaseLoading(false);
      })
      .catch((error) => {
        console.error("[Supabase] No se pudo iniciar Auth", error);
        if (mounted) setSupabaseLoading(false);
      });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setEmailUser(session?.user ? mapSupabaseUser(session.user) : null);
      setSupabaseLoading(false);
    });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const user = firebaseUser ?? emailUser;
  const loading = firebaseLoading || supabaseLoading;
  const isAdmin = !!user?.email && adminEmails.includes(user.email.toLowerCase());

  const sendEmailVerificationCode = async (rawEmail: string) => {
    const email = rawEmail.trim().toLowerCase();
    if (!email) throw new Error("Introduce tu correo electrónico.");

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
      },
    });

    if (error) throw error;
  };

  const verifyEmailCode = async (rawEmail: string, rawCode: string) => {
    const email = rawEmail.trim().toLowerCase();
    const token = rawCode.trim().replace(/\s/g, "");

    if (!email) throw new Error("Introduce tu correo electrónico.");
    if (!token) throw new Error("Introduce el código de verificación.");

    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email",
    });

    if (error) throw error;
    if (!data.user) throw new Error("No se pudo verificar el código.");

    const verifiedUser = mapSupabaseUser(data.user);
    setEmailUser(verifiedUser);
    return verifiedUser;
  };

  const signOut = async () => {
    const results = await Promise.allSettled([signOutOfFirebase(), supabase.auth.signOut()]);
    const rejected = results.find((result) => result.status === "rejected");
    if (rejected?.status === "rejected") throw rejected.reason;
  };

  const value = useMemo<AuthCtx>(
    () => ({
      user,
      session: null,
      isAdmin,
      loading,
      signInWithGoogle: async () => withProvider(await signInWithGoogle(), "firebase"),
      sendEmailVerificationCode,
      verifyEmailCode,
      signOut,
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
