import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, Shield } from "lucide-react";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Acceso · Bearkits" },
      {
        name: "description",
        content: "Inicia sesión con Google, correo o contraseña en Bearkits.",
      },
    ],
  }),
  component: LoginPage,
});

const authErrorMessage = (error: unknown) => {
  const message = error instanceof Error ? error.message : "No se pudo completar el acceso.";

  if (message.includes("auth/invalid-credential")) return "Email o contraseña incorrectos.";
  if (message.includes("auth/email-already-in-use")) return "Ese email ya tiene una cuenta.";
  if (message.includes("auth/weak-password"))
    return "La contraseña debe tener al menos 6 caracteres.";
  if (message.includes("auth/popup-closed-by-user"))
    return "Cerraste la ventana de Google antes de terminar.";

  return message;
};

function LoginPage() {
  const navigate = useNavigate();
  const { signInWithGoogle, signInWithEmailPassword, createAccountWithEmailPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState<"google" | "signin" | "signup" | null>(null);

  const finishAuth = () => {
    toast.success("¡Bienvenido a Bearkits!");
    navigate({ to: "/" });
  };

  const google = async () => {
    setLoading("google");
    try {
      await signInWithGoogle();
      finishAuth();
    } catch (error) {
      toast.error(authErrorMessage(error));
    } finally {
      setLoading(null);
    }
  };

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading("signin");
    try {
      await signInWithEmailPassword(email, password);
      finishAuth();
    } catch (error) {
      toast.error(authErrorMessage(error));
    } finally {
      setLoading(null);
    }
  };

  const signUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading("signup");
    try {
      await createAccountWithEmailPassword(name, email, password);
      finishAuth();
    } catch (error) {
      toast.error(authErrorMessage(error));
    } finally {
      setLoading(null);
    }
  };

  return (
    <main className="min-h-[80vh] bg-hero py-16">
      <div className="mx-auto w-full max-w-md px-4">
        <div className="rounded-lg border border-border bg-card p-8 shadow-elegant">
          <div className="mb-6 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-sm bg-primary text-primary-foreground">
              <Shield className="h-6 w-6" />
            </div>
            <h1 className="mt-3 font-display text-3xl tracking-wider">ACCESO BEARKITS</h1>
            <p className="text-sm text-muted-foreground">
              Entra con Google o con tu correo y contraseña
            </p>
          </div>

          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Entrar</TabsTrigger>
              <TabsTrigger value="signup">Registro</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={signIn} className="mt-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pass">Contraseña</Label>
                  <Input
                    id="pass"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button type="submit" className="h-11 w-full" disabled={loading !== null}>
                  {loading === "signin" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Iniciar sesión"
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={signUp} className="mt-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre</Label>
                  <Input
                    id="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email2">Email</Label>
                  <Input
                    id="email2"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pass2">Contraseña</Label>
                  <Input
                    id="pass2"
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button type="submit" className="h-11 w-full" disabled={loading !== null}>
                  {loading === "signup" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Crear cuenta"
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="my-6 flex items-center gap-2">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs uppercase tracking-wider text-muted-foreground">o</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <Button
            variant="outline"
            className="h-11 w-full gap-3"
            onClick={google}
            disabled={loading !== null}
          >
            {loading === "google" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <span className="grid h-5 w-5 place-items-center rounded-full border border-border text-xs font-bold text-primary">
                G
              </span>
            )}
            Continuar con Google
          </Button>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            Usamos Firebase Authentication para proteger el inicio de sesión.
          </p>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            <Link to="/" className="hover:text-foreground">
              ← Volver a la tienda
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
